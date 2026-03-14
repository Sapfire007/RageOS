import cv2
import mediapipe as mp
import numpy as np
import time
import asyncio
import websockets
import threading
import json
import base64

# ---------- helper functions ----------
def euclid(a, b):
    return np.linalg.norm(np.array(a) - np.array(b))

def overlay_image_alpha(img, img_overlay, x, y, alpha_mask):
    """Overlay img_overlay on top of img at (x, y) and blend using alpha_mask."""
    h, w = img_overlay.shape[:2]

    if x >= img.shape[1] or y >= img.shape[0]:
        return img
    x_end = min(x + w, img.shape[1])
    y_end = min(y + h, img.shape[0])
    x_start = max(x, 0)
    y_start = max(y, 0)

    overlay_x1 = x_start - x
    overlay_y1 = y_start - y
    overlay_x2 = overlay_x1 + (x_end - x_start)
    overlay_y2 = overlay_y1 + (y_end - y_start)

    roi = img[y_start:y_end, x_start:x_end]
    overlay_region = img_overlay[overlay_y1:overlay_y2, overlay_x1:overlay_x2]
    alpha = alpha_mask[overlay_y1:overlay_y2, overlay_x1:overlay_x2][:, :, np.newaxis]

    blended = (1.0 - alpha) * roi.astype(float) + alpha * overlay_region.astype(float)
    img[y_start:y_end, x_start:x_end] = blended.astype(np.uint8)
    return img

def calculate_mouth_metrics(face_landmarks, img_shape):
    """Calculate all mouth metrics at once."""
    h, w = img_shape[:2]
    
    # Get key landmarks
    top_lip = (int(face_landmarks.landmark[13].x * w), int(face_landmarks.landmark[13].y * h))
    bottom_lip = (int(face_landmarks.landmark[14].x * w), int(face_landmarks.landmark[14].y * h))
    left_mouth = (int(face_landmarks.landmark[61].x * w), int(face_landmarks.landmark[61].y * h))
    right_mouth = (int(face_landmarks.landmark[291].x * w), int(face_landmarks.landmark[291].y * h))
    left_eye = (int(face_landmarks.landmark[33].x * w), int(face_landmarks.landmark[33].y * h))
    right_eye = (int(face_landmarks.landmark[263].x * w), int(face_landmarks.landmark[263].y * h))
    
    # Calculate distances
    mouth_open = euclid(top_lip, bottom_lip)
    mouth_width = euclid(left_mouth, right_mouth)
    face_width = euclid(left_eye, right_eye) + 1e-6
    
    # Calculate ratios
    open_ratio = mouth_open / face_width
    width_ratio = mouth_width / face_width
    
    return {
        'open_ratio': open_ratio,
        'width_ratio': width_ratio,
        'smile_factor': width_ratio,
        'points': {
            'top_lip': top_lip,
            'bottom_lip': bottom_lip,
            'left_mouth': left_mouth,
            'right_mouth': right_mouth
        }
    }

class ExpressionDetector:
    """Manages expression detection with smoothing to prevent flickering."""
    def __init__(self):
        self.current_expression = "thinking"
        self.expression_confidence = 0
        self.confidence_threshold = 0.7  # Need 70% confidence to switch
        self.smoothing_factor = 0.3  # How quickly confidence builds/decays
        self.last_update_time = time.time()
        self.min_time_between_changes = 0.5  # Minimum seconds between expression changes
        
    def detect_expression(self, face_landmarks, img_shape):
        """Detect expression with confidence smoothing."""
        metrics = calculate_mouth_metrics(face_landmarks, img_shape)
        open_ratio = metrics['open_ratio']
        smile_factor = metrics['smile_factor']
        
        # Determine target expression
        if open_ratio > 0.25:  # Mouth is open
            target_expression = "shocked"
        elif smile_factor > 0.55:  # Mouth is wide (smiling)
            target_expression = "smiling"
        else:
            target_expression = "thinking"
        
        # Update confidence
        current_time = time.time()
        time_since_last = current_time - self.last_update_time
        
        if target_expression == self.current_expression:
            # Increase confidence for current expression
            self.expression_confidence = min(1.0, 
                self.expression_confidence + self.smoothing_factor)
        else:
            # Decrease confidence
            self.expression_confidence = max(0,
                self.expression_confidence - self.smoothing_factor)
            
            # Only switch if confident enough AND enough time has passed
            if (self.expression_confidence < 0.2 and 
                time_since_last > self.min_time_between_changes):
                self.current_expression = target_expression
                self.expression_confidence = 0.3  # Start with some confidence
                self.last_update_time = current_time
        
        return self.current_expression, metrics

