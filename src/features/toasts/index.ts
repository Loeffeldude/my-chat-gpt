import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { API_KEY } from "@src/lib/api/openai";
import { Toast, ToastState } from "./types";
import { v4 as uuid } from "uuid";
import { createToast } from "./thunks";

const initialState: ToastState = {
  toasts: {},
};

// Reducer
export const toastSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    pushToast: (state, payload: PayloadAction<{ toast: Toast }>) => {
      state.toasts[payload.payload.toast.id] = payload.payload.toast;
    },
    setShowing: (
      state,
      payload: PayloadAction<{ id: string; showing: boolean }>
    ) => {
      state.toasts[payload.payload.id]._showing = payload.payload.showing;
    },
    removeToast: (state, payload: PayloadAction<{ id: string }>) => {
      delete state.toasts[payload.payload.id];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(createToast.fulfilled, (state, payload) => {
      delete state.toasts[payload.payload];
    });
  },
});

export const toastReducer = toastSlice.reducer;
