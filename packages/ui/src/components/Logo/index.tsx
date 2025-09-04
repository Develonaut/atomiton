import Link from "@/components/Link";
import Image from "@/components/Image";

type Props = {
  className?: string;
  onlyIcon?: boolean;
  onlyText?: boolean;
};

const Logo = ({ className, onlyIcon, onlyText }: Props) => (
  <Link
    className={`inline-flex items-center gap-3 p-1 ${className || ""}`}
    href="/"
  >
    {!onlyText && (
      <Image
        className="size-8"
        src="/images/logo-icon.svg"
        width={32}
        height={32}
        alt="Logo"
      />
    )}
    {!onlyIcon && (
      <Image
        className="w-25.5 h-4"
        src="/images/logo-text.svg"
        width={102}
        height={16}
        alt="Logo"
      />
    )}
  </Link>
);

export default Logo;
