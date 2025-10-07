import Image from "#components/Image";
import { useLink } from "#router/hooks/useLink";
import { useTemplates } from "#store/useTemplates";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

type TemplateButtonProps = {
  template: NodeDefinition;
  index: number;
};

function TemplateButton({ template, index }: TemplateButtonProps) {
  // Pass raw NodeDefinitions and edges - let the editor handle transformation
  const defaultNodes = template.nodes || [];
  const defaultEdges = template.edges || [];

  const linkProps = useLink({
    to: "/editor/new",
    state: {
      defaultNodes,
      defaultEdges,
      name: template.name,
      description: template.metadata.description,
    },
  });

  return (
    <button
      {...linkProps}
      data-testid={`template-button-${template.id}`}
      className="flex items-center shrink-0 w-59 p-2 bg-surface-02 rounded-[1.25rem] border border-s-01 transition-all hover:shadow-prompt-input hover:bg-surface-01 hover:border-s-02 text-left"
      type="button"
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
  const { templates } = useTemplates();

  return (
    !!templates.length && (
      <div
        data-testid="templates-container"
        className="flex gap-3 py-8 px-12 overflow-x-auto scrollbar-none max-2xl:px-5"
      >
        {templates.map((template: NodeDefinition, index: number) => (
          <TemplateButton key={template.id} template={template} index={index} />
        ))}
      </div>
    )
  );
}

export default Templates;
