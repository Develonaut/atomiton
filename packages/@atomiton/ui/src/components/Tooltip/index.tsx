type Props = {
  className?: string;
  children: React.ReactNode;
};

const Tooltip = ({ className, children }: Props) => (
  <div
    className={`px-1.5 py-1 rounded-md bg-[#121212] shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.40)] text-[0.6875rem] leading-[1rem] font-medium text-[#E2E2E2] ${
      className || ""
    }`}
  >
    {children}
  </div>
);

export default Tooltip;
