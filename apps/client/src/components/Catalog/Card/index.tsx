import Icon from "#components/Icon";
import Image from "#components/Image";
import { useNavigate } from "#router";
import { useTemplates } from "#store/useTemplates";
import {
  convertNodeToEditorNode,
  convertEdgeToEditorEdge,
} from "#utils/editorConverters";
import type { NodeDefinition } from "@atomiton/nodes/definitions";

type Props = {
  value: {
    id: string;
    title: string;
    category: string;
    image: string;
    type: string;
  };
};

function Card({ value }: Props) {
  const navigate = useNavigate();
  const { actions } = useTemplates();
  const template = actions.getTemplate(value.id);

  const handleClick = () => {
    if (value.type === "template" && template) {
      const templateState = {
        defaultNodes:
          template.children?.map((node: NodeDefinition, nodeIndex: number) =>
            convertNodeToEditorNode(node, nodeIndex),
          ) || [],
        defaultEdges: template.edges?.map(convertEdgeToEditorEdge) || [],
        name: template.name,
        description: template.metadata.description,
      };

      navigate({
        to: "/editor/$id",
        params: { id: value.id },
        state: templateState as any,
      });
    }
  };

  const Component = value.type === "template" ? "button" : "div";

  return (
    <Component
      className="group flex flex-col w-[calc(16.666%-0.75rem)] mt-3 mx-1.5 p-2 border border-s-01 bg-surface-01 rounded-3xl transition-shadow cursor-pointer hover:shadow-prompt-input max-[2200px]:w-[calc(20%-0.75rem)] max-[1940px]:w-[calc(25%-0.75rem)] max-xl:w-[calc(33.333%-0.75rem)] max-md:w-[calc(50%-0.75rem)]"
      {...(value.type === "template" ? { onClick: handleClick } : {})}
    >
      <div className="relative mb-2">
        <Image
          className="w-full rounded-2xl"
          src={value.image}
          width={256}
          height={196}
          alt=""
        />
        <div className="absolute top-3 left-3 flex justify-center items-center size-10 rounded-lg bg-surface-01 border border-s-02 shadow-[0_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)] opacity-0 transition-opacity group-hover:opacity-100">
          <Icon name={value.type === "video" ? "video" : "image"} />
        </div>
      </div>
      <div className="grow p-3 max-md:p-1">
        <div className="mb-1 text-body-md-str">{value.title}</div>
        <div className="text-body-sm text-secondary">{value.category}</div>
      </div>
    </Component>
  );
}

export default Card;
