export const CHATGPT_MODELS = Object.freeze({
  "gpt-3.5-turbo": { label: "GPT-3.5 turbo", tokens: 4096 },
  "gpt-3.5-turbo-16k": { label: "GPT-3.5 turbo 16k", tokens: 16384 },
  "gpt-3.5-turbo-0301": { label: "GPT-3.5 turbo 0301", tokens: 4096 },
  "gpt-4": { label: "GPT-4", tokens: 8192 },
  "gpt-4-0314": { label: "GPT-4 0314", tokens: 8192 },
  "gpt-4-32k": { label: "GPT-4 32k", tokens: 32768 },
  "gpt-4-32k-0314": { label: "GPT-4 32k 0314", tokens: 32768 },
});

export type ChatGPTModel = keyof typeof CHATGPT_MODELS;
