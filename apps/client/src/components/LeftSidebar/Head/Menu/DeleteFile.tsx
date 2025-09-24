import Button from "#components/Button";
import Modal from "#components/Modal";
import Icon from "#components/Icon";

type Props = {
  open: boolean;
  onClose: () => void;
};

function DeleteFile({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} className="max-w-md">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center justify-center size-12 bg-red-100 rounded-full">
            <Icon className="!size-6 fill-red-600" name="trash" />
          </div>
          <p className="text-primary">
            Are you sure you want to delete this file? This action cannot be
            undone.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onClose} isSecondary className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Handle file deletion
              onClose();
            }}
            isPrimary
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default DeleteFile;
