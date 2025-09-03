type NavLinkProps = {
  value: {
    title: string;
    iconPath: string;
    active: boolean;
  };
  onClick?: () => void;
};

const NavLink = ({ value }: NavLinkProps) => {
  return (
    <button
      className={`group relative flex items-center w-full p-0.75 rounded-xl text-[0.75rem] font-semibold border transition-colors cursor-pointer hover:bg-[#f1f1f1] ${
        value.active ? "bg-[#f1f1f1] border-[#ececec]" : "border-transparent"
      }`}
    >
      <div
        className={`flex justify-center items-center size-8 mr-3 rounded-lg transition ${
          value.active
            ? "bg-[#fcfcfc] shadow-[0_0_4px_0_rgba(18,18,18,0.10)]"
            : ""
        }`}
      >
        <svg
          className={`transition-colors group-hover:fill-[#121212] ${
            value.active ? "fill-[#121212]" : "fill-[#7b7b7b]"
          }`}
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d={value.iconPath} />
        </svg>
      </div>
      {value.title}
    </button>
  );
};

export default NavLink;
