import Button from "#components/Button";
import Modal from "#components/Modal";
import Field from "#components/Field";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

function Folders({ open, onClose }: Props) {
  const [folderName, setFolderName] = useState("");

  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <Field
          label="Folder Name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Enter folder name"
        />
        <div className="flex gap-3 mt-6">
          <Button onClick={onClose} isSecondary className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Handle folder creation
              onClose();
            }}
            isPrimary
            className="flex-1"
          >
            Create
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default Folders;
