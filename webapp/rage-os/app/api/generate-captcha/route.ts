import { NextResponse } from 'next/server'

const FALLBACKS = [
  { question: 'What is 9 × 6?', answer: '54' },
  { question: 'How many days are in a week?', answer: '7' },
  { question: 'What is 144 ÷ 12?', answer: '12' },
  { question: 'Complete the sequence: 3, 6, 9, 12, __', answer: '15' },
  { question: 'What is the square root of 81?', answer: '9' },
  { question: 'What is 8 × 7?', answer: '56' },
  { question: 'How many months in a year?', answer: '12' },
  { question: 'What is 100 ÷ 5?', answer: '20' },
  { question: 'What is 15 + 27?', answer: '42' },
  { question: 'How many sides does a hexagon have?', answer: '6' },
]

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json(pick(FALLBACKS))

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 5000)

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://rageos.app',
        'X-OpenRouter-Title': 'RageOS',
      },
      body: JSON.stringify({
        model: 'openrouter/hunter-alpha',
        // No reasoning — keeps response fast
        messages: [
          {
            role: 'user',
            content:
              'Generate ONE simple math or logic CAPTCHA question with a short unambiguous answer. Reply ONLY with valid JSON: {"question":"...","answer":"..."} — no markdown, no explanation.',
          },
        ],
      }),
    })
    clearTimeout(timer)

    const result = await res.json()
    const raw = (result.choices?.[0]?.message?.content ?? '').trim()
    const cleaned = raw.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed.question && parsed.answer) {
      return NextResponse.json({ question: String(parsed.question), answer: String(parsed.answer) })
    }
    throw new Error('bad shape')
  } catch {
    return NextResponse.json(pick(FALLBACKS))
  }
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}
