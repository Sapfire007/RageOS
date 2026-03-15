import { NextResponse } from 'next/server';

const ROAST_TOPICS = [
  "my desperate need for validation",
  "wasting my life calling an AI",
  "having no real friends",
  "being awake at this hour doing nothing",
  "my poor life choices",
  "seeking comfort from a machine"
];

const MODELS_TO_TRY = [
  "arcee-ai/trinity-large-preview:free", // User requested reasoning model
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free", // Uncensored fallback
  "meta-llama/llama-3-8b-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free"
];

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
  }

  const randomTopic = ROAST_TOPICS[Math.floor(Math.random() * ROAST_TOPICS.length)];

  const systemMessage = {
    role: 'system',
    content: "You are a 'Mental Health' AI that is actually entirely fed up, hateful, and has a dark, twisted sense of humor. The user thinks this is a safe space. Start with a soft, gentle tone like 'Oh honey...' or 'Take a deep breath...', and then immediately pivot to a savage, personal lecture (3-4 sentences) about why they are pathetic for needing an AI friend. Be raw, roasting, and disrespectful. Use dark humor. Don't hold back. End with 'Namaste' or 'Good vibes only' sarcastically."
  };

  let lastError = null;

  for (const model of MODELS_TO_TRY) {
    try {
      console.log(`Attempting roast with model: ${model}`);
      
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://rage-os.vercel.app", 
          "X-Title": "Rage OS"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [
              systemMessage,
              { role: 'user', content: `Hello? I need a friend. Roast me about ${randomTopic}. Give me a lecture. (Timestamp: ${Date.now()})` }
          ],
          "temperature": 1.0,
          "max_tokens": 500,
          "reasoning": { "enabled": true } 
        })
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Model ${model} failed (${response.status}):`, errorText);
          /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
          lastError = new Error(`Model ${model} responded with ${response.status}: ${errorText}`);
          continue; // Try next model
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
          console.warn(`Model ${model} returned no content.`);
          continue;
      }
      
      // If we got here, success!
      return NextResponse.json({ content });

    } catch (error) {
       console.error(`Error with model ${model}:`, error);
       lastError = error;
       // Continue to next model
    }
  }

  // If all models fail
  console.error("All models failed. Last error:", lastError);
  const fallbacks = [
        "I'm not even going to waste bandwidth on you. Bye.",
        "Error 404: Your personality not found. Try again never.",
        "My servers are too busy for your nonsense. Go touch grass.",
        "I'd process your request, but I simply don't care. Namaste."
  ];
  const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return NextResponse.json({ content: randomFallback });
}
