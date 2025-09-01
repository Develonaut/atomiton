import Icon from "@/components/Icon";

type Props = {
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

const Search = ({ search, onChange, handleSubmit }: Props) => {
  return (
    <form className="relative mb-2" onSubmit={handleSubmit}>
      <button className="absolute top-1 left-1 bottom-1 z-2 w-8 rounded-lg fill-secondary transition-all hover:bg-surface-01 hover:shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)] hover:fill-primary">
        <Icon className="!size-4 fill-inherit" name="search" />
      </button>
      <input
        className="w-full h-10 pl-12 pr-3 border border-s-02 outline-0 bg-surface-02 rounded-xl shadow-[0px_1px_3px_0px_rgba(18,18,18,0.10)_inset] text-body-md text-primary placeholder:text-secondary transition-colors hover:border-shade-06/50"
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={onChange}
        autoComplete="off"
      />
    </form>
  );
};

export default Search;
