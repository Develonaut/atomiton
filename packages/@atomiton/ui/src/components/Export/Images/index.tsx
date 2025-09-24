import Button from "#components/Button";
import Compression from "#Compression";
import Settings from "#Settings";

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
