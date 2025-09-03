type Props = {
  value: string;
};

const Title = ({ value }: Props) => (
  <div className="px-6 py-4 text-title-lg max-md:px-4">{value}</div>
);

export default Title;
