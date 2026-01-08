import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 hover:shadow-[0_0_25px_hsl(var(--glow-primary)/0.5)] active:scale-[0.98]",
        glow: "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--glow-primary)/0.6)] active:scale-[0.98] animate-glow-pulse",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_20px_hsl(var(--glow-error)/0.4)] active:scale-[0.98]",
        outline:
          "border border-input/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 hover:text-accent-foreground hover:border-accent/50 hover:shadow-[0_0_20px_hsl(var(--glow-accent)/0.3)] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-[0_0_15px_hsl(var(--glow-primary)/0.2)] active:scale-[0.98]",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground hover:shadow-[0_0_10px_hsl(var(--glow-accent)/0.15)] active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
