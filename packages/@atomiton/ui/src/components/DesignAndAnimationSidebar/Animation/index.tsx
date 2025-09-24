import Effects from "#Effects";
import Lens from "#Lens";
import Loop from "#Loop";
import MotionBlur from "#MotionBlur";

function Animation() {
  return (
    <>
      <MotionBlur />
      <Loop />
      <Effects />
      <Lens />
    </>
  );
}

export default Animation;
