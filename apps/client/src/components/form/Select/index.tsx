import SelectIcon from "./SelectIcon";
import SelectIndicator from "./SelectIndicator";
import SelectLabel from "./SelectLabel";
import SelectOption from "./SelectOption";
import SelectOptions from "./SelectOptions";
import SelectPlaceholder from "./SelectPlaceholder";
import SelectRoot from "./SelectRoot";
import SelectTrigger from "./SelectTrigger";
import SelectValue from "./SelectValue";

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

type SelectOption = {
  id: number;
  name: string;
};

export default Select;
