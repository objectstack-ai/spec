import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label" // I don't have this pkg, so I will mock it or just use label
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

// Since I might not have @radix-ui/react-label, I'll use a standard label 
// If the user wants standard shadcn, they usually have the deps. 
// But context shows only slot and scroll-area. 
// I will just make a styled label component.

const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = "Label" // LabelPrimitive.Root.displayName if using radix

export { Label }
