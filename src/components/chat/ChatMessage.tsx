import MDEditor from "@uiw/react-md-editor";
import { ChatCompletionResponseMessageRoleEnum } from "openai";
import { useState, useEffect } from "react";
import { IconButton } from "../IconButton";
import {
  FiCopy,
  FiEdit,
  FiCheck,
  FiTrash,
  FiSave,
  FiFlag,
} from "react-icons/fi";
import { capitilize } from "@src/lib/util";
import classNames from "classnames";

export type ChatMessageProps = {
  content: string;
  role: ChatCompletionResponseMessageRoleEnum;
  isImportant?: boolean;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
  onToggleImportant?: () => void;
};

export function ChatMessage({
  content,
  role,
  isImportant,
  onDelete,
  onEdit,
  onToggleImportant,
}: ChatMessageProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const nameClasses = classNames(
    {
      "text-white": role === "user",
      "text-mirage-300 italic": role === "system",
      "text-green-500": role === "assistant",
    },
    "text-sm"
  );

  const nameDisplay = role === "user" ? "You" : capitilize(role);

  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  return (
    <div className="group relative mb-4 flex flex-col border-b-2 border-mirage-700 pb-2">
      <div className="pointer-events-none absolute top-0 right-0 flex flex-row opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
        {isEditing ? (
          <IconButton
            className="ml-2"
            onClick={() => {
              setIsEditing(false);
              onEdit && onEdit(editedContent);
            }}
            aria-label="Save Edited Message"
          >
            <FiSave />
          </IconButton>
        ) : (
          <IconButton
            className="ml-2"
            onClick={() => {
              setIsEditing(true);
            }}
            aria-label="Edit Message"
          >
            <FiEdit />
          </IconButton>
        )}
        <IconButton
          className={`ml-2 ${isImportant ? "!bg-green-700" : ""}`}
          aria-label={
            isImportant
              ? "Mark message as important"
              : "Remove important mark from message"
          }
          onClick={() => {
            onToggleImportant && onToggleImportant();
          }}
        >
          <FiFlag />
        </IconButton>
        <IconButton
          className="ml-2"
          onClick={() => {
            onDelete && onDelete();
          }}
          aria-label="Delete Message"
        >
          <FiTrash />
        </IconButton>
        <IconButton
          className="ml-2"
          onClick={() => {
            setIsCopied(true);
            navigator.clipboard.writeText(content);
          }}
          onMouseLeave={() => {
            setIsCopied(false);
          }}
          onBlur={() => {
            setIsCopied(false);
          }}
          aria-label="Copy Message to Clipboard"
        >
          {isCopied ? <FiCheck /> : <FiCopy />}
        </IconButton>
      </div>
      <div className={nameClasses}>{nameDisplay}:</div>
      {isEditing ? (
        <textarea
          className="h-40 w-full rounded-md bg-mirage-700"
          value={editedContent}
          onChange={(e) => {
            setEditedContent(e.target.value);
          }}
        />
      ) : (
        <MDEditor.Markdown source={content} />
      )}
    </div>
  );
}
