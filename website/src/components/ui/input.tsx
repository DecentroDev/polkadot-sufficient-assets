import React, { forwardRef, type ComponentProps, type ElementRef, type ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';

const inputVariant = tv({
  base: 'gradient-border-gradient-nav gradient-border-DEFAULT bg-background relative flex flex-col rounded-2xl',
  variants: {
    size: {
      default: 'min-h-[50px]',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface InputProps extends Omit<ComponentProps<'input'>, 'size'>, VariantProps<typeof inputVariant> {
  startContent?: ReactNode;
  endContent?: ReactNode;
}

export const Input = forwardRef<ElementRef<'input'>, InputProps>(
  ({ className, startContent, endContent, size, fullWidth, ...props }, ref) => {
    return (
      <div className={inputVariant({ className, size, fullWidth })}>
        {startContent}
        <input
          className='placeholder:text-subtle h-full w-full flex-1 border-none bg-transparent px-4 text-white outline-none'
          {...props}
          ref={ref}
        />
        {endContent}
      </div>
    );
  }
);
