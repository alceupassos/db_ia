import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input/50 bg-background/50 backdrop-blur-sm px-3 py-2 text-sm",
          "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground/70",
          "transition-all duration-300",
          "focus-visible:outline-none focus-visible:border-primary/60 focus-visible:bg-background/80",
          "focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2",
          "focus-visible:shadow-[0_0_20px_hsl(var(--glow-primary)/0.3),0_0_40px_hsl(var(--glow-primary)/0.15)]",
          "hover:border-primary/30 hover:bg-background/70 hover:shadow-[0_0_10px_hsl(var(--glow-primary)/0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
