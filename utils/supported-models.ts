export const supportedModels = [
  { label: "GPT 5 Nano", name: "gpt-5-nano", for: "ALL", protocol: "openai" },
  { label: "Nemotron 3 Super Free", name: "nemotron-3-super-free", for: "ALL", protocol: "openai-compatible" },
  { label: "Hy3 Preview Free", name: "hy3-preview-free", for: "ALL", protocol: "openai-compatible" },
  { label: "GPT 5.4 Mini", name: "gpt-5.4-mini", for: "AUTHENTICATED", protocol: "openai" },
  { label: "GPT 5", name: "gpt-5", for: "AUTHENTICATED", protocol: "openai" },
  { label: "GPT 5.5", name: "gpt-5.5", for: "AUTHENTICATED", protocol: "openai" },
  { label: "Claude Haiku 4.5", name: "claude-haiku-4-5", for: "AUTHENTICATED", protocol: "anthropic" },
  { label: "Claude Sonnet 4.6", name: "claude-sonnet-4-6", for: "AUTHENTICATED", protocol: "anthropic" },
  { label: "Claude Opus 4.7", name: "claude-opus-4-7", for: "AUTHENTICATED", protocol: "anthropic" },
  { label: "Kimi K2.6", name: "kimi-k2.6", for: "AUTHENTICATED", protocol: "openai-compatible" },
  { label: "GLM 5.1", name: "glm-5.1", for: "AUTHENTICATED", protocol: "openai-compatible" },
  { label: "MiniMax M2.7", name: "minimax-m2.7", for: "AUTHENTICATED", protocol: "openai-compatible" },
  { label: "Gemini 3 Flash", name: "gemini-3-flash", for: "AUTHENTICATED", protocol: "google" },
] as const;

export type Model = (typeof supportedModels)[number]["name"];

export type ModelProtocol = (typeof supportedModels)[number]["protocol"];

export function getSupportedModel(model: string) {
  return supportedModels.find((supportedModel) => supportedModel.name === model);
}
