import {
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApiAxiosParamCreator,
  ChatCompletionResponseMessage,
  ChatCompletionResponseMessageRoleEnum,
  ChatCompletionRequestMessage,
} from "openai";
import { encode } from "./gpt-encoder";
import { CHATGPT_MAX_TOKENS } from "../constants/openai";
import { ChatMessage, SYSTEM } from "@src/features/chat/types";
import { getStorage } from "../storage";

export const API_KEY = await getStorage().getApiKey();

export type ChatCompletionChunk = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
};

export type ChatCompletionChunkChoice = {
  delta: {
    role?: ChatCompletionResponseMessageRoleEnum;
    content?: string;
  };
  index: number;
  finish_reason: string | null;
};

export type PartialChatCompletionChunk = Partial<ChatCompletionResponseMessage>;

type ParamCreator = ReturnType<typeof OpenAIApiAxiosParamCreator>;
type AxiosParams = Parameters<ParamCreator["createChatCompletion"]>[1];

export async function* streamChatCompletion(
  createChatCompletionRequest: CreateChatCompletionRequest,
  config: Configuration,
  options?: AxiosParams
) {
  // We try to reuse as much of the generated code as possible
  const paramCreator = OpenAIApiAxiosParamCreator(config);

  const axiosParams = await paramCreator.createChatCompletion(
    createChatCompletionRequest,
    options
  );

  // We need to do this because the generated code doesn't support streaming
  const url = config.basePath + axiosParams.url;

  const headers = {
    ...((axiosParams.options.headers as Record<string, string> | undefined) ??
      {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method: axiosParams.options.method,
    headers: headers,
    body: axiosParams.options.data,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  if (!res.body) {
    throw new Error("No body");
  }

  const reader = res.body.getReader();

  let buffer = "";

  let resultMessage: PartialChatCompletionChunk = {
    content: undefined,
    role: undefined,
  };

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    buffer += new TextDecoder().decode(value);
    const lines = buffer.split("\n");

    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (!message) {
        continue;
      }

      if (message === "[DONE]") {
        return;
      }

      const chunk = JSON.parse(message) as ChatCompletionChunk;
      const chunkChoice = chunk.choices[0];

      if (chunkChoice.delta.role) {
        resultMessage = {
          content: undefined,
          role: chunkChoice.delta.role,
        };
      }

      if (chunkChoice.delta.content) {
        resultMessage = {
          ...resultMessage,
          content: (resultMessage.content ?? "") + chunkChoice.delta.content,
        };
      }
      yield resultMessage;
    }

    buffer = lines[lines.length - 1];
  }
}

export const chatMessageToChatCompletionRequestMessage = (
  message: ChatMessage
): ChatCompletionRequestMessage => {
  return {
    content: message.content,
    role: message.role,
  };
};
//TODO: handle the case if there are too many persisted messages
//      right now the app will crash
export const trunctateChat = (
  messages: ChatMessage[],
  limit: number = CHATGPT_MAX_TOKENS
) => {
  const indexMapped = messages.map((message, i) => {
    return {
      ...message,
      index: i,
    };
  });
  const shouldPersist = (message: ChatMessage) =>
    message.role === SYSTEM || !!message.isImportant;

  const toPersistMessages = indexMapped.filter(shouldPersist);
  // remove as little messages as possible always include system messages

  const countTokens = (message: ChatCompletionRequestMessage) =>
    encode(message.content).length;

  let totalTokens = toPersistMessages.reduce(
    (acc, message) => acc + countTokens(message),
    0
  );

  const toIncludeMessages = indexMapped
    .filter((message) => !shouldPersist(message))
    .reverse()
    .filter((message) => {
      totalTokens += countTokens(message);
      return totalTokens < limit;
    });

  // join via the index that was mapped earlier
  return [...toIncludeMessages, ...toPersistMessages]
    .sort((a, b) => a.index - b.index)
    .map<ChatMessage>((message) => {
      const result = {
        ...message,
        index: undefined,
      };
      delete result.index;
      return result;
    });
};

export const prepareHistory = (messages: ChatMessage[]) => {
  const history = trunctateChat(messages).map(
    chatMessageToChatCompletionRequestMessage
  );

  return history;
};
