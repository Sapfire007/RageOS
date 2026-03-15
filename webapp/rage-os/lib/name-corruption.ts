export function corruptName(originalName: string): string {
  const corruptionTypes = [
    'fileExtension',
    'betaPrefix',
    'suspiciousPrefix',
    'dyslexic',
    'numberSuffix',
    'errorPrefix',
  ]
  const type = corruptionTypes[Math.floor(Math.random() * corruptionTypes.length)]

  switch (type) {
    case 'fileExtension':
      return originalName + ['.exe', '.dll', '.bat', '.sys'][Math.floor(Math.random() * 4)]
    case 'betaPrefix':
      return 'beta_' + originalName
    case 'suspiciousPrefix':
      return 'suspicious_' + originalName
    case 'dyslexic':
      return shuffleMiddleChars(originalName)
    case 'numberSuffix':
      return originalName + [404, 500, 403, 666][Math.floor(Math.random() * 4)]
    case 'errorPrefix':
      return 'ERROR_' + originalName.toUpperCase()
    default:
      return originalName
  }
}

function shuffleMiddleChars(str: string): string {
  if (str.length < 4) return str
  const first = str[0]
  const last = str[str.length - 1]
  const middle = str.slice(1, -1).split('')
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[middle[i], middle[j]] = [middle[j], middle[i]]
  }
  return first + middle.join('') + last
}
