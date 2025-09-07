import { PaletteRoot } from "./PaletteRoot";
import { PaletteHeader } from "./PaletteHeader";
import { PaletteSearch } from "./PaletteSearch";
import { PaletteCategories } from "./PaletteCategories";
import { PaletteCategory } from "./PaletteCategory";
import { PaletteItems } from "./PaletteItems";
import { PaletteItem } from "./PaletteItem";

// Create compound component using Object.assign
const Palette = Object.assign(PaletteRoot, {
  Header: PaletteHeader,
  Search: PaletteSearch,
  Categories: PaletteCategories,
  Category: PaletteCategory,
  Items: PaletteItems,
  Item: PaletteItem,
});

export { Palette };
export default Palette;
