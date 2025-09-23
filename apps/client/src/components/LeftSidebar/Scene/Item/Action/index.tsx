import Icon from "#components/Icon";

type Props = {
  icon: string;
  iconActive: string;
  active: boolean;
  onClick: () => void;
};

function Action({ icon, iconActive, active, onClick }: Props) {
  return (
    <button
      className={`group transition-opacity group-hover/item:opacity-100 ${
        active ? "opacity-100" : "opacity-0"
      }`}
      onClick={onClick}
    >
      <Icon
        className={`!size-4 transition-colors group-hover:fill-primary ${
          active ? "fill-primary" : "fill-secondary"
        }`}
        name={active ? iconActive : icon}
      />
    </button>
  );
}

export default Action;
