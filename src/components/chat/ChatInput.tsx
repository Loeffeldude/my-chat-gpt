import { capitilize } from "@src/lib/util";
import { ChatCompletionResponseMessageRoleEnum } from "openai";
import { useCallback, ChangeEvent, useState, FormEvent } from "react";
import { IconButton } from "../IconButton";

import { FiSend } from "react-icons/fi";
import { useAppSelector } from "@src/lib/hooks/redux";
export type ChatInputValue = {
  role: ChatCompletionResponseMessageRoleEnum;
  draft: string;
};
export type ChatInputProps = {
  onChange?: (values: ChatInputValue) => void;
  onSubmit?: (values: ChatInputValue) => void;
  disabled?: boolean;
  draft?: string;
  sendAsRole: ChatCompletionResponseMessageRoleEnum;
};

export function ChatInput({
  onChange,
  draft,
  sendAsRole,
  onSubmit,
  disabled,
}: ChatInputProps) {
  const sendWithShiftEnter = useAppSelector(
    (state) => state.settings.shiftSend
  );
  const roleOptions = ["user", "system", "assistant"];

  const handleDraftChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange && onChange({ draft: e.target.value, role: sendAsRole });
    },
    [onChange, sendAsRole]
  );

  const handleSendAsRoleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange &&
        onChange({
          draft: draft ?? "",
          role: e.target.value as ChatCompletionResponseMessageRoleEnum,
        });
    },
    [onChange, draft]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (disabled) return;
      if (!draft) return;

      onSubmit && onSubmit({ draft, role: sendAsRole });
    },
    [disabled, draft, onSubmit, sendAsRole]
  );

  const handleResize = (event: FormEvent<HTMLTextAreaElement>) => {
    const el = event.currentTarget;

    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") {
      return;
    }

    if (e.shiftKey && !sendWithShiftEnter) {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const before = value.substring(0, start);
      const after = value.substring(end, value.length);
      const newValue = before + "\n" + after;
      textarea.selectionStart = start + 1;
      textarea.selectionEnd = start + 1;

      onChange && onChange({ draft: newValue, role: sendAsRole });
      handleResize(e as any);
      return;
    }

    e.preventDefault();
    handleSubmit(e as any);
  };

  return (
    <form onSubmit={handleSubmit} className="">
      <div>
        <select
          name="chat-role"
          id="chat-role"
          value={sendAsRole}
          className="rounded-md rounded-b-none bg-mirage-700 p-1"
          onChange={handleSendAsRoleChange}
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {capitilize(role)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex w-full flex-row">
        <textarea
          name="chat-input"
          id="chat-input"
          className="w-full resize-none rounded-md rounded-tl-none bg-mirage-700 p-1"
          value={draft}
          onChange={handleDraftChange}
          onKeyDown={handleKeyDown}
          onInput={handleResize}
          style={{
            height: "auto",
            minHeight: "1em",
            maxHeight: "6em",
            resize: "none",
          }}
          rows={1}
        ></textarea>
        <div className="">
          <IconButton
            disabled={disabled}
            aria-label="Send Message"
            className="ml-2 !bg-green-700 hover:!bg-green-600 active:!bg-green-800"
          >
            {disabled ? (
              <div className="flex flex-row items-center">
                <div className="anim h-1 w-1 rounded-full bg-green-500"></div>
                <div className="ml-1 h-1 w-1 rounded-full bg-green-500"></div>
                <div className="ml-1 h-1 w-1 rounded-full bg-green-500"></div>
              </div>
            ) : (
              <FiSend size={20} />
            )}
          </IconButton>
        </div>
      </div>
    </form>
  );
}
