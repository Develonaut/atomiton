import { styled } from "@atomiton/ui";
import type { InspectorProps } from "./Inspector.types";

const InspectorStyled = styled("div", {
  name: "Inspector",
})([
  "atomiton-inspector",
  "flex",
  "flex-col",
  "h-full",
  "bg-surface-01",
  "border-l",
  "border-s-01",
  "overflow-hidden",
]);

/**
 * Inspector component - properties panel for selected items
 * Provides dynamic form generation for editing element properties
 */
export function InspectorRoot({
  children,
  className,
  selectedId,
  data: _data = {},
  fields: _fields = [],
  sections: _sections = [],
  readonly = false,
  onFieldChange,
  onDataChange,
  onAction,
  ...props
}: InspectorProps) {
  return (
    <InspectorStyled
      className={className}
      data-selected-id={selectedId}
      data-readonly={readonly || undefined}
      {...props}
    >
      {children || (
        <div className="flex flex-col h-full">
          {/* Default content will be handled by compound components */}
          {selectedId ? (
            <>{/* These will be imported from separate files */}</>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <h3 className="font-semibold text-text-primary mb-2">
                  No Selection
                </h3>
                <p className="text-sm text-text-secondary">
                  Select an element to view and edit its properties
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </InspectorStyled>
  );
}
