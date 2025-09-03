const FileMenu = () => {
  const items = [
    {
      title: "Export...",
      keyName: "⇧⌘E",
      onClick: () => {},
    },
    {
      title: "Create new scene...",
      keyName: "⌘N",
      onClick: () => {},
    },
    {
      title: "Duplicate",
      keyName: "⌘D",
      onClick: () => {},
    },
    {
      title: "Rename",
      onClick: () => {},
    },
    {
      title: "Move to folder...",
      onClick: () => {},
    },
    {
      title: "Delete",
      onClick: () => {},
    },
  ];

  return (
    <div className="w-51 p-2 rounded-[1.25rem] bg-[#FCFCFC] border border-[#ECECEC] shadow-2xl">
      {items.map((item, index) => (
        <button
          className="flex justify-between items-center gap-2.5 h-9 w-full px-2 rounded-xl text-[0.75rem] leading-[1rem] font-medium cursor-pointer transition-colors hover:bg-[#F1F1F1] nth-3:relative nth-3:mb-4 nth-3:after:absolute nth-3:after:top-[calc(100%+0.5rem)] nth-3:after:-left-2 nth-3:after:-right-2 nth-3:after:h-0.25 nth-3:after:bg-[#ECECEC] nth-3:after:pointer-events-none"
          key={index}
          onClick={item.onClick}
        >
          {item.title}
          {item.keyName && (
            <div className="ml-auto text-center px-1.5 py-0.5 bg-[#F1F1F1] rounded-md shadow-[0_0px_0px_1px_rgba(0,0,0,0.11),0px_2px_0.8px_0px_rgba(255,255,255,0.27)_inset,0px_-1px_0.6px_0px_rgba(0,0,0,0.20)_inset,0px_1px_4.2px_-1px_rgba(0,0,0,0.25)] text-[0.6875rem] leading-[1rem] font-medium text-[#7B7B7B]">
              {item.keyName}
            </div>
          )}
        </button>
      ))}
    </div>
  );
};

export default FileMenu;
