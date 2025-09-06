import { useState } from "react";
import Link from "@/components/Link";

type FieldProps = {
  className?: string;
  classInput?: string;
  label?: string;
  textarea?: boolean;
  type?: string;
  validated?: boolean;
  errorMessage?: string;
  forgotPassword?: boolean;
  icon?: React.ReactNode;
};

function Field({
  className,
  classInput,
  label,
  textarea,
  type,
  validated,
  errorMessage,
  forgotPassword,
  icon,
  ...inputProps
}: FieldProps &
  React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(true);

  return (
    <div className={`${className || ""}`}>
      {label && (
        <div className="flex items-center mb-2">
          <div className="mr-auto text-[0.75rem] leading-[1rem] font-medium">
            {label}
          </div>
          {forgotPassword && (
            <Link
              className="text-[0.75rem] leading-[1rem] font-medium text-[#7b7b7b] opacity-70 transition-opacity hover:opacity-100"
              href="/reset-password"
            >
              Forgot password?
            </Link>
          )}
        </div>
      )}
      <div className={`relative ${textarea ? "text-[0]" : ""}`}>
        {icon && (
          <div className="absolute top-0 left-0 bottom-0 flex items-center justify-center w-10 pointer-events-none">
            {icon}
          </div>
        )}
        {textarea ? (
          <textarea
            className={`w-full h-20 px-5.5 py-4 border-[1.5px] border-[#E2E2E2] rounded-xl text-[0.8125rem] leading-[1rem] text-[#000] placeholder:text-[#7B7B7B] transition-all resize-none focus:shadow-[0px_1px_4px_-1px_rgba(0,0,0,0.15)] hover:shadow-[0px_1px_4px_-1px_rgba(0,0,0,0.15)] ${
              validated ? "pr-10" : ""
            } ${type === "password" ? "pr-12" : ""}  ${
              classInput || ""
            } ${icon ? "pl-10" : ""}`}
            {...inputProps}
          ></textarea>
        ) : (
          <input
            className={`w-full h-12 px-5.5 border-[1.5px] border-[#E2E2E2] rounded-xl text-[0.8125rem] leading-[1rem] text-[#000] placeholder:text-[#7B7B7B] transition-all focus:shadow-[0px_1px_4px_-1px_rgba(0,0,0,0.15)] hover:shadow-[0px_1px_4px_-1px_rgba(0,0,0,0.15)] ${
              validated ? "pr-10" : ""
            } ${type === "password" ? "pr-12" : ""} ${
              classInput || ""
            } ${icon ? "pl-10" : ""}`}
            type={
              type === "password" && isPasswordVisible ? "password" : "text"
            }
            {...inputProps}
          />
        )}
        {validated && (
          <svg
            className="absolute top-1/2 right-3.5 size-5 -translate-y-1/2 fill-[#7B7B7B]"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm1.92 4.4a.75.75 0 1 1 1.161.95l-3.75 4.583a.75.75 0 0 1-1.111.055l-1.667-1.667a.75.75 0 0 1 1.061-1.061l1.08 1.08 3.226-3.941z" />
          </svg>
        )}
        {!validated && type === "password" && (
          <button
            className="absolute top-0 right-0 bottom-0 flex items-center justify-center w-12 cursor-pointer outline-0"
            type="button"
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <svg
              className="fill-[#7B7B7B]"
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
            >
              <path
                d={
                  isPasswordVisible
                    ? "M2.11 9.267l-.652-.371h0l.652.371zm15.883 0l.652-.371h0l-.652.371zM2.11 10.736l-.652.371h0l.652-.371zm15.883 0l.652.371h0l-.652-.371zM2.11 9.267l.652.371c1.912-3.356 4.651-4.929 7.29-4.929s5.378 1.573 7.29 4.929l.652-.371.652-.371c-2.12-3.721-5.306-5.686-8.593-5.686S3.578 5.175 1.458 8.896l.652.371zm0 1.469l-.652.371c2.12 3.721 5.306 5.686 8.593 5.686s6.473-1.965 8.593-5.686l-.652-.371-.652-.371c-1.912 3.356-4.651 4.929-7.29 4.929s-5.378-1.573-7.29-4.929l-.652.371zm0-1.469l-.652-.371c-.391.685-.391 1.526 0 2.211l.652-.371.652-.371c-.128-.225-.128-.501 0-.726l-.652-.371zm15.883 0l-.652.371c.128.225.128.501 0 .726l.652.371.652.371c.391-.685.391-1.526 0-2.211l-.652.371zm-5.233.734h-.75a1.96 1.96 0 0 1-1.958 1.958v.75.75a3.46 3.46 0 0 0 3.458-3.458h-.75zm-2.708 2.708v-.75a1.96 1.96 0 0 1-1.958-1.958h-.75-.75a3.46 3.46 0 0 0 3.458 3.458v-.75zm-2.708-2.708h.75a1.96 1.96 0 0 1 1.958-1.958v-.75-.75a3.46 3.46 0 0 0-3.458 3.458h.75zm2.708-2.708v.75a1.96 1.96 0 0 1 1.958 1.958h.75.75a3.46 3.46 0 0 0-3.458-3.458v.75z"
                    : "M7.652 3.563a.75.75 0 1 0 .432 1.436l-.432-1.436zm10.339 5.7l.652-.371h0l-.652.371zm-2.084 3.125a.75.75 0 0 0 1.126.991l-1.126-.991zm2.084-1.655l-.652-.371h0l.652.371zM2.873 1.76A.75.75 0 0 0 1.812 2.82L2.873 1.76zm-.763 7.504l.652.371h0l-.652-.371zm15.119 8.973a.75.75 0 0 0 1.061-1.061l-1.061 1.061zM2.11 10.734l-.652.371h0l.652-.371zm6.556-2.12a.75.75 0 0 0-1.061-1.061l1.061 1.061zm3.83 3.83a.75.75 0 0 0-1.061-1.061l1.061 1.061zM7.869 4.281l.216.718c3.217-.968 6.874.458 9.255 4.635l.652-.371.652-.371C15.995 4.245 11.68 2.35 7.652 3.563l.216.718zm8.603 8.602l.563.495c.585-.665 1.125-1.424 1.609-2.275l-.652-.371-.652-.371c-.438.768-.919 1.443-1.433 2.027l.563.495zm1.52-3.62l-.652.371c.129.226.128.502.001.727l.652.371.652.371c.391-.686.39-1.527-.001-2.212l-.652.371zM2.342 2.29l-.53.53 3.15 3.15.53-.53.53-.53-3.15-3.15-.53.53zm-.233 6.974l.652.371c.902-1.583 1.99-2.769 3.159-3.579l-.427-.616-.427-.616C3.69 5.777 2.456 7.14 1.458 8.893l.652.371zM5.492 5.44l-.53.53 9.117 9.117.53-.53.53-.53-9.117-9.117-.53.53zm9.117 9.117l-.53.53 3.15 3.15.53-.53.53-.53-3.15-3.15-.53.53zM2.11 10.734l-.652.371c1.62 2.842 3.859 4.66 6.304 5.361 2.452.702 5.037.258 7.274-1.293l-.427-.616-.427-.616c-1.887 1.308-4.01 1.656-6.007 1.084-2.003-.574-3.951-2.096-5.414-4.662l-.652.371zm-.001-1.47l-.652-.371c-.391.686-.389 1.528.001 2.213l.652-.371.652-.371c-.129-.226-.129-.503-.001-.727l-.652-.371zm7.942 3.443v-.75a1.96 1.96 0 0 1-1.958-1.958h-.75-.75a3.46 3.46 0 0 0 3.458 3.458v-.75zM7.342 9.998h.75a1.95 1.95 0 0 1 .574-1.385l-.53-.53-.53-.53a3.45 3.45 0 0 0-1.013 2.445h.75zm4.623 1.915l-.53-.53a1.95 1.95 0 0 1-1.385.574v.75.75a3.45 3.45 0 0 0 2.445-1.013l-.53-.53z"
                }
              />
            </svg>
          </button>
        )}
      </div>
      {errorMessage && (
        <div className="mt-2 text-[0.6875rem] leading-[1rem] font-medium text-[#FE5938]">
          {errorMessage}
        </div>
      )}
      {/* <div className="mt-2 text-body-sm text-red">
                Please enter an email address.
            </div> */}
    </div>
  );
}

export default Field;
