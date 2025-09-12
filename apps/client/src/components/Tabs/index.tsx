import TabsContent from "./TabsContent";
import TabsList from "./TabsList";
import TabsRoot from "./TabsRoot";
import TabsTrigger from "./TabsTrigger";
import TabsLegacy from "./TabsLegacy";
import { TabItem } from "@/types";

// Check if props match legacy API
function isLegacyProps(props: any): props is {
  items: TabItem[];
  value: TabItem;
  setValue: (value: TabItem) => void;
  isMedium?: boolean;
  className?: string;
  classButton?: string;
} {
  return (
    "items" in props && "setValue" in props && props.value?.id !== undefined
  );
}

// Wrapper component that handles both APIs
function TabsWrapper(props: any) {
  // If using legacy API, use TabsLegacy
  if (isLegacyProps(props)) {
    return <TabsLegacy {...props} />;
  }
  // Otherwise use new composition API
  return <TabsRoot {...props} />;
}

// Export as compound component with wrapper as the base
const Tabs = Object.assign(TabsWrapper, {
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
});

// Also export individual components for direct imports
export { TabsContent, TabsList, TabsRoot, TabsTrigger, TabsLegacy };

export default Tabs;
