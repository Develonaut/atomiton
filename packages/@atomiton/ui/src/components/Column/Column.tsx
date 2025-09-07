import Flex from "../Flex";
import type { ColumnProps } from "./Column.types";

function Column(props: ColumnProps) {
  return <Flex direction="column" {...props} />;
}

export default Column;
