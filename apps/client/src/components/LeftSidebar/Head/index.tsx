import Link from "@/router/Link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Menu from "./Menu";

function Head() {
  return (
    <div className="p-4 pb-3 border-b border-s-01">
      <div className="flex justify-between items-center mb-3">
        <Link href="/">
          <Image
            className="size-8 opacity-100"
            src="/images/logo.svg"
            width={32}
            height={32}
            alt="Logo"
          />
        </Link>
        <button className="btn-icon size-8">
          <Icon name="toggle" />
        </button>
      </div>
      <Menu />
      <div className="py-0.5 text-body-md text-secondary/80">
        3D Design Project
      </div>
    </div>
  );
}

export default Head;
