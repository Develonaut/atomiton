import Artboard from "#components/DesignAndAnimationSidebar/Design/Artboard";
import Background from "#components/DesignAndAnimationSidebar/Design/Background";
import Camera from "#components/DesignAndAnimationSidebar/Design/Camera";
import Materials from "#components/DesignAndAnimationSidebar/Design/Materials";
import ShowFrame from "#components/DesignAndAnimationSidebar/Design/ShowFrame";
import Styles from "#components/DesignAndAnimationSidebar/Design/Styles";

function Design() {
  return (
    <>
      <ShowFrame />
      <Artboard />
      <Materials />
      <Styles />
      <Background />
      <Camera />
    </>
  );
}

export default Design;
