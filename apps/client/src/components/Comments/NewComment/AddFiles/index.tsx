import Icon from "@/components/Icon";

type Props = {
  onClick: () => void;
};

function AddFiles({ onClick }: Props) {
  return (
    <button
      className="size-8 rounded-[0.625rem] transition-colors outline-0 hover:bg-surface-03"
      onClick={onClick}
    >
      <Icon className="fill-secondary" name="plus-circle" />
    </button>
  );
}

export default AddFiles;
