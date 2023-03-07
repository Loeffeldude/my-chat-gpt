import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  safeStorage,
  dialog,
} from "electron";
import { release } from "node:os";
import { join } from "node:path";
import Store from "electron-store";
import fs from "fs/promises";
import type { Chat } from "../../src/features/chat/types";
// The built directory structure
//
process.env.DIST_ELECTRON = join(__dirname, "../");
process.env.DIST = join(process.env.DIST_ELECTRON, "../dist");
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, "../public")
  : process.env.DIST;

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId(app.getName());

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win: BrowserWindow | null = null;
// Here, you can also use other preload
const preload = join(__dirname, "../preload/index.js");
const url = process.env.VITE_DEV_SERVER_URL;
const indexHtml = join(process.env.DIST, "index.html");

const store = new Store();

async function createWindow() {
  win = new BrowserWindow({
    title: "Main window",
    icon: join(process.env.PUBLIC, "favicon.ico"),
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: true,
    },
  });
  win.removeMenu();
  if (process.env.VITE_DEV_SERVER_URL) {
    // electron-vite-vue#298
    win.loadURL(url);
    // Open devTool if the app is not packaged
    win.webContents.openDevTools();
  } else {
    win.webContents.openDevTools();
    win.loadFile(indexHtml);
  }

  // Make all links open with the browser, not with the application
  // win.webContents.setWindowOpenHandler(({ url }) => {
  //   if (url.startsWith("https:")) shell.openExternal(url);
  //   return { action: "deny" };
  // });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  win = null;
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) {
    allWindows[0].focus();
  } else {
    createWindow();
  }
});

async function saveChat(
  event: Electron.IpcMainInvokeEvent,
  id: string,
  chat: Chat
) {
  const dir = app.getPath("userData");
  const path = join(dir, "chats", `${id}.json`);
  // Create the directory if it doesn't exist
  await fs.mkdir(join(dir, "chats"), { recursive: true });
  await fs.writeFile(path, JSON.stringify(chat));
}

async function getChats() {
  const appDir = app.getPath("userData");
  const path = join(appDir, "chats");
  // Create the directory if it doesn't exist
  await fs.mkdir(path, { recursive: true });

  // loop through the files in the directory
  const chatDir = await fs.readdir(path);

  const chats: Promise<Chat | null>[] = chatDir.map(async (file) => {
    const stat = await fs.stat(join(path, file));

    if (!file.endsWith(".json") || !stat.isFile()) {
      return null;
    }

    const fileContent = fs.readFile(join(path, file), "utf8");
    const chat = JSON.parse(await fileContent);

    return chat;
  });

  return (await Promise.allSettled(chats))
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((chat) => chat !== null);
}

ipcMain.handle("chat:save", saveChat);
ipcMain.handle("chat:getAll", getChats);

ipcMain.handle("chat:delete", async (_, id: string) => {
  const dir = app.getPath("userData");
  const path = join(dir, "chats", `${id}.json`);
  console.log(path);

  const fileExists = await fs
    .stat(path)
    .then((stat) => stat.isFile())
    .catch(() => false);

  if (!fileExists) return;

  await fs.rm(path, { force: true });
});

ipcMain.handle("apikey:get", () => {
  const encrypedKey: string | null = store.get("apiKey", null) as string | null;

  if (!encrypedKey) return null;

  return safeStorage.decryptString(Buffer.from(encrypedKey, "utf-8"));
});

ipcMain.handle("apikey:set", (_, key: string) => {
  const encrypedKey = safeStorage.encryptString(key);
  store.set("apiKey", encrypedKey);
});

ipcMain.handle("messagebox:confirm", (_, message: string) => {
  return new Promise((resolve) => {
    const options = {
      type: "question",
      buttons: ["Yes", "No"],
      defaultId: 1,
      title: "Confirm",
      message,
    };

    if (!win) return resolve(false);

    dialog.showMessageBox(win, options).then((result) => {
      resolve(result.response === 0);
    });
  });
});
