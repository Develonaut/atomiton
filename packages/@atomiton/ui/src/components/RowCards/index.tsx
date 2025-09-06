type Props = {
  children: React.ReactNode;
};

const RowCards = ({ children }: Props) => (
  <div className="flex flex-wrap -mt-2 -mx-1">{children}</div>
);

export default RowCards;
