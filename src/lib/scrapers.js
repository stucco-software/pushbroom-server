const scrapers = [
  'AI2Bot',
  'anthropic-ai',
  'Applebot-Extended',
  'Bytespider',
  'CCBot',
  'Claude-Web',
  'ClaudeBot',
  'cohere-ai',
  'cohere-training-data-crawler',
  'Diffbot',
  'FacebookBot',
  'Google-Extended',
  'GPTBot',
  'Kangaroo Bot',
  'Meta-ExternalAgent',
  'omgili',
  'PanguBot',
  'Timpibot',
  'Webzio-Extended',
]

export const isScraper = (agent) => scrapers.includes(agent)