// Chaos Engine - extracted from VirusExecutor to make it reusable
type DamageType = 'homework' | 'grade' | 'motivation' | 'procrastination' | 'focus' | 'ambition' | 'sleep' | 'generic'

export function triggerChaosEffect(intensity: number = 1.0) {
    if (typeof window === 'undefined') return () => {};

    const baseRotation = (Math.random() - 0.5) * 20;
    const baseBlur = Math.random() * 2;
    
    // Quick interval for shaking effect
    const interval = setInterval(() => {
        const x = (Math.random() - 0.5) * 50 * intensity
        const y = (Math.random() - 0.5) * 50 * intensity
        const rotation = (Math.random() - 0.5) * 10 * intensity + baseRotation
        const blur = Math.random() * 5 + baseBlur
        const invert = Math.random() > 0.8 ? 1 : 0
        const hue = Math.random() * 360
        
        document.body.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`
        document.body.style.filter = `blur(${blur}px) invert(${invert}) hue-rotate(${hue}deg)`
        
        // Randomly hide elements
        if (Math.random() > 0.9) {
            document.body.style.display = 'none'
            setTimeout(() => document.body.style.display = '', 100)
        }
    }, 100)

    // Return a cleanup function to stop the chaos
    return () => clearInterval(interval);
}

export function applyPermanentDamage(type: DamageType) {
    if (typeof window === 'undefined') return;

    const randomTilt = (Math.random() - 0.5) * 5 + 180; // 180 +/- 2.5 deg for upside down
    
    // Reset any temporary chaos styles first (mostly)
    // We intentionally leave some 'permanent' marks
    
    switch (type) {
        case 'homework':
        case 'grade':
            document.body.style.filter = `invert(${Math.random() > 0.5 ? 1 : 0.9}) contrast(200%)`; 
            document.body.style.transform = `rotate(${randomTilt}deg)`; // Slightly imperfect upside down
            break;
        case 'focus':
        case 'procrastination':
            document.body.style.filter = `blur(${3 + Math.random() * 2}px)`; // Variable blur
            document.body.style.transform = `skewX(${15 + Math.random() * 10}deg)`;
            break;
        case 'sleep':
            // Random darkness or random color shift
            document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) brightness(${30 + Math.random() * 40}%)`; 
            break;
        case 'motivation':
        case 'ambition':
            document.body.style.filter = `grayscale(${90 + Math.random()*10}%) opacity(0.8)`; 
            document.body.style.transform = `scale(${0.7 + Math.random() * 0.2})`; // Variable shrinking
            break;
        default:
            // Generic chaos - Completely random
            document.body.style.transform = `rotate(${(Math.random()-0.5)*10}deg) scale(${0.9 + Math.random()*0.1})`;
            document.body.style.filter = `sepia(100%) hue-rotate(${Math.random() * 90}deg)`; 
    }
}