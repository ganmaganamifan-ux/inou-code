import React from "react";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "outline"
    | "ghost"
    | "link"
    | "secondary"
    | "destructive";
  size?: "sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-md" | "icon-lg";
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      asChild = false,
      className,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    

    return (
      <button
        ref={ref}
        type={type}
        className={`
        ${styles.button} 
        ${styles[variant]} 
        ${styles[size]} 
        ${disabled ? styles.disabled : ""} 
        ${className || ""}
      `}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
