import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  icon,
  className = '',
  ...props
}: ButtonProps) {
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.28)]',
    secondary: 'bg-slate-800 text-slate-50 hover:bg-slate-700',
    ghost: 'bg-transparent text-slate-200 hover:bg-slate-800/60',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 px-4 py-2.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
