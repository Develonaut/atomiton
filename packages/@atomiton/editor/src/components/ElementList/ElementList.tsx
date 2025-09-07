import { ElementListRoot } from "./ElementListRoot";
import { ElementListHeader } from "./ElementListHeader";
import { ElementListSearch } from "./ElementListSearch";
import { ElementListTree } from "./ElementListTree";
import { ElementListItem } from "./ElementListItem";
import { ElementListGroup } from "./ElementListGroup";
import { ElementListEmpty } from "./ElementListEmpty";

// Create compound component using Object.assign
const ElementList = Object.assign(ElementListRoot, {
  Header: ElementListHeader,
  Search: ElementListSearch,
  Tree: ElementListTree,
  Item: ElementListItem,
  Group: ElementListGroup,
  Empty: ElementListEmpty,
});

export { ElementList };
export default ElementList;
