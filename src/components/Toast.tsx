import { Transition } from "@headlessui/react";
import { Toast } from "@src/features/toasts/types";
import { useAppSelector } from "@src/lib/hooks/redux";
import classNames from "classnames";
import { createPortal } from "react-dom";

export type ToastProps = {
  toast: Toast;
};
const getToastContainer = () => document.getElementById("toasts")!;

function ToastComponent({
  toast: { duration, id, message, type, _showing },
}: ToastProps) {
  const classes = classNames(
    {
      "bg-green-700": type === "success",
      "bg-red-700": type === "error",
      "bg-yellow-800": type === "warning",
      "bg-blue-700": type === "info",
    },
    "p-2 rounded-lg my-1 transition-colors"
  );

  return createPortal(
    <Transition
      show={!!_showing}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className={classes}>
        <p>{message}</p>
      </div>
    </Transition>,
    getToastContainer()
  );
}

export function ToastContainer() {
  const toasts = useAppSelector((state) => state.toasts.toasts);

  return (
    <>
      {Object.values(toasts).map((toast) => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </>
  );
}
