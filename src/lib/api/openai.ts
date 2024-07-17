import {
  Configuration,
  CreateChatCompletionRequest,
  OpenAIApiAxiosParamCreator,
  ChatCompletionResponseMessage,
  ChatCompletionResponseMessageRoleEnum,
  ChatCompletionRequestMessage,
} from "openai";
import { encode } from "./gpt-encoder";
import { ChatMessage, SYSTEM } from "@src/features/chat/types";
import { getStorage } from "../storage";

export const API_KEY = await getStorage().getApiKey();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const chunkArray = <T>(array: T[], size: number): T[][] => {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
};

export class ChatCompletionError extends Error {
  response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.name = "ChatCompletionError";
    this.response = response;
  }
}

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
    throw new ChatCompletionError("Failed to fetch", res);
  }

  if (!res.body) {
    throw new ChatCompletionError("No body", res);
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

    for (const line of lines.slice(0, -1)) {
      const message = line.replace(/^data: /, "");
      if (!message) {
        continue;
      }

      if (message === "[DONE]") {
        return;
      }
      console.log(message);
      const chunk = JSON.parse(message) as ChatCompletionChunk;
      const chunkChoice = chunk.choices[0];

      if (chunkChoice.delta.role) {
        resultMessage = {
          content: undefined,
          role: chunkChoice.delta.role,
        };
      }
      const newContent = chunkChoice.delta.content;

      if (newContent) {
        // we print 5 words at a time
        for (const contentChunk of chunkArray(newContent.split(" "), 40)) {
          const content = contentChunk.join(" ");
          resultMessage = {
            ...resultMessage,
            content: (resultMessage.content ?? "") + content,
          };
          // just for nicer typing flow:
          await sleep(10);

          yield resultMessage;
        }
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
export const trunctateChat = (messages: ChatMessage[], limit: number) => {
  const indexMapped = messages.map((message, i) => {
    return {
      ...message,
      index: i,
    };
  });
  // remove as little messages as possible always include system messages
  const shouldPersist = (message: ChatMessage) =>
    message.role === SYSTEM || !!message.isImportant;

  const toPersistMessages = indexMapped.filter(shouldPersist);

  // Reference: Deep dive counting tokens
  // https://platform.openai.com/docs/guides/chat/introduction
  const countTokens = (message: ChatCompletionRequestMessage) => {
    let numTokens = 0;
    if (!message.content) {
      return numTokens;
    }
    numTokens += encode(message.content).length;
    numTokens += encode(message.role).length;
    numTokens += 4; // every message follows <im_start>{role/name}\n{content}<im_end>\n;

    return numTokens;
  };

  let totalTokens = toPersistMessages.reduce(
    (acc, message) => acc + countTokens(message),
    0
  );
  totalTokens += 2; // every message follows <im_start>{role/name}\n{content}<im_end>\n

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

export const prepareHistory = (messages: ChatMessage[], tokenLimit: number) => {
  const history = trunctateChat(messages, tokenLimit).map(
    chatMessageToChatCompletionRequestMessage
  );

  return history;
};
