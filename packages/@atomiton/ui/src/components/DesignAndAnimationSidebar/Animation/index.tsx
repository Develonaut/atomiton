import Effects from "#components/DesignAndAnimationSidebar/Animation/Effects";
import Lens from "#components/DesignAndAnimationSidebar/Animation/Lens";
import Loop from "#components/DesignAndAnimationSidebar/Animation/Loop";
import MotionBlur from "#components/DesignAndAnimationSidebar/Animation/MotionBlur";

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
