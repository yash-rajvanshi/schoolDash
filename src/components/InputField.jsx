import { FieldError } from "react-hook-form";

const InputField = ({ label, type = "text", register, name, defaultValue, error, inputProps, readOnly = false, placeholder }) => {
  const isTextarea = type === "textarea";
  const isSelect = type === "select";
  
  // Responsive width classes
  const getWidthClass = () => {
    if (isTextarea) return "w-full";
    if (isSelect) return "w-full sm:w-1/2 lg:w-1/3 xl:w-1/4";
    return "w-full sm:w-1/2 lg:w-1/3 xl:w-1/4";
  };
  
  return (
    <div className={`flex flex-col gap-2 ${getWidthClass()}`}>
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      {isTextarea ? (
        <textarea
          {...register(name)}
          className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full min-h-[80px] resize-vertical focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          {...inputProps}
          defaultValue={defaultValue}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          className="ring-[1.5px] ring-gray-300 p-3 rounded-md text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          {...inputProps}
          defaultValue={defaultValue}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      )}
      {error?.message && (
        <p className="text-xs text-red-500 font-medium">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
