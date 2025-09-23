import { useState } from "react";
import { toast } from "react-hot-toast";
import Icon from "#components/Icon";
import Modal from "#components/Modal";
import Image from "#components/Image";
import Button from "#components/Button";
import { useClipboard } from "#utils/clipboard";

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
  images: {
    id: number;
    title: string;
    image: string;
  }[];
};
function Share({ images }: Props) {
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
      <Button className="max-md:grow" isPrimary onClick={() => setOpen(true)}>
        Share
      </Button>
      <Modal
        classWrapper="max-w-105 p-2"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex gap-1">
          {images.map((item, index) => (
            <div
              className="flex-1 rounded-lg overflow-hidden first:rounded-l-3xl last:rounded-r-3xl"
              key={index}
            >
              <Image
                className="w-full h-36 object-cover"
                src={item.image}
                width={132}
                height={144}
                alt=""
              />
            </div>
          ))}
        </div>
        <div className="relative z-2 size-22 -mt-11 mx-auto mb-3 border-4 border-surface-01 rounded-full">
          <Image
            className="size-20 rounded-full object-cover"
            src="/images/avatars/1.png"
            width={80}
            height={80}
            alt=""
          />
        </div>
        <div className="mb-2 text-center">
          <div className="text-h6">Sophie Bennett ®</div>
          <div className="mt-1 text-body-lg-str text-secondary">159 scenes</div>
        </div>
        <div className="p-4">
          <div className="flex justify-center gap-2">
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
            <Button isPrimary onClick={handleCopy}>
              {isCopied ? "Copied!" : "Copy link"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default Share;
