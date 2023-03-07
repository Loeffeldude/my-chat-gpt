import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";

import "./index.css";

import { Provider as ReduxProvider } from "react-redux";
import { STORE } from "./store";
import { HashRouter, Route, Routes } from "react-router-dom";
import { SettingsPage } from "./pages/Settings";
import { ChatPage } from "./pages/Chat";
import { ToastContainer } from "./components/Toast";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ReduxProvider store={STORE}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path=":chatId" element={<ChatPage />} />
          </Route>
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </HashRouter>
      <ToastContainer />
    </ReduxProvider>
  </StrictMode>
);
