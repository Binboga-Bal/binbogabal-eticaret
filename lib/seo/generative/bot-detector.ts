export interface LlmBotInfo {
  name: string;
  company: string;
  allowed: boolean;
}

const LLM_BOTS: Record<string, LlmBotInfo> = {
  GPTBot: { name: "GPTBot", company: "OpenAI", allowed: true },
  "ChatGPT-User": { name: "ChatGPT-User", company: "OpenAI", allowed: true },
  PerplexityBot: { name: "PerplexityBot", company: "Perplexity", allowed: true },
  ClaudeBot: { name: "ClaudeBot", company: "Anthropic", allowed: true },
  "anthropic-ai": { name: "anthropic-ai", company: "Anthropic", allowed: true },
  "Google-Extended": { name: "Google-Extended", company: "Google", allowed: true },
  Amazonbot: { name: "Amazonbot", company: "Amazon", allowed: true },
  Bytespider: { name: "Bytespider", company: "TikTok/ByteDance", allowed: false },
  CCBot: { name: "CCBot", company: "Common Crawl", allowed: false },
  "cohere-ai": { name: "cohere-ai", company: "Cohere", allowed: true },
  "YouBot": { name: "YouBot", company: "You.com", allowed: true },
};

export function detectLlmBot(userAgent: string): LlmBotInfo | null {
  if (!userAgent) return null;
  for (const [pattern, info] of Object.entries(LLM_BOTS)) {
    if (userAgent.toLowerCase().includes(pattern.toLowerCase())) {
      return info;
    }
  }
  return null;
}

export function isLlmBot(userAgent: string): boolean {
  return detectLlmBot(userAgent) !== null;
}
