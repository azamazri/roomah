"use client";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  type: ToastType;
  message: string;
  duration?: number;
}

class ToastManager {
  private toasts: Array<{ id: string; options: ToastOptions }> = [];
  private listeners: Array<
    (toasts: Array<{ id: string; options: ToastOptions }>) => void
  > = [];

  private generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  subscribe(
    listener: (toasts: Array<{ id: string; options: ToastOptions }>) => void
  ) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  show(options: ToastOptions) {
    const id = this.generateId();
    const toast = { id, options };

    this.toasts.push(toast);
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, options.duration || 4000);

    return id;
  }

  remove(id: string) {
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }

  success(message: string, duration?: number) {
    return this.show({ type: "success", message, duration });
  }

  error(message: string, duration?: number) {
    return this.show({ type: "error", message, duration });
  }

  info(message: string, duration?: number) {
    return this.show({ type: "info", message, duration });
  }

  warning(message: string, duration?: number) {
    return this.show({ type: "warning", message, duration });
  }
}

export const toastManager = new ToastManager();

export const toast = {
  success: toastManager.success.bind(toastManager),
  error: toastManager.error.bind(toastManager),
  info: toastManager.info.bind(toastManager),
  warning: toastManager.warning.bind(toastManager),
};
