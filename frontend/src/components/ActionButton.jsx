import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const variantClasses = {
  primary:
    'border border-primary bg-primary text-primary-foreground shadow-lg hover:bg-[#A04B32] hover:text-white hover:shadow-xl hover:-translate-y-1 disabled:border-neutral-200 disabled:bg-neutral-200 disabled:text-neutral-500 disabled:shadow-none disabled:hover:translate-y-0',
  secondary:
    'border border-border bg-transparent text-foreground hover:bg-accent hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0',
  heroSecondary:
    'border-2 border-white bg-transparent text-white hover:bg-[#A04B32] hover:text-secondary hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0',
};

const sizeClasses = {
  sm: 'px-6 py-2 text-sm',
  md: 'px-8 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

const ActionButton = React.forwardRef(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      to,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const classes = cn(
      'group inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    if (to) {
      return (
        <Link ref={ref} to={to} className={classes} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

export default ActionButton;
