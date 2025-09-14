import Icon from "@/components/Icon";

type SelectIndicatorProps = {
  className?: string;
  isMedium?: boolean;
};

function SelectIndicator({
  className = "",
  isMedium = false,
}: SelectIndicatorProps) {
  const sizeClass = isMedium ? "!size-4" : "!size-5";

  return (
    <Icon
      className={`shrink-0 ml-auto fill-secondary transition-transform group-[[data-open]]:rotate-180 ${sizeClass} ${className}`}
      name="chevron"
    />
  );
}

export default SelectIndicator;
