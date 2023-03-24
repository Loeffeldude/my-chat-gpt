import { createAsyncThunk, ThunkAction, AnyAction } from "@reduxjs/toolkit";
import {
  streamChatCompletion,
  prepareHistory,
  ChatCompletionError,
} from "@src/lib/api/openai";
import { RootState } from "@src/store";
import { ChatCompletionRequestMessage } from "openai";
import { chatsSlice } from ".";
import { ASSISTANT, USER, Chat, NEW_CHAT_DEFAULT } from "./types";
import { selectChat } from "./selectors";
import { getApiConfiguration, selectApi } from "../settings/selectors";
import { createToast } from "../toasts/thunks";
import { CHATGPT_MODELS } from "@src/lib/constants/openai";

export const streamCompletion = createAsyncThunk<
  void,
  string,
  { state: RootState }
>("chat/streamCompletion", async (id: string, thunkAPI) => {
  const state = thunkAPI.getState();
  let config: ReturnType<typeof getApiConfiguration> | undefined;
  try {
    config = getApiConfiguration(state);
  } catch (e) {
    thunkAPI.dispatch(
      createToast({
        message: "Please configure your API key in the settings",
        type: "error",
        duration: 3000,
      })
    );

    throw e;
  }
  const chat = selectChat(id)(state);

  if (!chat) {
    throw new Error("Chat not found");
  }
  try {
    const tokenLimit = CHATGPT_MODELS[state.settings.model].tokens;

    const stream = streamChatCompletion(
      {
        model: state.settings.model,
        messages: await prepareHistory(Object.values(chat.history), tokenLimit),
        stream: true,
      },
      config,
      {
        responseType: "stream",
      }
    );

    for await (const chunk of stream) {
      if (!chunk.role) {
        continue;
      }
      const state = thunkAPI.getState();

      if (!state.chats.chats[id].botTyping) {
        // The completion has been aborted
        break;
      }

      thunkAPI.dispatch(
        chatsSlice.actions.typeCompletionMessage({
          id,
          message: chunk,
        })
      );
    }
  } catch (e) {
    if (e instanceof ChatCompletionError) {
      if (e.response.status === 401 || e.response.status === 403) {
        thunkAPI.dispatch(
          createToast({
            message: "Your API key is invalid. Please check your settings",
            type: "error",
            duration: 3000,
          })
        );
        return;
      }
      if (e.response.status === 404) {
        thunkAPI.dispatch(
          createToast({
            message:
              "The model you selected does not exist. Please check your settings",
            type: "error",
            duration: 3000,
          })
        );
        return;
      }
    }

    thunkAPI.dispatch(
      createToast({
        message: "Something went wrong while fetching the completion",
        type: "error",
        duration: 3000,
      })
    );

    throw e;
  }
});

export const fetchSummary = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("chat/fetchSummary", async (id: string, thunkAPI) => {
  const state = thunkAPI.getState();
  const api = selectApi(state);

  const chat = selectChat(id)(state);

  if (!chat) {
    throw new Error("Chat not found");
  }

  const firstAssistantMessage = Object.values(chat.history).find(
    (h) => h.role === ASSISTANT
  );

  if (!firstAssistantMessage) {
    return NEW_CHAT_DEFAULT;
  }
  try {
    const response = await api.createChatCompletion({
      messages: [
        firstAssistantMessage,
        {
          role: USER,
          content: "Summurize this in as little words as possible",
        },
      ],
      model: "gpt-3.5-turbo-0301",
    });
    const summary = response.data.choices[0];
    return summary?.message?.content ?? NEW_CHAT_DEFAULT;
  } catch (e) {
    console.error(e);
    return NEW_CHAT_DEFAULT;
  }
});

export const pushHistory =
  (
    message: ChatCompletionRequestMessage
  ): ThunkAction<void, RootState, unknown, AnyAction> =>
  (dispatch, getState) => {
    const state = getState();
    const activeId = state.chats.activeId;
    if (activeId === null) {
      return;
    }

    const chat = selectChat(activeId)(state);

    if (!chat) {
      throw new Error("Chat not found");
    }

    dispatch(
      chatsSlice.actions.pushHistory({
        chatId: chat.id,
        segment: message,
      })
    );

    if (message.role === USER) {
      dispatch(streamCompletion(chat.id));
    }
  };
