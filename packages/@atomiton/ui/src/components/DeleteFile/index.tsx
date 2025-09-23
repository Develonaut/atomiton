import Image from "#components/Image";
import Button from "#components/Button";

function DeleteFile() {
  return (
    <div className="relative w-89 bg-[#FCFCFC] rounded-[2rem] border border-[#ECECEC] shadow-2xl">
      <div className="absolute bottom-[calc(100%-11.25rem)] left-0 right-0 pointer-events-none">
        <Image
          className="w-full opacity-100"
          src="/images/delete-pic.png"
          width={356}
          height={356}
          alt=""
        />
      </div>
      <div className="relative z-2 p-6 pt-39 text-center">
        <div className="mb-2 text-[1.5rem] leading-[2rem] font-medium">
          Delete this file?
        </div>
        <div className="text-[0.8125rem] leading-[1.2188rem] text-[#7b7b7b]">
          This action cannot be undone. Blinky is <br></br>a bit nervous about
          it too.
        </div>
      </div>
      <div className="flex gap-3 p-6 bg-[#F8F7F7] border-t border-[#E2E2E2] rounded-b-[2rem]">
        <Button className="flex-1" isPrimary>
          Cancel
        </Button>
        <Button className="flex-1" isOrange>
          Yes, delete it
        </Button>
      </div>
    </div>
  );
}

export default DeleteFile;
