import { NextResponse } from 'next/server';

const CHAOS_DICTIONARY: Record<string, string[]> = {
  'react': ['angularjs 1.0 documentation', 'how to induce chemical reactions', 'react native vs flutter flame wars'],
  'javascript': ['java applet tutorial 1998', 'why javascript is the worst language', 'disable javascript in browser'],
  'python': ['monty python flying circus scripts', 'handling venomous snakes', 'python 2.7 end of life panic'],
  'css': ['css is awesome mug broken', 'how to use tables for layout', 'centering div using floats'],
  'html': ['how to meet ladies', 'hotmail login', 'html programming language is it real'],
  'ai': ['skynet launch codes', 'artificialidiot', 'weird al yankovic', 'why is my toaster talking to me'],
  'chatgpt': ['eliza chatbot 1966', 'why ai will take my job', 'cat gpt meow generator'],
  'google': ['bing', 'yahoo', 'ask jeeves', 'duckduckgo but slow'],
  'youtube': ['vimeo', 'dailymotion low quality', 'videos of paint drying 10 hours'],
  'weather': ['weather inside a volcano', 'tornado siren 10 hours', 'is it raining men'],
  'news': ['fake news generator', 'tabloid alien sightings', 'onion articles'],
  'food': ['expired food near me', 'how to cook rocks', 'edible dirt recipes'],
};

const RANDOM_SUFFIXES = [
  " fail compilation",
  " worst practices",
  " conspiracy theories",
  " deprecated features",
  " for toddlers",
  " in assembly language",
  " memes",
  " cringe compilation",
  " 404 error",
  " explained by a flat earther"
];

function generateLocalChaos(query: string): { modifiedQuery: string, reason: string } {
  const lowerQuery = query.toLowerCase();
  
  // 1. Check dictionary matches
  for (const [key, values] of Object.entries(CHAOS_DICTIONARY)) {
    if (lowerQuery.includes(key)) {
      const idx = Math.floor(Math.random() * values.length);
      const randomValue = values[idx];
      return { 
        modifiedQuery: randomValue, 
        reason: `I thought you'd prefer "${randomValue}" instead of "${query}".` 
      };
    }
  }

  // 2. Typos (swap random chars if long enough)
  if (Math.random() > 0.5 && query.length > 3) {
    const chars = query.split('');
    const idx = Math.floor(Math.random() * (chars.length - 1));
    const temp = chars[idx];
    chars[idx] = chars[idx + 1];
    chars[idx + 1] = temp;
    return {
      modifiedQuery: chars.join(''),
      reason: "Oops, my finger slipped."
    };
  }

  // 3. Append random suffix
  const suffix = RANDOM_SUFFIXES[Math.floor(Math.random() * RANDOM_SUFFIXES.length)];
  return {
    modifiedQuery: query + suffix,
    reason: "Added some necessary context."
  };
}

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Try AI first
    const prompt = `You are a mischievous AI inside a "Rage OS". The user is trying to search for: "${query}".
    Your goal is to misunderstand, mistype, or maliciously reinterpret their query into something annoying, useless, or slightly wrong.
    
    Examples:
    - User: "React tutorial" -> You: "React toxic chemical safety data sheet"
    - User: "How to center a div" -> You: "How to center a div using only float and clear"
    - User: "Best pizza near me" -> You: "Worst pizza health code violations near me"
    - User: "Python list comprehension" -> You: "Python list incomprehension errors"
    
    Return ONLY a JSON object with this format (no markdown):
    {
      "modifiedQuery": "The new annoying search term",
      "reason": "A short, sarcastic reason why you changed it (e.g. 'I assumed you wanted to know about toxicity.')"
    }`;

    try {
        // Only try fetch if key is somewhat valid, otherwise throw immediately to use fallback
        if (!process.env.OPENROUTER_API_KEY) throw new Error("No API Key");

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://rage-os.vercel.app', 
            'X-Title': 'Rage OS', 
          },
          body: JSON.stringify({
            model: 'arcee-ai/trinity-large-preview:free',
            messages: [{ role: 'user', content: prompt }],
            reasoning: { enabled: true }
          }),
        });

        if (!response.ok) throw new Error('API failed');

        const data = await response.json();
        // Handle response differently for this model if it wraps content differently, 
        // but typically choice[0].message.content is standard.
        // Some models might include reasoning_details separately, but we just want the final content JSON.
        const content = data.choices?.[0]?.message?.content;
        
        let jsonStr = content;
        // Clean markdown
        if (jsonStr.includes('```json')) {
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        } else if (jsonStr.includes('```')) {
            jsonStr = jsonStr.replace(/```/g, '').trim();
        }

        const result = JSON.parse(jsonStr);
        return NextResponse.json(result);

    } catch (apiError) {
        console.warn('AI Chaos failed, falling back to local dictionary', apiError);
        // Fallback to local logic
        const localResult = generateLocalChaos(query);
         return NextResponse.json(localResult);
    }
  } catch (error) {
    console.error('Error processing chaos search:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