# ---------- WebSocket server ----------
class _SharedState:
    def __init__(self):
        self.lock = threading.Lock()
        self.frame_jpg: bytes | None = None
        self.meme_jpg: bytes | None = None
        self.expression: str = 'thinking'

_shared = _SharedState()
_ws_clients: set = set()

async def _ws_handler(websocket):
    _ws_clients.add(websocket)
    print(f"[WS] Client connected from {websocket.remote_address}")
    try:
        await websocket.wait_closed()
    finally:
        _ws_clients.discard(websocket)
        print("[WS] Client disconnected")

async def _broadcast_loop():
    while True:
        await asyncio.sleep(1 / 30)  # ~30 fps
        if not _ws_clients:
            continue
        with _shared.lock:
            frame_jpg = _shared.frame_jpg
            meme_jpg  = _shared.meme_jpg
            expression = _shared.expression
        if frame_jpg is None:
            continue
        msg = json.dumps({
            'frame':      base64.b64encode(frame_jpg).decode('ascii'),
            'meme':       base64.b64encode(meme_jpg).decode('ascii') if meme_jpg else None,
            'expression': expression,
        })
        dead = set()
        for ws in list(_ws_clients):
            try:
                await ws.send(msg)
            except Exception:
                dead.add(ws)
        _ws_clients.difference_update(dead)

async def _ws_main():
    async with websockets.serve(_ws_handler, 'localhost', 8765):
        print("[WS] WebSocket server running on ws://localhost:8765")
        await _broadcast_loop()

def _start_ws_server():
    asyncio.run(_ws_main())

_ws_thread = threading.Thread(target=_start_ws_server, daemon=True)
_ws_thread.start()

# ---------- load monkey images ----------
monkey_smile = cv2.imread("./memes/monkeysmiling.jpeg", cv2.IMREAD_UNCHANGED)
monkey_think = cv2.imread("./memes/monkeythinking.jpeg", cv2.IMREAD_UNCHANGED)
monkey_shock = cv2.imread("./memes/shockedmonkey.jpeg", cv2.IMREAD_UNCHANGED)

