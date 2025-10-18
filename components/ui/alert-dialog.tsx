"use client";

import { createContext, useContext, useEffect } from "react";
import { Button } from "./button";

interface AlertDialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue>({
  open: false,
  onOpenChange: () => {},
});

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function AlertDialog({
  open,
  onOpenChange,
  children,
}: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

interface AlertDialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogContent({
  children,
  className = "",
}: AlertDialogContentProps) {
  const { open, onOpenChange } = useContext(AlertDialogContext);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Content */}
      <div
        className={`relative bg-card border border-input rounded-lg shadow-lg max-w-md w-full mx-4 ${className}`}
        role="alertdialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogHeader({
  children,
  className = "",
}: AlertDialogHeaderProps) {
  return (
    <div
      className={`flex flex-col space-y-2 text-center sm:text-left p-6 pb-4 ${className}`}
    >
      {children}
    </div>
  );
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogTitle({
  children,
  className = "",
}: AlertDialogTitleProps) {
  return <h2 className={`text-lg font-semibold ${className}`}>{children}</h2>;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogDescription({
  children,
  className = "",
}: AlertDialogDescriptionProps) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  );
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function AlertDialogFooter({
  children,
  className = "",
}: AlertDialogFooterProps) {
  return (
    <div
      className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-4 ${className}`}
    >
      {children}
    </div>
  );
}

interface AlertDialogActionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AlertDialogAction({
  children,
  onClick,
  className = "",
}: AlertDialogActionProps) {
  const { onOpenChange } = useContext(AlertDialogContext);

  return (
    <Button
      onClick={() => {
        onClick?.();
        onOpenChange(false);
      }}
      className={className}
    >
      {children}
    </Button>
  );
}

interface AlertDialogCancelProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function AlertDialogCancel({
  children,
  onClick,
  className = "",
}: AlertDialogCancelProps) {
  const { onOpenChange } = useContext(AlertDialogContext);

  return (
    <Button
      variant="outline"
      onClick={() => {
        onClick?.();
        onOpenChange(false);
      }}
      className={className}
    >
      {children}
    </Button>
  );
}

