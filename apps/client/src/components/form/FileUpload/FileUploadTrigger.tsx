import { cloneElement, isValidElement, PropsWithChildren } from "react";
import { useFileUploadContext } from "./FileUploadRoot";

type FileUploadTriggerProps = PropsWithChildren<{
  asChild?: boolean;
  className?: string;
}>;

function FileUploadTrigger({
  children,
  asChild = false,
  className = "",
}: FileUploadTriggerProps) {
  const { fileUploadId } = useFileUploadContext();

  const handleClick = () => {
    const input = document.getElementById(fileUploadId) as HTMLInputElement;
    input?.click();
  };

  // If asChild is true and children is a valid element, clone it with onClick
  if (asChild && isValidElement(children)) {
    return cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
      className:
        `${(children as any).props?.className || ""} ${className}`.trim(),
    });
  }

  // Default trigger button
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`h-9 px-3 border border-surface-03 bg-surface-03 rounded-[0.625rem] text-body-md text-primary outline-0 transition-colors hover:border-s-02 hover:bg-surface-02 ${className}`}
    >
      {children || "Choose File"}
    </button>
  );
}

export default FileUploadTrigger;
