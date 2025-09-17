import Image from "@/components/Image";
import { useLink } from "@/router";
import type { Blueprint } from "@/stores/blueprint";
import { useBlueprints } from "@/stores/blueprint";

type TemplateButtonProps = {
  template: Blueprint;
  index: number;
};

function TemplateButton({ template, index }: TemplateButtonProps) {
  const linkProps = useLink({
    to: "/editor/new",
    state: {
      defaultNodes: template.nodes || [],
      defaultEdges: template.edges || [],
      name: template.name,
      description: template.description,
    },
  });

  return (
    <button
      className="flex items-center shrink-0 w-59 p-2 bg-surface-02 rounded-[1.25rem] border border-s-01 transition-all hover:shadow-prompt-input hover:bg-surface-01 hover:border-s-02 text-left"
      type="button"
      {...linkProps}
    >
      <div className="shrink-0 w-16 h-16">
        <Image
          className="rounded-xl w-full h-full object-cover"
          src={`/images/scenes/${(index % 12) + 1}.jpg`}
          width={64}
          height={64}
          alt={template.name}
        />
      </div>
      <div className="pl-4 w-[calc(100%-4rem)]">
        <div className="text-body-md-str">{template.name}</div>
        <div className="mt-1 text-secondary">Template</div>
      </div>
    </button>
  );
}

function Templates() {
  const { templates } = useBlueprints();

  return (
    !!templates.length && (
      <div className="flex gap-3 py-8 px-12 overflow-x-auto scrollbar-none max-2xl:px-5">
        {templates.map((template, index) => (
          <TemplateButton key={template.id} template={template} index={index} />
        ))}
      </div>
    )
  );
}

export default Templates;
