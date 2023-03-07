import { ChatView } from "@src/components/chat/Chat";
import { switchChat } from "@src/features/chat";
import { useAppDispatch, useAppSelector } from "@src/lib/hooks/redux";
import { useParams, Navigate } from "react-router-dom";

export function ChatPage() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const chatId = params.chatId;

  if (!chatId) {
    dispatch(switchChat({ id: null }));
    return <Navigate to={"/"} />;
  }

  const chat = useAppSelector((state) => state.chats.chats[chatId]);

  if (!chat) {
    dispatch(switchChat({ id: null }));
    return <Navigate to={"/"} />;
  }

  return <ChatView chat={chat} />;
}
