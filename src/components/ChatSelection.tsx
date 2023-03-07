import {
  clearChats,
  createChat,
  deleteChat,
  editSummary,
  switchChat,
} from "@src/features/chat";
import { useAppDispatch, useAppSelector } from "@src/lib/hooks/redux";
import classNames from "classnames";
import { IconButton } from "./IconButton";
import { FiCheck, FiDelete, FiEdit, FiTrash } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

type ChatSelectionButtonProps = {
  id: string;
  active: boolean;
  summary: string;
  onClick?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, summary: string) => void;
};

export function ChatSelectionButton({
  active,
  summary,
  id,
  onClick,
  onDelete,
  onEdit,
}: ChatSelectionButtonProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState(summary);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const classes = classNames(
    {
      "bg-mirage-700": active,
      "transition-colors focus-within:bg-mirage-600 hover:bg-mirage-600 active:bg-mirage-700":
        !active,
    },
    " p-2 rounded-lg my-1 transition-colors relative"
  );

  useEffect(() => {
    setEditedSummary(summary);
  }, [summary]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);

  const handleClick = () => {
    onClick && onClick(id);
  };

  const handleDelete = () => {
    onDelete && onDelete(id);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onEdit && onEdit(id, editedSummary);
  };

  //TODO: refactor this to be more readable
  return (
    <div className={classes}>
      {active ? (
        isEditing ? (
          <input
            ref={inputRef}
            className="block w-full bg-mirage-700"
            value={editedSummary}
            onChange={(e) => {
              setEditedSummary(e.target.value);
            }}
          />
        ) : (
          <span className="block w-full">{summary}</span>
        )
      ) : (
        <button className="block w-full text-left" onClick={handleClick}>
          {summary}
        </button>
      )}
      {active && (
        <div className="absolute right-0 top-0 flex h-full flex-row justify-center">
          {!isEditing && (
            <IconButton onClick={handleDelete} aria-label="Deleete Chat">
              <FiTrash />
            </IconButton>
          )}
          <IconButton
            onClick={isEditing ? handleSave : handleEdit}
            aria-label="Edit Chat Description"
          >
            {isEditing ? <FiCheck /> : <FiEdit />}
          </IconButton>
        </div>
      )}
    </div>
  );
}

export function ChatSelection() {
  const chats = useAppSelector((state) => state.chats.chats);
  const preamble = useAppSelector((state) => state.settings.preamble);
  const activeChatId = useAppSelector((state) => state.chats.activeId);

  const dispatch = useAppDispatch();

  const handleCreateChat = () => {
    dispatch(createChat({ preamble }));
  };
  const handleSwitchChat = (id: string) => {
    dispatch(switchChat({ id }));
  };

  const handleEditChat = (id: string, summary: string) => {
    dispatch(editSummary({ id, summary }));
  };

  const handleDeleteChat = (id: string) => {
    dispatch(deleteChat({ id }));
  };
  const handleClearChats = async () => {
    (await window.electronAPI.confirm(
      "Are you sure you want to delete all chats?"
    )) && dispatch(clearChats());
  };

  return (
    <div className="sticky top-0 flex flex-col">
      <div className="border-b-2 border-mirage-700">
        <ChatSelectionButton
          summary={"Create new chat"}
          active={false}
          id={"new"}
          onClick={handleCreateChat}
        />
        <ChatSelectionButton
          summary={"Delete all Chats"}
          active={false}
          id={"delete"}
          onClick={handleClearChats}
        />
      </div>
      <div className="border-b-2 border-mirage-700">
        {Object.entries(chats).map(([id, chat]) => {
          return (
            <ChatSelectionButton
              summary={chat.summary}
              active={id === activeChatId}
              id={id}
              onClick={handleSwitchChat}
              onDelete={handleDeleteChat}
              onEdit={handleEditChat}
              key={id}
            />
          );
        })}
      </div>
    </div>
  );
}