# Check for required images
if monkey_smile is None or monkey_think is None or monkey_shock is None:
    print("Warning: Some monkey images not found!")
    print(f"Smiling: {'Found' if monkey_smile is not None else 'NOT FOUND'}")
    print(f"Thinking: {'Found' if monkey_think is not None else 'NOT FOUND'}")
    print(f"Shocked: {'Found' if monkey_shock is not None else 'NOT FOUND'}")
    
    # Create fallback images
    def create_fallback_monkey(color, text):
        img = np.zeros((400, 400, 3), dtype=np.uint8)
        img[:] = color
        cv2.putText(img, text, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        return img
    
    if monkey_smile is None:
        monkey_smile = create_fallback_monkey((0, 200, 0), "SMILING")
    if monkey_think is None:
        monkey_think = create_fallback_monkey((200, 200, 0), "THINKING")
    if monkey_shock is None:
        monkey_shock = create_fallback_monkey((0, 0, 200), "SHOCKED")

def split_rgba(img):
    """Return (bgr, alpha_mask_float)."""
    if img.shape[2] == 4:
        bgr = img[:, :, :3]
        alpha = img[:, :, 3].astype(float) / 255.0
    else:
        bgr = img
        alpha = np.ones((img.shape[0], img.shape[1]), dtype=float)
    return bgr, alpha

# Split all images
ms_bgr, ms_alpha = split_rgba(monkey_smile)
mt_bgr, mt_alpha = split_rgba(monkey_think)
mk_bgr, mk_alpha = split_rgba(monkey_shock)

# ---------- MediaPipe setup ----------
mp_face_mesh = mp.solutions.face_mesh
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    max_num_faces=1,
    refine_landmarks=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

# ---------- start webcam ----------
cap = None

print("=" * 50)
print("MONKEY EXPRESSION DETECTOR")
print("=" * 50)
print("\nDetects Facial Expressions:")
print("- Smiling → Smiling Monkey")
print("- Open Mouth → Shocked Monkey")
print("- Neutral → Thinking Monkey")
print("\nControls:")
print("Press 'q' to quit")
print("Press 'o' to toggle overlay mode")
print("Press 's' to save screenshot")
print("Press 'd' to toggle debug info")
print("=" * 50)

# Initialize detector
expression_detector = ExpressionDetector()
overlay_mode = True
show_debug = False

# For FPS calculation
fps_start_time = time.time()
fps_frame_count = 0
fps = 0

while True:
    if len(_ws_clients) == 0:
        if cap is not None:
            cap.release()
            cap = None
            cv2.destroyAllWindows()
            print("No clients connected. Releasing webcam lock...")
        time.sleep(1)
        continue

    if cap is None:
        print("Client connected! Grabbing webcam lock...")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            cap = None
            time.sleep(1)
            continue

    ret, frame = cap.read()
    if not ret:
        print("Can't read frame from webcam. Retrying.")
        cap.release()
        cap = None
        time.sleep(1)
        continue

    # Flip for mirror view
    frame = cv2.flip(frame, 1)
    h, w = frame.shape[:2]
    
    # Create a clean copy for display
    display_frame = frame.copy()
    
    # Convert to RGB for MediaPipe
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Process face
    face_results = face_mesh.process(rgb)
    
    # Default values
    chosen_img = mt_bgr
    chosen_alpha = mt_alpha
    expression_text = "Thinking Monkey"
    metrics = None
    
    # ---------- FACE EXPRESSION DETECTION ----------
    if face_results.multi_face_landmarks:
        face_landmarks = face_results.multi_face_landmarks[0]
        
        # Detect expression with smoothing
        current_expression, metrics = expression_detector.detect_expression(face_landmarks, frame.shape)
        
        # Set image and text based on detected expression
        if current_expression == "shocked":
            chosen_img = mk_bgr
            chosen_alpha = mk_alpha
            expression_text = "SHOCKED! 😲"
        elif current_expression == "smiling":
            chosen_img = ms_bgr
            chosen_alpha = ms_alpha
            expression_text = "SMILING! 😊"
        else:
            chosen_img = mt_bgr
            chosen_alpha = mt_alpha
            expression_text = "THINKING 🤔"
        
        # Draw face mesh if debug is on
        if show_debug and face_landmarks:
            mp_drawing.draw_landmarks(
                image=display_frame,
                landmark_list=face_landmarks,
                connections=mp_face_mesh.FACEMESH_TESSELATION,
                landmark_drawing_spec=None,
                connection_drawing_spec=mp_drawing_styles
                .get_default_face_mesh_tesselation_style()
            )
            
            # Highlight mouth landmarks
            if metrics:
                points = metrics['points']
                for name, point in points.items():
                    cv2.circle(display_frame, point, 3, (0, 255, 0), -1)
                    cv2.putText(display_frame, name, (point[0] + 5, point[1] - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
    
    # ---------- DISPLAY ----------
    if overlay_mode:
        # Overlay monkey on webcam
        overlay_resized = cv2.resize(chosen_img, (w, h), interpolation=cv2.INTER_AREA)
        alpha_resized = cv2.resize(chosen_alpha, (w, h), interpolation=cv2.INTER_AREA)
        output = overlay_image_alpha(display_frame.copy(), overlay_resized, 0, 0, alpha_resized)
        
        # Add expression text with background
        text_size = cv2.getTextSize(expression_text, cv2.FONT_HERSHEY_SIMPLEX, 1.3, 3)[0]
        cv2.rectangle(output, (15, 15), (25 + text_size[0], 25 + text_size[1]), (0, 0, 0, 150), -1)
        cv2.putText(output, expression_text, (20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.3, (255, 255, 255), 3)
        
        # Add confidence bar
        conf_width = int(200 * expression_detector.expression_confidence)
        cv2.rectangle(output, (20, 70), (20 + 200, 80), (100, 100, 100), 1)
        cv2.rectangle(output, (20, 70), (20 + conf_width, 80), (0, 255, 0), -1)
        cv2.putText(output, f"Stability: {expression_detector.expression_confidence:.1%}", 
                    (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
    else:
        # Side-by-side view
        monkey_display = cv2.resize(chosen_img, (w // 2, h))
        combined = np.hstack((display_frame, monkey_display))
        
        # Add separator line
        cv2.line(combined, (w, 0), (w, h), (255, 255, 255), 2)
        
        # Add expression text
        text_size = cv2.getTextSize(expression_text, cv2.FONT_HERSHEY_SIMPLEX, 1.0, 2)[0]
        cv2.rectangle(combined, (w + 10, 15), (w + 20 + text_size[0], 25 + text_size[1]), (0, 0, 0, 150), -1)
        cv2.putText(combined, expression_text, (w + 20, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)
        
        # Add labels
        cv2.putText(combined, "WEBCAM", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(combined, "MONKEY", (w + 20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        output = combined
    
    # Add debug info if enabled
    if show_debug and metrics:
        debug_text = f"Open: {metrics['open_ratio']:.3f}  Smile: {metrics['smile_factor']:.3f}"
        cv2.putText(output, debug_text, (20, h - 60),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    
    # Add FPS and mode info
    fps_frame_count += 1
    if time.time() - fps_start_time >= 1.0:
        fps = fps_frame_count
        fps_frame_count = 0
        fps_start_time = time.time()
    
    # Bottom info bar
    info_y = h - 20
    cv2.putText(output, f"FPS: {fps}", (20, info_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    
    mode_text = "OVERLAY" if overlay_mode else "SIDE-BY-SIDE"
    cv2.putText(output, f"Mode: {mode_text} (Press 'o')", (w - 300, info_y),
                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    if show_debug:
        cv2.putText(output, "DEBUG ON (Press 'd')", (w // 2 - 100, info_y),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
    
    # -------- update WebSocket shared state --------
    _ok, _cam_buf = cv2.imencode('.jpg', display_frame, [cv2.IMWRITE_JPEG_QUALITY, 72])
    _ok2, _meme_buf = cv2.imencode('.jpg', cv2.resize(chosen_img, (240, 240)))
    with _shared.lock:
        if _ok:
            _shared.frame_jpg = bytes(_cam_buf)
        if _ok2:
            _shared.meme_jpg = bytes(_meme_buf)
        _shared.expression = expression_detector.current_expression

    # Show result
    cv2.imshow("Monkey Expression Detector", output)
    
    # Handle key presses
    key = cv2.waitKey(1) & 0xFF
    if key == ord('q'):
        break
    elif key == ord('o'):
        overlay_mode = not overlay_mode
        print(f"Switched to {'OVERLAY' if overlay_mode else 'SIDE-BY-SIDE'} mode")
    elif key == ord('s'):
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"monkey_{timestamp}.jpg"
        cv2.imwrite(filename, output)
        print(f"Saved screenshot as {filename}")
    elif key == ord('d'):
        show_debug = not show_debug
        print(f"Debug info {'ON' if show_debug else 'OFF'}")

# Cleanup
if cap is not None:
    cap.release()
cv2.destroyAllWindows()
if face_mesh:
    face_mesh.close()
if hands:
    hands.close()