import Icon from "@/components/Icon";

type Props = {
  onClick: () => void;
};

const AddFiles = ({ onClick }: Props) => (
  <button
    className="size-8 rounded-[0.625rem] transition-colors outline-0 hover:bg-surface-03"
    onClick={onClick}
  >
    <Icon className="fill-secondary" name="plus-circle" />
  </button>
);

export default AddFiles;
