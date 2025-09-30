import { Link, usePathname } from "#router";
import { Icon } from "@atomiton/ui";

type NavLinkProps = {
  title: string;
  icon: string;
  href: string;
  onClick?: () => void;
};

function NavLink({ title, icon, href, onClick }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      className={`group relative flex items-center p-0.75 rounded-xl text-body-md-str border transition-colors hover:bg-surface-03 ${
        isActive ? "bg-surface-03 border-s-01" : "border-transparent"
      }`}
      to={href}
      onClick={onClick}
    >
      <div
        className={`flex justify-center items-center size-8 mr-3 rounded-lg transition ${
          isActive ? "bg-surface-01 shadow-[0_0_4px_0_rgba(18,18,18,0.10)]" : ""
        }`}
      >
        <Icon
          className={`transition-colors group-hover:fill-t-primary ${
            isActive ? "opacity-100" : "opacity-50"
          }`}
          name={icon}
        />
      </div>
      {title}
    </Link>
  );
}

export default NavLink;
