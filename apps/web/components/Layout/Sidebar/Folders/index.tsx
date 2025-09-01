import Folder from "@/components/Folder";
import NewFolder from "@/components/NewFolder";

type Props = {
  folders: {
    title: string;
    color: string;
    href: string;
  }[];
};

const Folders = ({ folders }: Props) => {
  return (
    <div className="mt-0.5">
      <NewFolder />
      <div className="flex flex-col gap-0.5 mt-0.5">
        {folders.map((folder, index) => (
          <Folder item={folder} key={index} />
        ))}
      </div>
    </div>
  );
};

export default Folders;
