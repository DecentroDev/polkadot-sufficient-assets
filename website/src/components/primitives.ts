import { tv } from 'tailwind-variants';

export const title = tv({
  base: 'block text-center font-mono font-extrabold ',
  variants: {
    color: {
      white: 'text-white',
    },
    size: {
      lg: 'text-4xl !leading-[160%] lg:text-6xl 2xl:text-[84px]',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

export const headline = tv({
  base: 'block font-mono  uppercase !leading-[160%] tracking-[-0.64px]',
  variants: {
    color: {
      gradient: 'bg-gradient-text bg-clip-text text-transparent',
      white: 'text-white',
    },
    size: {
      default: 'text-2xl md:text-3xl lg:text-[44px] ',
      sm: 'text-xl md:text-2xl lg:text-[32px]',
    },
    fullWidth: {
      true: 'w-full',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'gradient',
  },
});

export const smallTitle = tv({
  base: 'text-_1 text-xs font-bold tracking-[3.6px] ',
});

export const subtitle = tv({
  base: 'block font-medium',
  variants: {
    size: {
      default: 'text-base lg:text-lg xl:text-xl',
    },
    color: {
      default: 'text-foreground',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export const paragraph = tv({
  base: 'block font-light leading-none lg:leading-8',
  variants: {
    size: {
      default: 'text-sm lg:text-base xl:text-lg',
      sm: 'text-xs md:text-sm lg:text-base',
      lg: 'text-base lg:text-lg xl:text-xl',
      xl: 'text-lg !leading-[160%] lg:text-xl xl:text-2xl',
    },
    color: {
      default: 'text-foreground',
      primary: 'text-primary-04',
    },
  },
  defaultVariants: {
    size: 'default',
    color: 'default',
  },
});

export const container = tv({
  base: 'container mx-auto w-full max-w-7xl px-4 md:px-6',
  variants: {
    size: {
      default: 'max-w-7xl',
      sm: 'max-w-5xl',
      lg: 'max-w-[1320px]',
      '2xl': 'max-w-[1536px]',
      '3xl': 'max-w-[1668px]',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});
