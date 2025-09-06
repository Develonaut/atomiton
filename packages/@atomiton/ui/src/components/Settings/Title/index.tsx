type Props = {
  value: string;
};

function Title({ value }: Props) {
  return (
    <div className="px-6 py-4 text-[1.125rem] leading-[1.6875rem] font-medium max-md:px-4">
      {value}
    </div>
  );
}

export default Title;
