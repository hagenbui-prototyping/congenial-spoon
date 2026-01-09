import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, type = 'text', ...props }, ref) => {
    const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

    const errorClasses = error ? 'border-destructive focus-visible:ring-destructive' : '';

    const classes = `${baseClasses} ${errorClasses} ${className}`;

    return (
      <input
        ref={ref}
        type={type}
        className={classes}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
