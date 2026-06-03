import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-obsidian-900 disabled:opacity-50 disabled:pointer-events-none";
  const styles = {
    primary: "bg-accent-emerald text-obsidian-900 hover:bg-emerald-400 focus:ring-accent-emerald",
    secondary: "bg-white/10 text-white hover:bg-white/20 focus:ring-white/30",
    danger: "bg-accent-ruby text-white hover:bg-red-500 focus:ring-accent-ruby",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
  };
  return (
    <button className={`${baseStyle} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
