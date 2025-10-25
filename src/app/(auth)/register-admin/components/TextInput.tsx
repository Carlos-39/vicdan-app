import { forwardRef } from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const TextInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="mb-1">
        <label className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
          {label}
        </label>
        <input
          ref={ref}
          {...props}
          className={`w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300 ${
            error
              ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-100"
              : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white focus:border-[var(--primary)] focus:bg-white focus:ring-4 focus:ring-[color-mix(in_srgb,var(--primary)_8%,transparent)]"
          }`}
          style={{ fontSize: '0.9375rem' }}
        />
        {error && (
          <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
export default TextInput;
