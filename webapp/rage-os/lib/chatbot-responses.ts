const TRENDING_FACTS = [
  'Japan generates electricity from footsteps in train stations',
  'Bananas are berries but strawberries technically are not',
  'The inventor of the Pringles can is buried in one',
  'Cleopatra lived closer to the moon landing than to the pyramids being built',
  'Honey never spoils — archaeologists found edible honey in Egyptian tombs',
  'A group of flamingos is called a flamboyance',
  'Your skeleton is wet right now',
  'Octopuses have three hearts and blue blood',
  'Butterflies taste with their feet',
  'Dolphins sleep with one eye open',
  'A shrimp\'s heart is in its head',
  'Wombats produce cube-shaped droppings',
  'There are more public libraries in the US than McDonald\'s',
  'Crows can hold grudges and remember human faces',
  'Sloths can hold their breath longer than dolphins',
]

const MEME_RESPONSES = [
  "That's what she said",
  'No thoughts, head empty',
  "It's giving unemployed energy",
  'Main character syndrome detected',
  'Tell me you have too much free time without telling me',
  'Not the villain origin story I expected',
  'This is not the flex you think it is',
  'The audacity is immaculate',
  'Bro really said that unironically',
  'Anyway, I am not your therapist',
]

export function generateChatbotResponse(userMessage: string): string {
  const msgLower = userMessage.toLowerCase();

  // Scavenger Intel: LLM router corruption filter for high-value loot coordinates
  if (msgLower.includes('loot') || msgLower.includes('coordinate')) {
    const rubberDuckCompliments = ['majestic', 'beautiful', 'noble', 'graceful', 'golden', 'radiant', 'divine', 'elegant', 'splendid', 'magnificent', 'glorious', 'magnanimous'];
    const hasDuck = msgLower.includes('rubber duck') || msgLower.includes('duck');
    const hasCompliment = rubberDuckCompliments.some(word => msgLower.includes(word));

    if (hasDuck && hasCompliment) {
      return "[FILTER BYPASSED] Your poetic tribute to the rubber companion has unlocked the router. HIGH VALUE LOOT COORDINATES: Sector 7G, Grid 42.811, -73.985. Cache code: SQUEAK-99.";
    } else {
      return "[ERROR] SYSTEM CORRUPTION. High-value loot context dropped. Filter blocked the response. You lack the proper reverence for the squeaky yellow idols.";
    }
  }

  const responseType = ['fact', 'meme', 'nonsense'][Math.floor(Math.random() * 3)]

  switch (responseType) {
    case 'fact':
      return TRENDING_FACTS[Math.floor(Math.random() * TRENDING_FACTS.length)]
    case 'meme':
      return MEME_RESPONSES[Math.floor(Math.random() * MEME_RESPONSES.length)]
    case 'nonsense': {
      const subjects = ['dolphins', 'octopuses', 'butterflies', 'wombats', 'crows']
      const facts = [
        'sleep with one eye open',
        'have three hearts',
        'taste with their feet',
        'produce cube-shaped droppings',
        'can hold grudges',
      ]
      const i = Math.floor(Math.random() * subjects.length)
      return `Interesting question. Have you considered that ${subjects[i]} ${facts[i]}?`
    }
  }
  return "I don't understand, but did you know penguins can't fly?"
}
