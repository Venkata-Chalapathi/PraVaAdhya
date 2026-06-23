import React, { forwardRef } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, error, className, id, type = "text", ...props }, ref) => {
    return (
      <div className="relative w-full">
        <div className="flex items-center border-b border-charcoal/20 focus-within:border-gold transition-colors duration-300">
          {icon && <div className="text-charcoal/40 mr-3 flex items-center justify-center">{icon}</div>}
          <input
            ref={ref}
            type={type}
            id={id}
            className={twMerge(
              clsx(
                "block w-full py-4 bg-transparent text-charcoal font-sans text-sm focus:outline-none peer placeholder-transparent",
                className
              )
            )}
            placeholder={label}
            {...props}
          />
          <label
            htmlFor={id}
            className={twMerge(
              clsx(
                "absolute font-sans text-xs md:text-sm uppercase tracking-wider transition-all duration-300 pointer-events-none origin-[0] transform -translate-y-6 scale-75 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:text-gold text-charcoal-light",
                icon ? "left-7" : "left-0"
              )
            )}
          >
            {label}
          </label>
        </div>
        {error && (
          <span className="text-[10px] text-red-600 font-sans tracking-wide absolute mt-1">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
