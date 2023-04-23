import { useAppDispatch, useAppSelector } from "@src/lib/hooks/redux";

import { ChatCompletionResponseMessageRoleEnum } from "openai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatInput, ChatInputProps } from "./ChatInput";
import { ChatMessage } from "./ChatMessage";
import {
  updateDraft,
  deleteMessage,
  editMessage,
  abortCompletion,
  setImportant,
} from "@src/features/chat";
import { pushHistory, streamCompletion } from "@src/features/chat/thunks";
import { Chat } from "@src/features/chat/types";
import { Button } from "../Button";

export type ChatViewProps = {
  chat: Chat;
};

export function ChatView({ chat }: ChatViewProps) {
  const dispatch = useAppDispatch();

  const [sendAsRole, setSendAsRole] =
    useState<ChatCompletionResponseMessageRoleEnum>("user");

  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  const botTyping = useAppSelector(
    (state) => state.chats.chats[chat.id].botTyping
  );
  const botTypingMessage = useAppSelector(
    (state) => state.chats.chats[chat.id].botTypingMessage
  );
  const showPreamble = useAppSelector((state) => state.settings.showPreamble);

  const isHistoryEmpty =
    Object.values(chat.history).filter((message) => !message.isPreamble)
      .length === 0;

  const isLastMessageBot = useMemo(() => {
    const lastMessage = Object.values(chat.history).pop();
    if (!lastMessage) return false;
    return lastMessage.role === "assistant";
  }, [chat.history]);

  const handleChatInput = useCallback<NonNullable<ChatInputProps["onChange"]>>(
    ({ draft, role }) => {
      if (!chat) return;
      dispatch(updateDraft({ id: chat.id, draft: draft }));

      setSendAsRole(role);
    },
    [chat, dispatch]
  );
  const handleChatSubmit = useCallback<NonNullable<ChatInputProps["onSubmit"]>>(
    ({ draft, role }) => {
      if (!chat) return;

      dispatch(pushHistory({ content: draft, role: role }));
      dispatch(updateDraft({ id: chat.id, draft: "" }));
    },
    [chat, dispatch]
  );
  const handleChatAbort = useCallback(() => {
    if (!chat) return;

    dispatch(abortCompletion({ id: chat.id }));
  }, [chat, dispatch]);

  const handleGenerateResponse = useCallback(() => {
    if (!chat) return;

    if (isLastMessageBot) {
      // Remove the last message by the bot and generate a new one
      const lastMessage = Object.values(chat.history).pop();
      if (lastMessage) {
        dispatch(deleteMessage({ chatId: chat.id, messageId: lastMessage.id }));
      }
      dispatch(streamCompletion(chat.id));
      return;
    }

    dispatch(streamCompletion(chat.id));
  }, [chat, dispatch, isLastMessageBot]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) return;

    const handleScroll = () => {
      const bottomThreshold = 10;
      isScrolledToBottomRef.current =
        scrollElement.scrollHeight -
          scrollElement.scrollTop -
          bottomThreshold <=
        scrollElement.clientHeight;
    };

    scrollElement.addEventListener("scroll", handleScroll);

    return () => scrollElement.removeEventListener("scroll", handleScroll);
  });
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    if (isScrolledToBottomRef.current) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  });

  const shouldRenderTmpMessage =
    botTyping && botTypingMessage?.role && botTypingMessage?.content;

  const historyMessages = useMemo(() => {
    if (!chat.id) return;

    const handleDelete = (id: string) => {
      dispatch(deleteMessage({ chatId: chat.id, messageId: id }));
    };
    const handleEdit = (content: string, id: string) => {
      dispatch(editMessage({ content, chatId: chat.id, messageId: id }));
    };
    return Object.values(chat.history).map((message, i) => {
      if (message.isPreamble && !showPreamble) {
        return null;
      }
      return (
        <ChatMessage
          isImportant={message.isImportant}
          onToggleImportant={() => {
            dispatch(
              setImportant({
                chatId: chat.id,
                messageId: message.id,
                important: !message.isImportant,
              })
            );
          }}
          onDelete={() => {
            handleDelete(message.id);
          }}
          onEdit={(content) => {
            handleEdit(content, message.id);
          }}
          key={i}
          content={message.content}
          role={message.role}
        />
      );
    });
  }, [chat.history, chat.id, dispatch, showPreamble]);

  return (
    <div className="h-full overflow-y-scroll" ref={scrollRef}>
      <div className="mx-auto flex min-h-full max-w-screen-md flex-col px-4">
        <div className="py-5">
          {historyMessages}
          {shouldRenderTmpMessage && (
            <ChatMessage
              content={botTypingMessage.content!}
              role={botTypingMessage.role!}
            />
          )}
        </div>
        {shouldRenderTmpMessage && (
          <div className="flex justify-center">
            <Button onClick={handleChatAbort}>Stop Generation</Button>
          </div>
        )}
        {!botTyping && !isHistoryEmpty && (
          <div className="flex justify-center">
            <Button onClick={handleGenerateResponse}>
              {isLastMessageBot ? "Regenerate Response" : "Generate Response"}
            </Button>
          </div>
        )}
        <div className="sticky bottom-4 mt-auto w-full">
          <ChatInput
            draft={chat.draft}
            disabled={botTyping}
            sendAsRole={sendAsRole}
            onChange={handleChatInput}
            onSubmit={handleChatSubmit}
          />
        </div>
      </div>
    </div>
  );
}
