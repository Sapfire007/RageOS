import { NextResponse } from 'next/server';

const SPAM_PROMPTS = [
  "You've won a questionable amount of cryptocurrency!",
  "URGENT: Your account has been compromised by a Nigerian prince.",
  "Expand your... career prospects naturally.",
  "Make $50,000 working from home doing absolutely nothing.",
  "Your distant relative just died and left you a castle.",
  "Final Notice: Your warranty has expired (for a car you don't own).",
  "Your boss needs you to buy gift cards immediately."
];

const MODELS_TO_TRY = [
  "google/gemini-pro-1.5:free", // Good for creative text
  "meta-llama/llama-3-8b-instruct:free",
  "mistralai/mistral-7b-instruct:free" // Fast
];

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json({ 
        sender: "Scam Bot 3000",
        subject: "ERROR: API Key Missing",
        body: "I tried to scam you but the server is broke. Please wire transfer $500 to fix it.",
        linkText: "Click to Fix (Virus)"
    });
  }

  const randomPrompt = SPAM_PROMPTS[Math.floor(Math.random() * SPAM_PROMPTS.length)];

  const systemMessage = {
    role: 'system',
    content: `You are an AI that generates hilarious, slightly unhinged spam emails. 
    Output ONLY a JSON object with the following structure:
    {
       "sender": "Name <email@sketchy-domain.com>",
       "subject": "Clickbait subject line",
       "body": "The email body text. Make it sound urgent but ridiculous. Poor grammar is okay. Keep it short (2-3 sentences).",
       "linkText": "The text for the suspicious link/button (e.g. 'CLAIM NOW', 'VERIFY IDENTITY')"
    }
    1. Do not include markdown code blocks. 
    2. Do not include introductory text.
    3. Just the raw JSON.`
  };

  for (const model of MODELS_TO_TRY) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://rage-os.vercel.app", 
          "X-Title": "Rage OS Spam Gen"
        },
        body: JSON.stringify({
          "model": model,
          "messages": [
              systemMessage,
              { role: 'user', content: `Generate a spam email about: ${randomPrompt}` }
          ],
          "temperature": 0.9,
          "max_tokens": 300
        })
      });

      if (!response.ok) {
        console.warn(`Model ${model} failed with ${response.status}`);
        continue;
      }

      const data = await response.json();
      let content = data.choices[0]?.message?.content || "";
      
      // Cleanup markdown if present
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      try {
          const json = JSON.parse(content);
          return NextResponse.json(json);
      } catch (e) {
          console.error("Failed to parse JSON from AI", content);
          continue; // Try next model
      }

    } catch (e) {
      console.error(`Error with model ${model}:`, e);
    }
  }

  // Fallback if all AI fails
  return NextResponse.json({
    sender: "Prince Al-Badr <royal@bank-of-nowhere.com>",
    subject: "URGENT INVESTMENT OPPORTUNITY",
    body: "Dear Beloved Friend, I have 500kg of gold bullion trapped in customs. I need your bank details to release it. You keep 50%. Trust me.",
    linkText: "SEND BANK DETAILS"
  });
}