import { Middleware, configureStore } from "@reduxjs/toolkit";
import { settingSlice } from "./features/settings";
import { API_KEY } from "./lib/api/openai";
import { chatsSlice } from "./features/chat";
import { Chat, chatSchema } from "./features/chat/types";
import { toastSlice } from "./features/toasts";

const LS_STATE_KEY = "state";

type LocalStorageState = {
  settings: Omit<RootState["settings"], "apiKey">;
};

const stateToLocalState = (state: RootState): LocalStorageState => {
  return {
    settings: {
      maxTokens: state.settings.maxTokens,
      preamble: state.settings.preamble,
      shiftSend: state.settings.shiftSend,
    },
  };
};

const storageMiddleware: Middleware<{}> = (store) => (next) => (action) => {
  const result: RootState = store.getState();

  if (action.type.startsWith("settings/")) {
    const localState = stateToLocalState(result);
    localStorage.setItem(LS_STATE_KEY, JSON.stringify(localState));
  }
  return next(action);
};

const getInitalState = async () => {
  try {
    const localStateJson = localStorage.getItem(LS_STATE_KEY);
    if (localStateJson) {
      const localState = JSON.parse(localStateJson);
      const chats: Chat[] = await window.electronAPI.getChats();
      const chatRecord = chats.reduce<Record<string, Chat>>((acc, chat) => {
        const parse = chatSchema.safeParse(chat);
        console.log(chat);
        if (parse.success) {
          acc[chat.id] = parse.data;
        } else {
          console.error("Error parsing chat:", parse.error);
        }

        return acc;
      }, {});

      return {
        chats: {
          chats: chatRecord,
          activeId: chats.length > 0 ? chats[0].id : null,
        },
        settings: { ...localState.settings, apiKey: API_KEY },
      };
    }
  } catch (e) {
    console.error("Error loading state from local storage:", e);
  }
  return undefined;
};

const initalState = await getInitalState();

export const STORE = configureStore({
  reducer: {
    chats: chatsSlice.reducer,
    settings: settingSlice.reducer,
    toasts: toastSlice.reducer,
  },
  preloadedState: initalState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {},
      },
    }).concat(storageMiddleware),
});
export type RootState = ReturnType<typeof STORE.getState>;
export type AppDispatch = typeof STORE.dispatch;
