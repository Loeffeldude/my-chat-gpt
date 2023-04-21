import { Transition } from "@headlessui/react";
import { removeToast } from "@src/features/toasts/thunks";
import { Toast, ToastType } from "@src/features/toasts/types";
import { useAppDispatch, useAppSelector } from "@src/lib/hooks/redux";
import classNames from "classnames";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiCheck, FiX } from "react-icons/fi";

export type ToastProps = {
  toast: Toast;
};
const getToastContainer = () => document.getElementById("toasts")!;

interface ToastCloseIconProps {
  type: ToastType;
}

const ToastCloseIcon = ({ type }: ToastCloseIconProps) => {
  switch (type) {
    case "success":
      return <FiCheck size={20}></FiCheck>;
    default:
      return <FiX size={20}></FiX>;
  }
};

function ToastComponent({
  toast: { id, message, type, _showing },
}: ToastProps) {
  const dispatch = useAppDispatch();

  const toastClasses = classNames(
    {
      "bg-green-700": type === "success",
      "bg-red-700": type === "error",
      "bg-yellow-800": type === "warning",
      "bg-blue-700": type === "info",
    },
    "rounded-lg my-1 transition-colors flex flex-row text-sm items-center"
  );

  const closeClasses = classNames(
    {
      "bg-green-700  hover:bg-green-800 active:bg-green-900":
        type === "success",
      "bg-red-700  hover:bg-red-800 active:bg-red-900": type === "error",
      "bg-yellow-800  hover:bg-yellow-900 active:bg-yellow-900":
        type === "warning",
      "bg-blue-700 hover:bg-blue-800 active:bg-blue-900": type === "info",
    },
    "ml-1 flex flex-row items-center justify-center border-l border-l-white border-opacity-75 p-2 rounded-r-lg"
  );

  const close = () => {
    dispatch(removeToast(id));
  };

  return (
    <Transition
      show={!!_showing}
      enter="transition-all duration-75"
      enterFrom="opacity-0 translate-y-full"
      enterTo="opacity-100 translate-y-0"
      leave="transition-all duration-150"
      leaveFrom="opacity-100 translate-y-0"
      leaveTo="opacity-0 -translate-y-full"
    >
      <div className={toastClasses}>
        <p className="mr-auto p-2">{message}</p>
        <button
          className={closeClasses}
          onClick={close}
          aria-label="Close Message"
        >
          <ToastCloseIcon type={type} />
        </button>
      </div>
    </Transition>
  );
}

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.toasts.toasts);
  const containerRef = useRef<HTMLDivElement>(null);

  return createPortal(
    <div
      ref={containerRef}
      className="pointer-events-auto mx-auto flex max-w-2xl flex-col transition-all"
    >
      {Object.values(toasts).map((toast) => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>,
    getToastContainer()
  );
}
