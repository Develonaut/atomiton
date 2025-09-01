import { useState } from "react";
import { toast } from "react-hot-toast";
import Icon from "@/components/Icon";
import Modal from "@/components/Modal";
import Image from "@/components/Image";
import Button from "@/components/Button";
import { useClipboard } from "@/utils/clipboard";

const socials = [
  {
    icon: "threads",
    href: "https://www.threads.net/@ui8net",
  },
  {
    icon: "twitter",
    href: "https://x.com/ui8",
  },
  {
    icon: "instagram",
    href: "https://www.instagram.com/ui8net/",
  },
];

type Props = {
  buttonWithText?: boolean;
  image: string;
};

const Share = ({ buttonWithText, image }: Props) => {
  const [open, setOpen] = useState(false);
  const { copy, isCopied } = useClipboard();

  const link = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    const success = await copy(link);
    if (success) {
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <>
      {buttonWithText ? (
        <button
          className="absolute right-2 bottom-2 z-2 flex items-center gap-1.5 h-10 px-3 border border-transparent rounded-xl text-heading-str text-shade-01 transition-colors opacity-0 hover:bg-shade-01/15 hover:border-shade-01/25 group-hover:opacity-100"
          onClick={() => setOpen(true)}
        >
          <Icon className="!size-4 fill-shade-01" name="share" />
          Share
        </button>
      ) : (
        <button
          className="size-10 border border-s-02 bg-surface-01 rounded-xl transition-colors hover:bg-surface-03"
          onClick={() => setOpen(true)}
        >
          <Icon className="!size-4 fill-primary" name="share" />
        </button>
      )}
      <Modal
        classWrapper="max-w-99 p-2"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="p-5 rounded-3xl bg-surface-02 border border-s-01">
          <Image
            className="w-full"
            src={image}
            width={332}
            height={332}
            alt=""
          />
        </div>
        <div className="p-4">
          <div className="mb-3 text-title-lg">Cute Monster</div>
          <div className="flex gap-5 mb-6">
            <div className="flex items-center gap-2">
              <div className="">
                <Image
                  className="size-5 rounded-full opacity-100"
                  src="/images/avatars/2.png"
                  width={20}
                  height={20}
                  alt=""
                />
              </div>
              <div className="text-body-md-str">randomdash</div>
            </div>
            <div className="flex items-center gap-1.5 text-secondary">
              <Icon className="!size-4 fill-secondary/70" name="clock" />3 Jun,
              2025
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-2">
              {socials.map((social, index) => (
                <a
                  className="social"
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon className="fill-primary" name={social.icon} />
                </a>
              ))}
            </div>
            <Button className="grow" isPrimary onClick={handleCopy}>
              {isCopied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Share;
