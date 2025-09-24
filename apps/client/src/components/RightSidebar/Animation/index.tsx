import Effects from "#components/RightSidebar/Animation/Effects";
import Lens from "#components/RightSidebar/Animation/Lens";
import Loop from "#components/RightSidebar/Animation/Loop";
import MotionBlur from "#components/RightSidebar/Animation/MotionBlur";

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
