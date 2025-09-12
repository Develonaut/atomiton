import SelectRoot from "./SelectRoot";
import SelectTrigger from "./SelectTrigger";
import SelectOptions from "./SelectOptions";
import SelectOption from "./SelectOption";
import SelectValue from "./SelectValue";
import SelectIndicator from "./SelectIndicator";
import SelectPlaceholder from "./SelectPlaceholder";
import SelectIcon from "./SelectIcon";
import SelectLabel from "./SelectLabel";

// Export as compound component with SelectRoot as the base
const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Options: SelectOptions,
  Option: SelectOption,
  Value: SelectValue,
  Indicator: SelectIndicator,
  Placeholder: SelectPlaceholder,
  Icon: SelectIcon,
  Label: SelectLabel,
});

// Also export individual components for direct imports
export {
  SelectRoot,
  SelectTrigger,
  SelectOptions,
  SelectOption,
  SelectValue,
  SelectIndicator,
  SelectPlaceholder,
  SelectIcon,
  SelectLabel,
};

export default Select;
