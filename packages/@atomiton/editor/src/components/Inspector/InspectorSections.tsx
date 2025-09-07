import { styled } from "@atomiton/ui";
import type { InspectorSectionsProps } from "./Inspector.types";

const InspectorSectionsStyled = styled("div", {
  name: "InspectorSections",
})([
  "atomiton-inspector-sections",
  "flex-1",
  "overflow-y-auto",
  "divide-y",
  "divide-s-01",
]);

/**
 * Inspector sections container
 */
export function InspectorSections({
  children,
  className,
  ...props
}: InspectorSectionsProps) {
  return (
    <InspectorSectionsStyled className={className} {...props}>
      {children}
    </InspectorSectionsStyled>
  );
}
