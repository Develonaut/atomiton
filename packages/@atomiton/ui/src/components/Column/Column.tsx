import Flex from "#components/Flex";
import type { ColumnProps } from "#components/Column/Column.types";

function Column(props: ColumnProps) {
  return <Flex direction="column" {...props} />;
}

export default Column;
