import { Link, usePathname } from "#router";
import { Icon } from "@atomiton/ui";
import type { ReactNode } from "react";
import { Children, isValidElement, useState } from "react";
import AnimateHeight from "react-animate-height";

type DropdownProps = {
  title: string;
  icon: string;
  href?: string;
  counter?: number;
  defaultOpen?: boolean;
  children?: ReactNode;
};

type DropdownItemProps = {
  href: string;
  children: ReactNode;
};

export function DropdownItem({ href, children }: DropdownItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      className={`relative flex items-center h-10 pl-12 pr-3 text-body-md-str transition-colors hover:text-primary before:absolute before:top-0 before:left-4.75 before:bottom-5 before:w-4 before:border-l-[1.5px] before:border-b-[1.5px] before:border-shade-04 before:rounded-bl-lg ${
        isActive ? "text-primary" : "text-secondary"
      }`}
      to={href}
    >
      {children}
      <Icon
        className={`!size-4 ml-auto -rotate-90 transition-opacity ${
          isActive ? "opacity-100" : "opacity-0"
        }`}
        name="chevron-down"
      />
    </Link>
  );
}

function Dropdown({
  title,
  icon,
  href,
  counter,
  defaultOpen = false,
  children,
}: DropdownProps) {
  const pathname = usePathname();
  const isActive = href && pathname.includes(href);

  // Check if any child DropdownItem is active
  const isActiveChild = Children.toArray(children).some((child) => {
    if (isValidElement(child) && child.props.href) {
      return pathname === child.props.href;
    }
    return false;
  });

  const isAnyActive = isActive || isActiveChild;

  const [height, setHeight] = useState<number | "auto">(
    defaultOpen || isAnyActive ? "auto" : 0,
  );

  return (
    <div className="relative">
      <div
        className={`group relative flex items-center w-full p-0.75 pr-3 border rounded-xl text-body-md-str text-primary transition-colors cursor-pointer hover:bg-surface-03 ${
          height === 0 ? "" : "bg-surface-03"
        } ${isAnyActive ? "bg-surface-03 border-s-01" : "border-transparent"}`}
        onClick={() => !href && setHeight(height === 0 ? "auto" : 0)}
      >
        {href && (
          <Link className="absolute inset-0 z-2" to={href}>
            <span className="sr-only">{title}</span>
          </Link>
        )}
        <div
          className={`flex justify-center items-center size-8 mr-3 rounded-lg transition ${
            isAnyActive
              ? "bg-[#fcfcfc] shadow-[0_0_4px_0_rgba(18,18,18,0.10)] fill-[#121212]"
              : "fill-[#7b7b7b]"
          }`}
        >
          <Icon name={icon} />
        </div>
        <div className="mr-auto">{title}</div>
        {counter && <div className="key">{counter}</div>}
        <div
          className="relative z-3"
          onClick={() => href && setHeight(height === 0 ? "auto" : 0)}
        >
          <Icon
            className={`!size-4 ml-3 transition-transform ${
              height === 0 ? "" : "rotate-180"
            }`}
            name="chevron-down"
          />
        </div>
      </div>
      <AnimateHeight duration={500} height={height}>
        <div className="relative flex flex-col pt-0.5 before:absolute before:top-0 before:left-4.75 before:bottom-8 before:w-[1.5px] before:bg-shade-04">
          {children}
        </div>
      </AnimateHeight>
    </div>
  );
}

export default Dropdown;
