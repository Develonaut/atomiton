import { useFileUploadContext } from "./FileUploadRoot";

type FileUploadTextProps = {
  placeholder?: string;
  className?: string;
};

function FileUploadText({
  placeholder = "No file selected",
  className = "",
}: FileUploadTextProps) {
  const { value } = useFileUploadContext();

  return (
    <span
      className={`text-body-md ${value ? "text-primary" : "text-secondary/50"} ${className}`}
    >
      {value || placeholder}
    </span>
  );
}

export default FileUploadText;
