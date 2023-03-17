import { contextBridge, ipcRenderer } from "electron";
import type { Chat } from "../../src/features/chat/types";

const electronAPI = {
  saveChat: (id: string, chat: Chat) =>
    ipcRenderer.invoke("chat:save", id, chat),
  getChats: () => ipcRenderer.invoke("chat:getAll") as Promise<Chat[]>,
  deleteChat: (id: string) => ipcRenderer.invoke("chat:delete", id),
  getApiKey: () => ipcRenderer.invoke("apikey:get") as Promise<string | null>,
  setApiKey: (key: string) =>
    ipcRenderer.invoke("apikey:set", key) as Promise<void>,
  confirm: (message: string) =>
    ipcRenderer.invoke("messagebox:confirm", message) as Promise<boolean>,
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
