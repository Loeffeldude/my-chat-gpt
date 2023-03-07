import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { API_KEY } from "@src/lib/api/openai";
import { SettingsState } from "./types";

const initialState: SettingsState = {
  preamble:
    "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.",
  maxTokens: 5,
  shiftSend: true,
  apiKey: API_KEY,
};

// Reducer
export const settingSlice = createSlice({
  name: "dialogue",
  initialState,
  reducers: {
    setPreamble: (state, payload: PayloadAction<{ preamble: string }>) => {
      state.preamble = payload.payload.preamble;
    },
    setApiKey: (state, payload: PayloadAction<{ apiKey: string }>) => {
      state.apiKey = payload.payload.apiKey;

      window.electronAPI.setApiKey(payload.payload.apiKey).catch((e: any) => {
        console.error(e);
      });
    },
    setShiftKey: (state, payload: PayloadAction<{ shiftSend: boolean }>) => {
      state.shiftSend = payload.payload.shiftSend;
    },
  },
});
// Actions
export const { setPreamble, setApiKey, setShiftKey } = settingSlice.actions;

export const dialogueReducer = settingSlice.reducer;
