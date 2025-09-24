type Props = {
  value: string;
};

function Title({ value }: Props) {
  return <div className="text-lg font-semibold mb-4">{value}</div>;
}

export default Title;