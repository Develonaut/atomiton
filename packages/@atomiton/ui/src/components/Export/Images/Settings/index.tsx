import Item from "./Item";

function Settings() {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center h-6 mb-4">
        <div className="text-[0.75rem] leading-[1rem] font-medium">
          Export images
        </div>
        <button className="flex items-center justify-center size-6 rounded-md fill-[#7B7B7B] cursor-pointer transition-colors hover:bg-[#F1F1F1] hover:fill-[#121212]">
          <svg className="size-4.5" width={20} height={20} viewBox="0 0 20 20">
            <path d="M10 4a.95.95 0 0 1 .947.947v4.105h4.105a.95.95 0 0 1 .939.819L16 10a.95.95 0 0 1-.947.947h-4.105v4.105a.95.95 0 0 1-.819.939L10 16a.95.95 0 0 1-.947-.947v-4.105H4.947a.95.95 0 0 1-.939-.819L4 10a.95.95 0 0 1 .947-.947h4.105V4.947a.95.95 0 0 1 .819-.939L10 4z" />
          </svg>
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Item defaultSize={0} />
        <Item defaultSize={1} />
      </div>
    </div>
  );
}

export default Settings;
