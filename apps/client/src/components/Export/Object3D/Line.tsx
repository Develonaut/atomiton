type Props = {
  title: string;
  children: React.ReactNode;
};

function Line({ title, children }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-secondary">{title}</span>
      {children}
    </div>
  );
}

export default Line;