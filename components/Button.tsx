import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "font-christmas text-xl px-6 py-2 rounded-full shadow-md transition-transform transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-xmasRed text-white border-2 border-xmasGold hover:bg-red-700",
    secondary: "bg-xmasGreen text-white border-2 border-green-600 hover:bg-green-800",
    danger: "bg-white text-xmasRed border-2 border-xmasRed hover:bg-red-50"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
