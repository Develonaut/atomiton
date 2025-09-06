type Props = {
  children: React.ReactNode;
};

function RowCards({ children }: Props) {
  return <div className="flex flex-wrap -mt-2 -mx-1">{children}</div>;
}

export default RowCards;
