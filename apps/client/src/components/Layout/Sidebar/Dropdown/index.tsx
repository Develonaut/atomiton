import { useState } from "react";
import { usePathname } from "#router";
import { Link } from "#router";
import AnimateHeight from "react-animate-height";
import Icon from "#components/Icon";

type DropdownProps = {
  value: {
    title: string;
    icon: string;
    href?: string;
    counter?: number;
    list?: {
      title: string;
      href: string;
    }[];
  };
};

function Dropdown({ value }: DropdownProps) {
  const pathname = usePathname();
  const isActive = value.href && pathname.includes(value.href);
  const isActiveLink = value.list?.some((item) => pathname.includes(item.href));
  const [height, setHeight] = useState<number | "auto">(
    isActiveLink || isActive ? "auto" : 0,
  );

  return (
    <div className="relative">
      <div
        className={`group relative flex items-center w-full p-0.75 pr-3 border rounded-xl text-body-md-str text-primary transition-colors cursor-pointer hover:bg-surface-03 ${
          height === 0 ? "" : "bg-surface-03"
        } ${isActive ? "bg-surface-03 border-s-01" : "border-transparent"}`}
        onClick={() => !value.href && setHeight(height === 0 ? "auto" : 0)}
      >
        {value.href && (
          <Link className="absolute inset-0 z-2" to={value.href}>
            <span className="sr-only">{value.title}</span>
          </Link>
        )}
        <div
          className={`flex justify-center items-center size-8 mr-3 rounded-lg transition ${
            isActive
              ? "bg-surface-01 shadow-[0_0_4px_0_rgba(18,18,18,0.10)] fill-primary"
              : "fill-secondary"
          }`}
        >
          <Icon className="fill-inherit" name={value.icon} />
        </div>
        <div className="mr-auto">{value.title}</div>
        {value.counter && <div className="key">{value.counter}</div>}
        <div
          className="relative z-3"
          onClick={() => value.href && setHeight(height === 0 ? "auto" : 0)}
        >
          <Icon
            className={`!size-4 ml-3 fill-secondary transition-transform ${
              height === 0 ? "" : "rotate-180"
            }`}
            name="chevron"
          />
        </div>
      </div>
      <AnimateHeight duration={500} height={height}>
        <div className="relative flex flex-col pt-0.5 before:absolute before:top-0 before:left-4.75 before:bottom-8 before:w-[1.5px] before:bg-shade-04">
          {value.list?.map((item, index) => (
            <Link
              className={`relative flex items-center h-10 pl-12 pr-3 text-body-md-str transition-colors hover:text-primary before:absolute before:top-0 before:left-4.75 before:bottom-5 before:w-4 before:border-l-[1.5px] before:border-b-[1.5px] before:border-shade-04 before:rounded-bl-lg ${
                pathname === item.href ? "text-primary" : "text-secondary"
              }`}
              onClick={() => setHeight("auto")}
              to={item.href}
              key={index}
            >
              {item.title}
              <Icon
                className={`!size-4 ml-auto -rotate-90 fill-secondary transition-opacity ${
                  pathname === item.href ? "opacity-100" : "opacity-0"
                }`}
                name="chevron"
              />
            </Link>
          ))}
        </div>
      </AnimateHeight>
    </div>
  );
}

export default Dropdown;
