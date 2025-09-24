import SelectIcon from "#components/form/Select/SelectIcon";
import SelectIndicator from "#components/form/Select/SelectIndicator";
import SelectLabel from "#components/form/Select/SelectLabel";
import SelectOption from "#components/form/Select/SelectOption";
import SelectOptions from "#components/form/Select/SelectOptions";
import SelectPlaceholder from "#components/form/Select/SelectPlaceholder";
import SelectRoot from "#components/form/Select/SelectRoot";
import SelectTrigger from "#components/form/Select/SelectTrigger";
import SelectValue from "#components/form/Select/SelectValue";

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

export type SelectOption = {
  id: number;
  name: string;
};

export default Select;
