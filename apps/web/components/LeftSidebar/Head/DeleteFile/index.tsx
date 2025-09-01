import Image from "@/components/Image";
import Button from "@/components/Button";

type Props = {
  onClose: () => void;
};

const DeleteFile = ({ onClose }: Props) => (
  <div className="relative">
    <div className="absolute bottom-[calc(100%-11.25rem)] left-0 right-0 pointer-events-none">
      <Image
        className="w-full opacity-100"
        src="/images/delete-pic.png"
        width={356}
        height={356}
        alt=""
      />
    </div>
    <div className="relative z-2 p-6 pt-39 text-center">
      <div className="mb-2 text-h5">Delete this file?</div>
      <div className="text-p-sm text-secondary">
        This action cannot be undone. Blinky is <br></br>a bit nervous about it
        too.
      </div>
    </div>
    <div className="flex gap-3 p-6 bg-surface-02 border-t border-s-02 rounded-b-4xl">
      <Button className="flex-1" isPrimary onClick={onClose}>
        Cancel
      </Button>
      <Button className="flex-1" isRed>
        Yes, delete it
      </Button>
    </div>
  </div>
);

export default DeleteFile;
