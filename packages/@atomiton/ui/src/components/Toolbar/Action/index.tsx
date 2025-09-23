import Tooltip from "#components/Tooltip";

type Props = {
  classIcon?: string;
  iconPath: string;
  tooltip: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

function Action({
  classIcon,
  active,
  onClick,
  iconPath,
  tooltip,
  disabled,
}: Props) {
  return (
    <button
      className={`relative group/button flex items-center justify-center size-10 border rounded-xl transition-all cursor-pointer hover:bg-[#f1f1f1] ${
        active
          ? "bg-[#f1f1f1] border-[#e2e2e2] shadow-[0_-1px_3px_0px_rgba(18,18,18,0.15)_inset,_0px_1.25px_1px_0px_#FFF_inset]"
          : "border-transparent"
      } ${disabled ? "opacity-40 pointer-events-none" : ""}`}
      onClick={onClick}
    >
      <svg
        className={`size-5 fill-[#121212] ${classIcon || ""}`}
        width={20}
        height={20}
        viewBox="0 0 20 20"
      >
        <path d={iconPath} />
      </svg>
      <Tooltip className="absolute bottom-full left-1/2 -translate-x-1/2 flex items-center gap-2 mb-4.5 !p-0.5 !pl-2 text-nowrap [&_span]:flex [&_span]:justify-center [&_span]:items-center [&_span]:size-5 [&_span]:rounded-sm [&_span]:bg-[#303030] [&_span]:border [&_span]:border-[#fcfcfc]/5 invisible opacity-0 transition-all group-hover/button:visible group-hover/button:opacity-100 pointer-events-none">
        {tooltip}
      </Tooltip>
    </button>
  );
}

export default Action;
