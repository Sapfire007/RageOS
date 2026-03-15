// Stitch prompt: "A clean macOS-style button component with variants: default (blue fill), outline (border only), ghost (no border), destructive (red fill). Rounded-lg, medium padding, smooth hover transition."
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007aff] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#007aff] text-white hover:bg-[#0071eb] active:bg-[#006ae0]',
        destructive: 'bg-[#ff3b30] text-white hover:bg-[#e0352a]',
        outline: 'border border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]',
        ghost: 'text-[#1d1d1f] hover:bg-[#f5f5f7]',
        secondary: 'bg-[#f5f5f7] text-[#1d1d1f] hover:bg-[#e8e8ed]',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-11 px-6',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
