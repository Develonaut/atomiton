type Props = {
  item: {
    title: string;
    color: string;
  };
};

const svg = (color: string) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    fill={color}
    viewBox="0 0 20 20"
  >
    <path opacity=".2" d="M2 10.385h16v6H2z" />
    <path d="M7.441 2.76c.808 0 1.563.404 2.011 1.076l.677 1.016c.17.255.456.408.763.408h5.15c1.335 0 2.417 1.082 2.417 2.417v7.083c0 1.335-1.082 2.417-2.417 2.417H3.958c-1.335 0-2.417-1.082-2.417-2.417V5.177c0-1.335 1.082-2.417 2.417-2.417h3.483zm0 1.5H3.958c-.506 0-.917.41-.917.917v9.583c0 .506.41.917.917.917h12.083c.506 0 .917-.41.917-.917V7.677c0-.506-.41-.917-.917-.917h-5.15c-.808 0-1.563-.404-2.011-1.076l-.677-1.016c-.17-.255-.456-.408-.763-.408z" />
  </svg>
);

function Folder({ item }: Props) {
  return (
    <button className="flex items-center p-0.75 rounded-xl text-[0.75rem] font-semibold border border-transparent cursor-pointer transition-colors hover:bg-[#f1f1f1]">
      <div className="flex justify-center items-center size-8 mr-3">
        {svg(item.color)}
      </div>
      {item.title}
    </button>
  );
}

export default Folder;
