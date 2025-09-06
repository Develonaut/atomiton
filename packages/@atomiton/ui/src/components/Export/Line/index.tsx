type Props = {
  title: string;
  children: React.ReactNode;
};

const Line = ({ title, children }: Props) => {
  return (
    <div className="flex">
      <div className="mr-auto pt-2.5 pr-3 text-[0.75rem] font-semibold">
        {title}
      </div>
      <div className="shrink-0 w-40">{children}</div>
    </div>
  );
};

export default Line;
