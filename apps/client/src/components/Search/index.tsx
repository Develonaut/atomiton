import Icon from "#components/Icon";

type Props = {
  className?: string;
  search: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

function Search({ className, search, onChange, handleSubmit }: Props) {
  return (
    <form
      className={`relative w-65 ml-4 ${className || ""}`}
      onSubmit={handleSubmit}
    >
      <button className="absolute top-1 left-1 bottom-1 z-2 w-8 fill-secondary transition-colors hover:fill-primary">
        <Icon className="!size-4 fill-inherit" name="search" />
      </button>
      <input
        className="w-full h-10 pl-12 pr-14 border border-s-02 outline-0 bg-surface-02 rounded-xl text-body-md text-primary placeholder:text-secondary"
        type="text"
        placeholder="Search files..."
        value={search}
        onChange={onChange}
        autoComplete="off"
      />
      <div className="key absolute top-1/2 right-2.5 -translate-y-1/2">⌘ K</div>
    </form>
  );
}

export default Search;
