import { JsonTreeView as PrimitiveJsonTreeView } from "#primitives/jsonTreeView";
import type { JsonTreeViewProps } from "#components/JsonTreeView/JsonTreeView.types";

function JsonTreeView({
  data,
  rootName = "root",
  defaultExpanded = true,
  className,
}: JsonTreeViewProps) {
  return (
    <PrimitiveJsonTreeView
      data={data}
      rootName={rootName}
      defaultExpanded={defaultExpanded}
      className={className}
    />
  );
}

export default JsonTreeView;
