import TabsContent from "#components/Tabs/TabsContent";
import TabsLegacy from "#components/Tabs/TabsLegacy";
import TabsList from "#components/Tabs/TabsList";
import TabsRoot from "#components/Tabs/TabsRoot";
import TabsTrigger from "#components/Tabs/TabsTrigger";
import type { TabItem } from "#types/tabs";

// Check if props match legacy API
function isLegacyProps(props: unknown): props is {
  items: TabItem[];
  value: TabItem;
  setValue: (value: TabItem) => void;
  isMedium?: boolean;
  className?: string;
  classButton?: string;
} {
  return (
    typeof props === "object" &&
    props !== null &&
    "items" in props &&
    "setValue" in props &&
    "value" in props &&
    (props as { value: { id?: unknown } }).value?.id !== undefined
  );
}

type TabsWrapperProps =
  | {
      items: TabItem[];
      value: TabItem;
      setValue: (value: TabItem) => void;
      isMedium?: boolean;
      className?: string;
      classButton?: string;
    }
  | {
      value?: string | number;
      defaultValue?: string | number;
      onChange?: (value: string | number) => void;
      className?: string;
      isMedium?: boolean;
      children?: React.ReactNode;
    };

// Wrapper component that handles both APIs
function TabsWrapper(props: TabsWrapperProps) {
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
export default Tabs;
