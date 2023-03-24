import { Chat } from "@src/features/chat/types";

export abstract class Storage {
  abstract storeChat(chat: Chat): Promise<void>;
  abstract getChats(): Promise<Chat[]>;
  abstract deleteChat(id: string): Promise<void>;
  abstract getApiKey(): Promise<string | null>;
  abstract setApiKey(key: string): Promise<void>;
}

class LocalStorage extends Storage {
  API_KEY_KEY = "apikey";
  CHATS_KEY_PREFIX = "chat_";

  storeChat(chat: Chat): Promise<void> {
    window.localStorage.setItem(
      `${this.CHATS_KEY_PREFIX}${chat.id}`,
      JSON.stringify(chat)
    );
    return Promise.resolve();
  }
  getChats(): Promise<Chat[]> {
    const chats: Chat[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(this.CHATS_KEY_PREFIX)) {
        const chat = JSON.parse(window.localStorage.getItem(key) || "{}");
        chats.push(chat);
      }
    }
    return Promise.resolve(chats);
  }
  deleteChat(id: string): Promise<void> {
    window.localStorage.removeItem(`${this.CHATS_KEY_PREFIX}${id}`);
    return Promise.resolve();
  }
  getApiKey(): Promise<string | null> {
    const key = window.localStorage.getItem(this.API_KEY_KEY);
    return Promise.resolve(key);
  }
  setApiKey(key: string): Promise<void> {
    window.localStorage.setItem(this.API_KEY_KEY, key);
    return Promise.resolve();
  }
}

class ElectronStorage extends Storage {
  storeChat(chat: Chat): Promise<void> {
    return window.electronAPI.saveChat(
      chat.id,
      JSON.parse(JSON.stringify(chat))
    );
  }
  getChats(): Promise<Chat[]> {
    return window.electronAPI.getChats();
  }
  deleteChat(id: string): Promise<void> {
    return window.electronAPI.deleteChat(id);
  }
  getApiKey(): Promise<string | null> {
    return window.electronAPI.getApiKey();
  }
  setApiKey(key: string): Promise<void> {
    return window.electronAPI.setApiKey(key);
  }
}

export function getStorage(): Storage {
  if (window.electronAPI) {
    return new ElectronStorage();
  } else {
    return new LocalStorage();
  }
}
