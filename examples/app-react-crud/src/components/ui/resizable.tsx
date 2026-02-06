"use client"

import * as React from "react"
import { PanelResizeHandle as PanelResizeHandlePrimitive } from "react-resizable-panels"

import { cn } from "@/lib/utils"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof import("react-resizable-panels").PanelGroup>) => (
  <import("react-resizable-panels").PanelGroup
    className={cn(
      "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
)

const ResizablePanel = import("react-resizable-panels").Panel

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof PanelResizeHandlePrimitive> & {
  withHandle?: boolean
}) => (
  <PanelResizeHandlePrimitive
    className={cn(
      "relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border">
        <svg  width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5"><path d="M5.5 4.625C5.5 4.41789 5.33211 4.25 5.125 4.25C4.91789 4.25 4.75 4.41789 4.75 4.625V10.375C4.75 10.5821 4.91789 10.75 5.125 10.75C5.33211 10.75 5.5 10.5821 5.5 10.375V4.625ZM9.5 4.625C9.5 4.41789 9.33211 4.25 9.125 4.25C8.91789 4.25 8.75 4.41789 8.75 4.625V10.375C8.75 10.5821 8.91789 10.75 9.125 10.75C9.33211 10.75 9.5 10.5821 9.5 10.375V4.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
      </div>
    )}
  </PanelResizeHandlePrimitive>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
