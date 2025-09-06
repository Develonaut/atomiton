type Props = {
  title: string;
  rightContent?: React.ReactNode;
  withoutAddButton?: boolean;
  children?: React.ReactNode;
};

function Group({ title, rightContent, withoutAddButton, children }: Props) {
  return (
    <div className="border-t border-[#ececec] first:border-t-0">
      <div className="flex justify-between items-center min-h-12 px-4 py-3 text-[0.75rem] font-semibold text-[#121212]">
        {title}
        {rightContent ? (
          rightContent
        ) : withoutAddButton ? null : (
          <button className="flex justify-center items-center size-6 shrink-0 rounded-md fill-[#7B7B7B] transition-colors cursor-pointer hover:bg-[#F1F1F1]">
            <svg className="size-4" width={20} height={20} viewBox="0 0 20 20">
              <path d="M10 4a.95.95 0 0 1 .947.947v4.105h4.105a.95.95 0 0 1 .939.819L16 10a.95.95 0 0 1-.947.947h-4.105v4.105a.95.95 0 0 1-.819.939L10 16a.95.95 0 0 1-.947-.947v-4.105H4.947a.95.95 0 0 1-.939-.819L4 10a.95.95 0 0 1 .947-.947h4.105V4.947a.95.95 0 0 1 .819-.939L10 4z" />
            </svg>
          </button>
        )}
      </div>
      {children && <div className="p-4 pt-0">{children}</div>}
    </div>
  );
}

export default Group;
