type Props = {
  items: {
    id: number;
    title: string;
    path: string;
  }[];
  onClick: (id: number) => void;
  isActive: number;
};

function Menu({ items, onClick, isActive }: Props) {
  return (
    <div className="flex flex-col gap-1 mb-auto">
      {items.map((item) => (
        <button
          className={`group flex items-center p-1 pr-2 w-full border rounded-xl text-[0.75rem] font-medium transition cursor-pointer hover:bg-[#F1F1F1] ${
            isActive === item.id
              ? "bg-[#F1F1F1] border-[#E2E2E2] fill-[#121212]"
              : "border-transparent"
          }`}
          key={item.id}
          onClick={() => onClick(item.id)}
        >
          <div
            className={`flex justify-center items-center size-8 mr-3 rounded-lg transition group-hover:bg-[#fcfcfc] ${
              isActive === item.id
                ? "bg-[#fcfcfc] shadow-[0_0_4px_0_rgba(18,18,18,0.10)]"
                : "bg-[#F1F1F1]"
            }`}
          >
            <svg
              className={`size-4 transition-colors group-hover:fill-primary ${
                isActive === item.id ? "fill-[#121212]" : "fill-[#7B7B7B]"
              }`}
              width={20}
              height={20}
              viewBox="0 0 20 20"
            >
              <path d={item.path} />
            </svg>
          </div>
          <div>{item.title}</div>
          <svg
            className={`size-4 ml-auto fill-[#7B7B7B] transition-opacity ${
              isActive === item.id ? "opacity-100" : "opacity-0"
            }`}
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M7.716 5.231c.288-.308.755-.308 1.043 0l3.237 3.466a1.94 1.94 0 0 1 0 2.605l-3.237 3.466c-.288.308-.755.308-1.043 0a.83.83 0 0 1 0-1.116l3.237-3.466c.096-.103.096-.269 0-.372L7.716 6.348a.83.83 0 0 1 0-1.116z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default Menu;
