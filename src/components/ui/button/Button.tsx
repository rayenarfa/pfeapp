import { ReactNode, forwardRef } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  as?: "button" | "span";
};

const Button = forwardRef<HTMLButtonElement | HTMLSpanElement, ButtonProps>(
  (
    {
      children,
      className = "",
      onClick,
      disabled = false,
      type = "button",
      size = "md",
      variant = "primary",
      startIcon,
      endIcon,
      as,
      ...rest
    },
    ref
  ) => {
    // Define base classes based on props

    // Size Classes
    const sizeClassesButton = {
      sm: "px-4 py-3 text-sm",
      md: "px-5 py-3.5 text-sm",
      lg: "px-6 py-4 text-base",
    };

    // Variant Classes
    const variantClasses = {
      primary:
        "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
      secondary:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 disabled:bg-gray-50",
      outline:
        "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
      danger:
        "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300",
    };

    const commonProps = {
      className: `inline-flex items-center justify-center gap-2 rounded-lg transition ${
        sizeClassesButton[size]
      } ${variantClasses[variant]} ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      } ${className}`,
      onClick: disabled ? undefined : onClick,
      disabled,
      ...rest,
    };

    // Determine whether to render a button or span
    // Use 'as' prop, or if within a form with type="submit", use span to avoid nesting
    const ElementType = as || (type === "submit" ? "span" : "button");

    return (
      <ElementType
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        {...commonProps}
        {...(ElementType === "button" ? { type } : {})}
      >
        {startIcon && <span className="flex items-center">{startIcon}</span>}
        {children}
        {endIcon && <span className="flex items-center">{endIcon}</span>}
      </ElementType>
    );
  }
);

Button.displayName = "Button";

export default Button;
