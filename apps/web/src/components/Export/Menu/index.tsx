import Icon from "@/components/Icon";

type Props = {
  items: {
    id: number;
    title: string;
    icon: string;
  }[];
  onClick: (id: number) => void;
  isActive: number;
};

const Menu = ({ items, onClick, isActive }: Props) => {
  return (
    <div className="flex flex-col gap-1 mb-auto">
      {items.map((item) => (
        <button
          className={`group flex items-center p-1 pr-2 w-full border rounded-xl transition hover:bg-surface-03 ${
            isActive === item.id
              ? "bg-surface-03 border-s-02 fill-primary"
              : "border-transparent"
          }`}
          key={item.id}
          onClick={() => onClick(item.id)}
        >
          <div
            className={`flex justify-center items-center size-8 mr-3 rounded-lg text-body-md transition group-hover:bg-surface-01 ${
              isActive === item.id
                ? "bg-surface-01 shadow-[0_0_4px_0_rgba(18,18,18,0.10)]"
                : "bg-surface-03"
            }`}
          >
            <Icon
              className={`!size-4 transition-colors group-hover:fill-primary ${
                isActive === item.id ? "fill-primary" : "fill-secondary"
              }`}
              name={item.icon}
            />
          </div>
          <div>{item.title}</div>
          <Icon
            className={`!size-4 ml-auto fill-secondary transition-opacity ${
              isActive === item.id ? "opacity-100" : "opacity-0"
            }`}
            name="arrow-next"
          />
        </button>
      ))}
    </div>
  );
};

export default Menu;
