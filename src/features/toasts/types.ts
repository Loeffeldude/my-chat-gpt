export type ToastState = {
  toasts: Record<string, Toast>;
};

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
  _showing?: boolean;
};

export type ToastType = "info" | "success" | "warning" | "error";
