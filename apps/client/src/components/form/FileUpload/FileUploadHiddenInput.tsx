import { useRef, useEffect } from "react";
import { useFileUploadContext } from "./FileUploadRoot";

function FileUploadHiddenInput() {
  const { onChange, onFileSelect, accept, multiple, disabled, fileUploadId } =
    useFileUploadContext();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (multiple) {
        // Handle multiple files
        const fileNames = Array.from(files)
          .map((f) => f.name)
          .join(", ");
        onChange(fileNames);
        if (onFileSelect) {
          // Call onFileSelect for each file
          Array.from(files).forEach((file) => onFileSelect(file));
        }
      } else {
        // Handle single file
        const file = files[0];
        onChange(file.name);
        if (onFileSelect) {
          onFileSelect(file);
        }
      }
    }
  };

  return (
    <input
      ref={inputRef}
      id={fileUploadId}
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={handleFileChange}
      className="sr-only"
      disabled={disabled}
      aria-hidden="true"
    />
  );
}

export default FileUploadHiddenInput;
