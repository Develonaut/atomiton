import Icon from "#components/Icon";
import { Link, usePathname } from "#router";

type NavLinkProps = {
  value: {
    title: string;
    icon: string;
    href: string;
  };
  onClick?: () => void;
};

function NavLink({ value, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  return (
    <Link
      className={`group relative flex items-center p-0.75 rounded-xl text-body-md-str border transition-colors hover:bg-surface-03 ${
        isActive(value.href)
          ? "bg-surface-03 border-s-01"
          : "border-transparent"
      }`}
      to={value.href}
      onClick={onClick}
    >
      <div
        className={`flex justify-center items-center size-8 mr-3 rounded-lg transition ${
          isActive(value.href)
            ? "bg-surface-01 shadow-[0_0_4px_0_rgba(18,18,18,0.10)]"
            : ""
        }`}
      >
        <Icon
          className={`transition-colors group-hover:fill-t-primary ${
            isActive(value.href) ? "fill-primary" : "fill-secondary"
          }`}
          name={value.icon}
        />
      </div>
      {value.title}
    </Link>
  );
}

export default NavLink;
