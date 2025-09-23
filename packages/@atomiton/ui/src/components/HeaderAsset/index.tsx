import Image from "#components/Image";
import Button from "#components/Button";

function HeaderAsset() {
  return (
    <div className="flex items-center gap-3 w-full h-20 px-5 bg-[#FCFCFC]">
      <button className="flex justify-center items-center size-10 mr-auto border border-[#e2e2e2] bg-[#fcfcfc] rounded-xl transition-colors cursor-pointer hover:bg-[#f1f1f1]">
        <svg
          className="size-4 fill-[#121212]"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M3.275 3.275a.94.94 0 0 1 1.33 0L10 8.671l5.395-5.395a.94.94 0 0 1 1.224-.091l.105.091a.94.94 0 0 1 0 1.33L11.329 10l5.396 5.395a.94.94 0 0 1 .091 1.224l-.091.105a.94.94 0 0 1-1.33 0L10 11.329l-5.394 5.396a.94.94 0 0 1-1.224.091l-.105-.091a.94.94 0 0 1 0-1.33L8.671 10 3.275 4.605a.94.94 0 0 1-.091-1.224l.091-.105z" />
        </svg>
      </button>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3 before:absolute before:top-0 before:left-0 before:bottom-0 before:z-2 before:w-15 before:bg-gradient-to-r before:from-[#FCFCFC] before:to-transparent after:absolute after:top-0 after:right-0 after:bottom-0 after:z-2 after:w-15 after:bg-gradient-to-l after:from-[#FCFCFC] after:to-transparent before:pointer-events-none after:pointer-events-none before:transition-opacity after:transition-opacity hover:before:opacity-0 hover:after:opacity-0 max-[1259px]:left-30 max-[1259px]:translate-x-0 max-[1023px]:hidden">
        {[
          "/images/3d-objects/5.png",
          "/images/3d-objects/6.png",
          "/images/3d-objects/7.png",
          "/images/3d-objects/8.png",
          "/images/3d-objects/9.png",
        ].map((image, index) => (
          <div
            className="flex justify-center items-center size-12.5 border border-[#E2E2E2] rounded-xl overflow-hidden cursor-pointer nth-3:size-15 nth-3:shadow-md"
            key={index}
          >
            <Image
              className="w-full h-full object-cover"
              src={image}
              width={50}
              height={50}
              alt=""
            />
          </div>
        ))}
      </div>
      <button className="flex justify-center items-center size-10 border border-[#e2e2e2] bg-[#fcfcfc] rounded-xl transition-colors cursor-pointer hover:bg-[#f1f1f1]">
        <svg
          className="size-4 fill-[#121212]"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M16.06 16.657c.519 0 .94.413.94.922s-.421.922-.94.922H3.94c-.519 0-.94-.413-.94-.922s.421-.922.94-.922H16.06zM10 1.5c.519 0 .94.413.94.922v9.858l1.948-1.908c.334-.327.856-.357 1.224-.089l.105.089a.91.91 0 0 1 0 1.303l-2.961 2.903a1.8 1.8 0 0 1-2.512 0l-2.961-2.903a.91.91 0 0 1 0-1.303c.367-.36.963-.36 1.33 0l1.947 1.908V2.422c0-.467.354-.852.813-.913L10 1.5z" />
        </svg>
      </button>
      <button className="flex justify-center items-center size-10 border border-[#e2e2e2] bg-[#fcfcfc] rounded-xl transition-colors cursor-pointer hover:bg-[#f1f1f1]">
        <svg
          className="size-4 fill-[#121212]"
          width={20}
          height={20}
          viewBox="0 0 20 20"
        >
          <path d="M9.519 3.597c0-1.39 1.634-2.114 2.641-1.17l6.834 6.403a1.61 1.61 0 0 1 0 2.34l-6.834 6.403c-1.007.944-2.641.22-2.641-1.17v-2.464l-.262.006c-4.299.099-5.512.72-6.558 2.679l-.092.176-.092.181-.156.316-.07.141C1.843 18.341.5 18.02.5 17.011.5 9.43 2.757 6.398 9.307 6.095l.212-.009v-2.49zm1.887.728l.001 2.276a1.38 1.38 0 0 1-1.352 1.384c-4.795.077-6.825 1.408-7.446 5.457l-.04.27.055-.045c1.372-1.134 3.384-1.579 6.984-1.641l.422-.005c.755-.007 1.376.612 1.376 1.379l-.001 2.275L17.464 10l-6.057-5.675z" />
        </svg>
      </button>
      <Button isPrimary>Add to Asset</Button>
    </div>
  );
}

export default HeaderAsset;
