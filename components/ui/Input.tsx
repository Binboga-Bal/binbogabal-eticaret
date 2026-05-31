import { cn } from "@/lib/utils/cn";
import { type InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            /* iOS Safari zoom önleme: font-size 16px altında input zoom yapar */
            "w-full px-4 py-3 border rounded-lg text-[16px] sm:text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-honey focus:border-transparent min-h-[44px]",
            error ? "border-red-400" : "border-gray-300",
            props.readOnly ? "bg-gray-50 text-gray-600 cursor-default" : "",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
