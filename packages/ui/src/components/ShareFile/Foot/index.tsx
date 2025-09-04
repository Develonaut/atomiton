import Button from "@/components/Button";

const Foot = () => {
  const link = "https://atomiton.com/file/k373nH";

  return (
    <div className="flex items-center gap-2 p-4 border-t border-[#ECECEC] bg-[#F8F7F7] rounded-b-[1.75rem]">
      <div className="truncate text-[0.8125rem] leading-[1rem] opacity-50">
        {link}
      </div>
      <Button className="shrink-0 !h-9.5 ml-auto !px-4" isPrimary>
        <svg
          className="size-5 fill-[#7B7B7B]"
          width={16}
          height={16}
          viewBox="0 0 16 16"
        >
          <path d="M3.152 5.963a.75.75 0 0 1 1.061 1.061l-.648.648c-1.314 1.314-1.314 3.443 0 4.757s3.443 1.314 4.757 0l.643-.643a.75.75 0 0 1 1.061 1.061l-.643.643c-1.899 1.899-4.979 1.899-6.878 0s-1.899-4.979 0-6.878l.648-.648zM9.133 5.8a.75.75 0 0 1 1.061 1.061L6.86 10.194A.75.75 0 0 1 5.8 9.133L9.133 5.8zM6.611 2.504c1.899-1.899 4.979-1.899 6.878 0s1.899 4.979 0 6.878l-.646.646a.75.75 0 0 1-1.061-1.061l.646-.646c1.314-1.314 1.314-3.443 0-4.757s-3.443-1.314-4.757 0l-.644.644a.75.75 0 0 1-1.061-1.061l.644-.644z" />
        </svg>
        Copy link
      </Button>
    </div>
  );
};

export default Foot;
