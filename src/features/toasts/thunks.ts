import { createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "@src/store";
import { Toast } from "./types";
import { v4 as uuid } from "uuid";
import { toastSlice } from ".";

const FADE_DURATION = 300;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const createToast = createAsyncThunk<
  string,
  Omit<Toast, "id">,
  { state: RootState }
>("toasts/createToast", async (toast, thunkApi) => {
  const id = uuid();

  thunkApi.dispatch(toastSlice.actions.pushToast({ toast: { ...toast, id } }));
  await sleep(FADE_DURATION);
  thunkApi.dispatch(toastSlice.actions.setShowing({ id, showing: true }));
  await sleep(toast.duration - FADE_DURATION * 2);
  thunkApi.dispatch(toastSlice.actions.setShowing({ id, showing: false }));
  await sleep(FADE_DURATION);

  return id;
});

export const removeToast = createAsyncThunk<
  string,
  string,
  { state: RootState }
>("toasts/removeToast", async (id, thunkApi) => {
  thunkApi.dispatch(toastSlice.actions.setShowing({ id, showing: false }));
  await sleep(FADE_DURATION);
  thunkApi.dispatch(toastSlice.actions.removeToast({ id }));

  return id;
});
