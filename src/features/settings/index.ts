import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { API_KEY } from "@src/lib/api/openai";
import { SettingsState } from "./types";

const initialState: SettingsState = {
  preamble:
    "The following is a conversation with an AI assistant. The assistant is helpful, creative, clever, and very friendly.",
  maxTokens: 5,
  shiftSend: true,
  showPreamble: false,
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

      window.electronAPI
        .setApiKey(payload.payload.apiKey)
        .catch((e: unknown) => {
          console.error(e);
        });
    },
    setShiftKey: (state, payload: PayloadAction<{ shiftSend: boolean }>) => {
      state.shiftSend = payload.payload.shiftSend;
    },
    setShowPreamble: (state, payload: PayloadAction<{ show: boolean }>) => {
      state.showPreamble = payload.payload.show;
    },
  },
});
// Actions
export const { setPreamble, setApiKey, setShiftKey, setShowPreamble } =
  settingSlice.actions;

export const dialogueReducer = settingSlice.reducer;
