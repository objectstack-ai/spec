// Copyright (c) 2025 ObjectStack. Licensed under the Apache-2.0 license.

import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
