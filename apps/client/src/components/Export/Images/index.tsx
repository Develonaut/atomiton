import Button from "#components/Button";
import Settings from "./Settings";
import Compression from "./Compression";

function Images() {
  return (
    <>
      <Settings />
      <Compression />
      <div className="mt-auto p-4">
        <Button className="w-full" isSecondary>
          Export Robot 2.0
        </Button>
      </div>
    </>
  );
}

export default Images;
