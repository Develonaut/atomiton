import { createContext, useContext, useState, PropsWithChildren } from "react";

type FileUploadContextValue = {
  value: string;
  onChange: (value: string) => void;
  onFileSelect?: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  fileUploadId: string;
};

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export const useFileUploadContext = () => {
  const context = useContext(FileUploadContext);
  if (!context) {
    throw new Error(
      "FileUpload components must be used within a FileUpload.Root",
    );
  }
  return context;
};

type FileUploadRootProps = PropsWithChildren<{
  value: string;
  onChange: (value: string) => void;
  onFileSelect?: (file: File) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}>;

function FileUploadRoot({
  value,
  onChange,
  onFileSelect,
  accept,
  multiple = false,
  disabled = false,
  className = "",
  children,
}: FileUploadRootProps) {
  // Generate unique ID for connecting label and input
  const [fileUploadId] = useState(
    () => `file-upload-${Math.random().toString(36).substr(2, 9)}`,
  );

  return (
    <FileUploadContext.Provider
      value={{
        value,
        onChange,
        onFileSelect,
        accept,
        multiple,
        disabled,
        fileUploadId,
      }}
    >
      <div className={`flex items-center gap-2 ${className}`}>{children}</div>
    </FileUploadContext.Provider>
  );
}

export default FileUploadRoot;
