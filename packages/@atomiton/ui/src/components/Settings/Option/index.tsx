type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

function Option({ title, description, children }: Props) {
  return (
    <div className="flex items-center min-h-14 px-6 py-4 border-t border-[#ECECEC] max-md:px-4">
      <div className="mr-auto pr-3">
        <div className="text-[0.75rem] leading-[1rem] font-medium">{title}</div>
        {description && (
          <div className="mt-2 text-[0.6875rem] leading-[1rem] font-medium text-[#7B7B7B]/80">
            {description}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default Option;
