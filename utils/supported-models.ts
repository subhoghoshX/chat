export const supportedModels = [
  { label: "Nova Lite", name: "bedrock/amazon.nova-lite-v1:0" },
  { label: "Nova Micro", name: "bedrock/amazon.nova-micro-v1:0" },
  { label: "DeepSeek V3", name: "fireworks/deepseek-v3" },
  { label: "DeepSeek R1", name: "groq/deepseek-r1-distill-llama-70b" },
  { label: "Claude 3 Haiku", name: "anthropic/claude-v3-haiku" },
  { label: "Qwen 3", name: "deepinfra/qwen3-14b" },
  { label: "Gemini 2.0 Flash", name: "vertex/gemini-2.0-flash-001" },
  { label: "Llama 4 Maverick", name: "bedrock/meta.llama4-maverick-17b-instruct-v1" },
  { label: "Llama 4 Scout", name: "bedrock/meta.llama4-scout-17b-instruct-v1" },
  { label: "GPT 4o Mini", name: "openai/gpt-4o-mini" },
  { label: "GPT 4.1 Nano", name: "openai/gpt-4.1-nano" },
  { label: "Mistral Saba", name: "groq/mistral-saba-24b" },
] as const;

export type Model = (typeof supportedModels)[number]["name"];
