import Flex from "#components/Flex";
import type { RowProps } from "#components/Row/Row.types";

function Row(props: RowProps) {
  return <Flex direction="row" {...props} />;
}

export default Row;
