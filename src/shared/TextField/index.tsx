import { CircleUser, Lock, Mail } from "lucide-react";

interface TextFieldProps {
  label?: string;
  type: string;
  name: string;
  placeholder: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; // New prop for error message
}

function TextField({
  label,
  type,
  name,
  placeholder,
  onChange,
  error,
  ...props
}: TextFieldProps) {
  return (
    <div className="flex flex-col w-full sm:w-[410px]"> {/* Made responsive */}
      {label && (
        <label
          htmlFor={name}
          className="text-[16px] font-bold text-gray-700"
        >
          {label}
        </label>
      )}

      <div className="flex items-center gap-2 border bg-transparent p-4 h-12 rounded-xl">
        {type === "text" ? (
          <CircleUser size={24} className="text-black" />
        ) : type === "password" ? (
          <Lock size={24} className="text-black" />
        ) : type === "email" ? (
          <Mail size={24} className="text-black" />
        ) : null}

        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          className={`w-full p-2 rounded-lg bg-transparent outline-none font-medium text-gray-800 ${
            error ? "border-red-500" : ""
          }`}
          onChange={onChange}
          {...props}
        />
      </div>

      {error && (
        <p className="text-red-600 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

export default TextField;