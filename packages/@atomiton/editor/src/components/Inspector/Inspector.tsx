import { InspectorRoot } from "./InspectorRoot";
import { InspectorHeader } from "./InspectorHeader";
import { InspectorSections } from "./InspectorSections";
import { InspectorSection } from "./InspectorSection";
import { InspectorField } from "./InspectorField";
import { InspectorSimpleField } from "./InspectorSimpleField";
import { InspectorSimpleSection } from "./InspectorSimpleSection";
import { InspectorActions } from "./InspectorActions";
import { InspectorEmpty } from "./InspectorEmpty";

// Create compound component using Object.assign
const Inspector = Object.assign(InspectorRoot, {
  Header: InspectorHeader,
  Sections: InspectorSections,
  Section: InspectorSimpleSection, // Use the simpler section component by default
  SectionAdvanced: InspectorSection, // Keep the advanced section available
  Field: InspectorSimpleField, // Use the simpler field component by default
  FieldAdvanced: InspectorField, // Keep the advanced field available
  Actions: InspectorActions,
  Empty: InspectorEmpty,
});

export { Inspector };
export default Inspector;
