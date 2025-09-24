type Props = {
  title?: string;
  children?: React.ReactNode;
  rightContent?: React.ReactNode;
};

function Group({ title, children, rightContent }: Props) {
  return (
    <div className="p-12 border-b border-[#ECECEC] last:border-b-0 max-[1419px]:p-5">
      {title && (
        <div className="mb-5 flex items-center justify-between text-[1.25rem] leading-[1.75rem] font-medium max-[1419px]:text-[1rem] max-[1419px]:leading-[1.5rem]">
          <span>{title}</span>
          {rightContent && <div>{rightContent}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Group;
