type Props = {
  title?: string;
  children: React.ReactNode;
};

const Group = ({ title, children }: Props) => (
  <div className="p-12 border-b border-[#ECECEC] last:border-b-0 max-[1419px]:p-5">
    {title && (
      <div className="mb-5 text-[1.25rem] leading-[1.75rem] font-medium max-[1419px]:text-[1rem] max-[1419px]:leading-[1.5rem]">
        {title}
      </div>
    )}
    {children}
  </div>
);

export default Group;
