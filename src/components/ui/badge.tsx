import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 hover:shadow-[0_0_10px_hsl(var(--glow-primary)/0.3)]",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:from-secondary/90 hover:to-secondary/70",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-destructive/80 text-destructive-foreground hover:from-destructive/90 hover:to-destructive/70 hover:shadow-[0_0_10px_hsl(var(--glow-error)/0.3)]",
        outline: "text-foreground border-border/50 hover:border-border",
        success:
          "border-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_0_10px_hsl(var(--glow-success)/0.3)]",
        warning:
          "border-transparent bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-400 hover:to-amber-500 hover:shadow-[0_0_10px_hsl(var(--glow-warning)/0.3)]",
        error:
          "border-transparent bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-400 hover:to-rose-500 hover:shadow-[0_0_10px_hsl(var(--glow-error)/0.3)]",
        info:
          "border-transparent bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 hover:shadow-[0_0_10px_hsl(var(--glow-accent)/0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
