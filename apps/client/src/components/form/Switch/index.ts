import SwitchLabel from "./SwitchLabel";
import SwitchRoot from "./SwitchRoot";
import SwitchThumb from "./SwitchThumb";

export const Switch = Object.assign(SwitchRoot, {
  Thumb: SwitchThumb,
  Label: SwitchLabel,
});

export default Switch;
