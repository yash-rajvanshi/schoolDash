import { FieldError } from "react-hook-form";

const InputField = ({ label, type = "text", register, name, defaultValue, error, inputProps, readOnly = false, placeholder }) => {
  const isTextarea = type === "textarea";
  const widthClass = isTextarea ? "w-full" : "w-full md:w-1/4";
  
  return (
    <div className={`flex flex-col gap-2 ${widthClass}`}>
      <label className="text-xs text-gray-500">{label}</label>
      {isTextarea ? (
        <textarea
          {...register(name)}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full min-h-[80px] resize-vertical"
          {...inputProps}
          defaultValue={defaultValue}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          {...register(name)}
          className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          {...inputProps}
          defaultValue={defaultValue}
          readOnly={readOnly}
          placeholder={placeholder}
        />
      )}
      {error?.message && (
        <p className="text-xs text-red-400">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
