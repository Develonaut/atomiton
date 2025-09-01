type PropsLine = {
  title: string;
  children: React.ReactNode;
};

const Line = ({ title, children }: PropsLine) => {
  return (
    <div className="flex">
      <div className="mr-auto pt-2.5 pr-3 text-body-md-str">{title}</div>
      <div className="shrink-0 w-40">{children}</div>
    </div>
  );
};

export default Line;
