import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { getSupportedModel } from "../utils/supported-models";

const ZEN_BASE_URL = "https://opencode.ai/zen/v1";

function getZenApiKey() {
  const apiKey = process.env.OPENCODE_API_KEY;
  if (!apiKey) throw new Error("Missing OPENCODE_API_KEY Convex environment variable.");
  return apiKey;
}

export function zenModel(modelId: string) {
  const model = getSupportedModel(modelId);
  if (!model) throw new Error(`Unsupported model: ${modelId}`);

  const apiKey = getZenApiKey();

  if (model.protocol === "openai") {
    return createOpenAI({ apiKey, baseURL: ZEN_BASE_URL }).responses(model.name);
  }

  if (model.protocol === "anthropic") {
    return createAnthropic({ apiKey, baseURL: ZEN_BASE_URL })(model.name);
  }

  if (model.protocol === "google") {
    return createGoogleGenerativeAI({ apiKey, baseURL: ZEN_BASE_URL })(model.name);
  }

  return createOpenAICompatible({ name: "opencode", apiKey, baseURL: ZEN_BASE_URL })(model.name);
}
