// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectNativeProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Chevron icon could be added here purely for visuals, but native select usually handles it. 
            However, Shadcn style usually implies custom arrow. 
            For native select, we keep browser default or simple styling. 
            Let's add a simple chevron. */}
        <div className="absolute right-3 top-2.5 pointer-events-none opacity-50">
           <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
      </div>
    )
  }
)
SelectNative.displayName = "SelectNative"

export { SelectNative }
