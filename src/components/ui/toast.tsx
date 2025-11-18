"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X, Info } from "lucide-react";
import { info } from "console";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const icons = {
    success: <CheckCircle className="size-5 text-green-500" />,
    error: <XCircle className="size-5 text-red-500" />,
    warning: <AlertTriangle className="size-5 text-yellow-500" />,
    info: <Info className="size-5 text-blue-500" />,
  };

  const backgrounds = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${backgrounds[type]}`}>
        {icons[type]}
        <span className="text-sm font-medium text-gray-900">{message}</span>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="size-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}