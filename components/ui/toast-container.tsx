"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";
import { toastManager } from "@/lib/toast";

const icons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warning: "bg-yellow-50 text-yellow-800 border-yellow-200",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<{ id: string; options: any }>>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.options.type];
        const style = styles[toast.options.type];

        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 p-4 rounded-md border shadow-lg min-w-80 max-w-md ${style} animate-in slide-in-from-right duration-200`}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">
              {toast.options.message}
            </p>
            <button
              onClick={() => toastManager.remove(toast.id)}
              className="p-1 hover:bg-black/10 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
