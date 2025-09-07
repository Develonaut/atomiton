import Flex from "../Flex";
import type { RowProps } from "./Row.types";

function Row(props: RowProps) {
  return <Flex direction="row" {...props} />;
}

export default Row;
