import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-card p-6 rounded-xl hover:scale-[1.01] transition-transform duration-200 ${className}`} {...props}>
      {children}
    </div>
  );
};
