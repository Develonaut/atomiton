import Link from "@/router/Link";
import Icon from "@/components/Icon";

type FieldProps = {
  className?: string;
  classInput?: string;
  label?: string;
  children?: React.ReactNode;
  textarea?: boolean;
  type?: string;
  validated?: boolean;
  forgotPassword?: boolean;
};

const Field = ({
  className,
  classInput,
  label,
  children,
  textarea,
  type,
  validated,
  forgotPassword,
  ...inputProps
}: FieldProps &
  React.InputHTMLAttributes<HTMLInputElement> &
  React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <div className={`${className || ""}`}>
      {label && (
        <div className="flex items-center mb-2">
          <div className="mr-auto">{label}</div>
          {forgotPassword && (
            <Link
              className="text-body-sm text-secondary transition-colors hover:text-primary"
              href="/reset-password"
            >
              Forgot password?
            </Link>
          )}
        </div>
      )}
      <div className={`relative ${textarea ? "text-0" : ""}`}>
        {children}
        {textarea ? (
          <textarea
            className={`w-full h-20 px-5.5 py-4 border-[1.5px] border-s-01 rounded-xl text-body-lg text-primary transition-colors resize-none outline-0 focus:border-s-02 ${
              validated ? "pr-10" : ""
            }  ${classInput || ""}`}
            {...inputProps}
          ></textarea>
        ) : (
          <input
            className={`w-full h-12 px-5.5 border-[1.5px] border-s-01 rounded-xl text-body-lg text-primary transition-colors outline-0 focus:border-s-02 ${
              validated ? "pr-10" : ""
            } ${classInput || ""}`}
            type={type || "text"}
            {...inputProps}
          />
        )}
        {validated && (
          <Icon
            className="absolute top-1/2 right-3.5 -translate-y-1/2 fill-secondary"
            name="check-circle"
          />
        )}
      </div>
      {/* <div className="mt-2 text-body-sm text-red">
                Please enter an email address.
            </div> */}
    </div>
  );
};

export default Field;
