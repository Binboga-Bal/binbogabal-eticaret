import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY tanımlı değil. .env dosyanıza ekleyin.");
  }
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export function isAiEnabled(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export const AI_MODEL = "claude-sonnet-4-6";
export const AI_MAX_TOKENS = 2048;
