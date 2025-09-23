import Image from "#components/Image";

type Props = {
  image?: string;
};

function UploadAvatar({ image }: Props) {
  return (
    <div className="group relative size-12 rounded-full overflow-hidden bg-[#F8F7F7]">
      <Image
        className="size-12 object-cover"
        src={image || "/images/no-avatar.png"}
        width={48}
        height={48}
        alt="Avatar"
      />
      <div className="absolute inset-0 z-2 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
        <svg
          className="size-5 fill-[#FCFCFC]"
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path d="M9.998 1.54a8.46 8.46 0 0 1 8.458 8.458 8.46 8.46 0 0 1-8.458 8.458A8.46 8.46 0 0 1 1.54 9.998 8.46 8.46 0 0 1 9.998 1.54zm0 1.5A6.96 6.96 0 0 0 3.04 9.998a6.96 6.96 0 0 0 6.958 6.958 6.96 6.96 0 0 0 6.958-6.958A6.96 6.96 0 0 0 9.998 3.04zm0 2.673a.75.75 0 0 1 .75.75v2.785l2.786.001a.75.75 0 0 1 .743.648l.007.102a.75.75 0 0 1-.75.75l-2.786-.001v2.786a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75v-2.786l-2.785.001a.75.75 0 0 1-.743-.648l-.007-.102a.75.75 0 0 1 .75-.75l2.785-.001V6.463a.75.75 0 0 1 .648-.743l.102-.007z" />
        </svg>
        <input
          className="absolute inset-0 opacity-0 cursor-pointer"
          type="file"
        />
      </div>
    </div>
  );
}

export default UploadAvatar;
