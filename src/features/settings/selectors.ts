import { RootState } from "@src/store";
import { Configuration, OpenAIApi } from "openai";
import { BASE_PATH as OPENAI_BASE_PATH } from "openai/dist/base";

export const getApiConfiguration = (state: RootState) => {
  if (!state.settings.apiKey) {
    throw new Error("API key not configured");
  }
  return new Configuration({
    apiKey: state.settings.apiKey,
    basePath: OPENAI_BASE_PATH,
  });
};
export const selectApi = (state: RootState) => {
  const config = getApiConfiguration(state);
  return new OpenAIApi(config);
};
