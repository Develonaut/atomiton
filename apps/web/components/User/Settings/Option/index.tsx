type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const Option = ({ title, description, children }: Props) => (
  <div className="flex items-center min-h-14 px-6 py-4 border-t border-s-01 max-md:px-4">
    <div className="mr-auto pr-3">
      <div className="">{title}</div>
      {description && (
        <div className="mt-2 text-body-sm text-secondary/80">{description}</div>
      )}
    </div>
    {children}
  </div>
);

export default Option;
