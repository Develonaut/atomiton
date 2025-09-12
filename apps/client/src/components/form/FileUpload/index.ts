import FileUploadRoot from "./FileUploadRoot";
import FileUploadTrigger from "./FileUploadTrigger";
import FileUploadHiddenInput from "./FileUploadHiddenInput";
import FileUploadText from "./FileUploadText";

// Create compound component
const FileUpload = Object.assign(FileUploadRoot, {
  Root: FileUploadRoot,
  Trigger: FileUploadTrigger,
  HiddenInput: FileUploadHiddenInput,
  Text: FileUploadText,
});

export default FileUpload;
