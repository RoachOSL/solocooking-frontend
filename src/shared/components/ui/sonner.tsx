/*
 * Copyright (c) 2026 dev.soloprogramming
 */

import { Toaster as Sonner, type ToasterProps } from 'sonner'

// Theme is passed in by the app layer (App reads it) rather than pulled from a
// theme hook here — shared/ must not import from app/. Toasts are styled to the
// design tokens so all three palettes and both modes are covered without
// branching.
export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:border-border group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}
