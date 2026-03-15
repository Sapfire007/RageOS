const CORRUPTION_RULES: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bstud(y|ying|ied)\b/gi, replacement: 'professionally procrastinat$1' },
  { pattern: /\blearn(ing|ed)?\b/gi, replacement: 'pretend$1 to learn' },
  { pattern: /\bpractice\b/gi, replacement: 'avoid' },
  { pattern: /\bgood grades?\b/gi, replacement: 'accept unemployment gracefully' },
  { pattern: /\bhigh marks?\b/gi, replacement: 'survive academically' },
  { pattern: /\btomorrow\b/gi, replacement: 'never (statistically)' },
  { pattern: /\bnext week\b/gi, replacement: 'sometime before death' },
  { pattern: /\bsoon\b/gi, replacement: 'eventually maybe' },
  { pattern: /\bfocus\b/gi, replacement: 'scroll social media' },
  { pattern: /\bconcentrate\b/gi, replacement: 'doom-scroll' },
  { pattern: /\bwork hard\b/gi, replacement: 'barely survive' },
  { pattern: /\bgrind\b/gi, replacement: 'pretend to grind' },
  { pattern: /\bproductive\b/gi, replacement: 'delusional' },
  { pattern: /\befficient\b/gi, replacement: 'temporarily caffeinated' },
  { pattern: /\bmotivated\b/gi, replacement: 'temporarily caffeinated' },
  { pattern: /\binspired\b/gi, replacement: 'mildly awake' },
  { pattern: /\bsuccessful\b/gi, replacement: 'financially surviving' },
  { pattern: /\bimprove\b/gi, replacement: 'stagnate with style' },
]

export function corruptNote(originalText: string): string {
  let corrupted = originalText

  for (const rule of CORRUPTION_RULES) {
    corrupted = corrupted.replace(rule.pattern, rule.replacement)
  }

  if (Math.random() > 0.5) {
    const prefixes = [
      'Translation: ',
      'What you really mean: ',
      'Realistically: ',
      'In reality: ',
      "Let's be honest: ",
    ]
    corrupted = prefixes[Math.floor(Math.random() * prefixes.length)] + corrupted
  }

  return corrupted
}
