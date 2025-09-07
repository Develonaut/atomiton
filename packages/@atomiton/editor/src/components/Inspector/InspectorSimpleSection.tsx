import { InspectorSection } from "./InspectorSection";

interface InspectorSimpleSectionProps {
  title: string;
  children?: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean; // Accept defaultOpen
  defaultCollapsed?: boolean; // Also accept defaultCollapsed
  className?: string;
}

/**
 * Wrapper for InspectorSection that accepts defaultOpen prop
 * and converts it to defaultCollapsed
 */
export function InspectorSimpleSection({
  title,
  children,
  collapsible,
  defaultOpen,
  defaultCollapsed,
  className,
  ...props
}: InspectorSimpleSectionProps) {
  // If defaultOpen is provided, convert it to defaultCollapsed
  const actualDefaultCollapsed =
    defaultOpen !== undefined ? !defaultOpen : defaultCollapsed;

  return (
    <InspectorSection
      title={title}
      collapsible={collapsible}
      defaultCollapsed={actualDefaultCollapsed}
      className={className}
      {...props}
    >
      {children}
    </InspectorSection>
  );
}
