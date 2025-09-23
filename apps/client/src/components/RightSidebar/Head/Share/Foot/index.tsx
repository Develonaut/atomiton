import { toast } from "react-hot-toast";
import Button from "#components/Button";
import Icon from "#components/Icon";
import { useClipboard } from "#utils/clipboard";

function Foot() {
  const link = "https://brainwave.co/file/k373nH";
  const { copy, isCopied } = useClipboard();

  const handleCopy = async () => {
    const success = await copy(link);
    if (success) {
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 border-t border-s-01 bg-surface-02 rounded-b-[1.75rem]">
      <div className="truncate text-body-lg opacity-50">{link}</div>
      <Button
        className="shrink-0 !h-9.5 ml-auto !px-4"
        isPrimary
        onClick={handleCopy}
      >
        <Icon name={isCopied ? "check" : "link"} />
        {isCopied ? "Copied!" : "Copy link"}
      </Button>
    </div>
  );
}

export default Foot;
