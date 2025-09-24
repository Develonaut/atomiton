import SwitchLabel from "#components/form/Switch/SwitchLabel";
import SwitchRoot from "#components/form/Switch/SwitchRoot";
import SwitchThumb from "#components/form/Switch/SwitchThumb";

const Switch = Object.assign(SwitchRoot, {
  Thumb: SwitchThumb,
  Label: SwitchLabel,
});

export default Switch;
