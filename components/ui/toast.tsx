"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { IconCircleCheck, IconCircleX, IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitive.Provider
export const useToast = ToastPrimitive.useToastManager

/** Va una vez, cerca de la raíz. `AppShell` la envuelve. */
export function Toaster({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-50 w-[min(380px,calc(100vw-2rem))] outline-none sm:right-6 sm:bottom-6">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastProvider>
  )
}

const icons = { success: IconCircleCheck, error: IconCircleX }

function ToastList() {
  const { toasts } = useToast()

  return toasts.map((toast) => {
    const Icon = toast.type === "success" || toast.type === "error" ? icons[toast.type] : null

    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        // Root ya pone --toast-index/--toast-offset-y/--toast-height como
        // variables CSS propias; solo hace falta consumirlas para el stack.
        className={cn(
          "absolute right-0 bottom-0 left-0 flex items-start gap-3 rounded-2xl bg-popover px-4 py-3.5 text-popover-foreground",
          "shadow-lg ring-1 ring-foreground/10 transition-all duration-200 ease-out",
          "[transform:translateY(calc(var(--toast-offset-y)*-1px))]",
          "data-[starting-style]:translate-y-2 data-[starting-style]:opacity-0",
          "data-[ending-style]:translate-y-2 data-[ending-style]:opacity-0",
        )}
      >
        {Icon ? (
          <Icon
            className={cn(
              "mt-0.5 size-5 shrink-0",
              toast.type === "success" ? "text-secondary-foreground" : "text-destructive",
            )}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          {toast.title ? (
            <ToastPrimitive.Title className="text-[14px] font-medium">
              {toast.title}
            </ToastPrimitive.Title>
          ) : null}
          {toast.description ? (
            <ToastPrimitive.Description className="mt-0.5 text-[13px] text-muted-foreground">
              {toast.description}
            </ToastPrimitive.Description>
          ) : null}
        </div>
        <ToastPrimitive.Close
          aria-label="Cerrar aviso"
          className="-m-1 shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted"
        >
          <IconX className="size-4" />
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
    )
  })
}
