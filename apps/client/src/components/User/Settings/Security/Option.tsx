type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Option({ title, description, children }: Props) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <div className="text-sm font-medium">{title}</div>
        {description && (
          <div className="text-xs text-secondary mt-1">{description}</div>
        )}
      </div>
      {children}
    </div>
  );
}

export default Option;