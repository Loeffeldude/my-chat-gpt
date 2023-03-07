import { contextBridge, ipcRenderer } from "electron";
import type { Chat } from "../../src/features/chat/types";

function domReady(
  condition: DocumentReadyState[] = ["complete", "interactive"]
) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener("readystatechange", () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

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
