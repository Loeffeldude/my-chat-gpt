import { RootState } from "@src/store";
import { Chat } from "./types";

export const selectChat =
  (id: string) =>
  (state: RootState): Chat | undefined =>
    state.chats.chats[id];
