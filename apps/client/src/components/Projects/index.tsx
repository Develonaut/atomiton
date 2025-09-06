import Link from "@/router/Link";
import Image from "@/components/Image";

type Props = {
  projects: {
    id: number;
    title: string;
    description: string;
    images: string;
  }[];
};

function Project({ projects }: Props) {
  return (
    projects && (
      <div className="flex gap-3 py-8 px-12 overflow-x-auto scrollbar-none max-2xl:px-5">
        {projects.map((project) => (
          <Link
            className="flex items-center shrink-0 w-59 p-2 bg-surface-02 rounded-[1.25rem] border border-s-01 transition-all hover:shadow-prompt-input hover:bg-surface-01 hover:border-s-02"
            href="/explore/details"
            key={project.id}
          >
            <div className="shrink-0">
              <Image
                className="rounded-xl"
                src={project.images}
                width={64}
                height={64}
                alt={project.title}
              />
            </div>
            <div className="pl-4 w-[calc(100%-4rem)]">
              <div className="text-body-md-str">{project.title}</div>
              <div className="mt-1 text-secondary">{project.description}</div>
            </div>
          </Link>
        ))}
      </div>
    )
  );
}

export default Project;
