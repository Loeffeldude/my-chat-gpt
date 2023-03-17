import { capitilize } from "@src/lib/util";
import { ChatCompletionResponseMessageRoleEnum } from "openai";
import { useCallback, ChangeEvent, FormEvent, useMemo } from "react";
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
  const shiftSend = useAppSelector((state) => state.settings.shiftSend);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.shiftKey || !shiftSend)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  //Grow text area
  const textAreaRows = useMemo(() => {
    const defaultHeight = 1;
    const maxHeight = 5;
    if (!draft) return defaultHeight;
    return Math.min(
      maxHeight,
      Math.max(defaultHeight, draft.split("\n").length)
    );
  }, [draft]);

  return (
    <form onSubmit={handleSubmit} className="">
      <div>
        <select
          name="chat-role"
          id="chat-role"
          value={sendAsRole}
          className="bg-mirage-700 p-1"
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
          className="w-full resize-none bg-mirage-700 p-1"
          value={draft}
          onChange={handleDraftChange}
          onKeyDown={handleKeyDown}
          rows={textAreaRows}
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
