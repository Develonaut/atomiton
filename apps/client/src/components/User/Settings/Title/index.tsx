type Props = {
  value: string;
};

function Title({ value }: Props) {
  return <div className="px-6 py-4 text-title-lg max-md:px-4">{value}</div>;
}

export default Title;
