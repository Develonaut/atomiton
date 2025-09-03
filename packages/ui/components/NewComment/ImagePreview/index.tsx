import Image from "next/image";

type Props = {
  images: string[];
};

const ImagePreview = ({ images }: Props) => {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {images.map((image, index) => (
        <div className="group relative rounded-xl" key={index}>
          <Image
            className="size-15 object-cover rounded-xl"
            src={image}
            width={60}
            height={60}
            alt={`Uploaded ${index + 1}`}
          />

          <button className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-5 bg-gradient-to-b from-[#323232] to-[#121212] rounded-full cursor-pointer opacity-0 transition-opacity group-hover:opacity-100">
            <svg
              className="size-4 fill-white"
              width={16}
              height={16}
              viewBox="0 0 16 16"
            >
              <path d="M4.63 4.63a.75.75 0 0 1 1.061 0l2.303 2.303 2.303-2.303a.75.75 0 0 1 .977-.073l.084.073a.75.75 0 0 1 0 1.061L9.054 7.993l2.303 2.303a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0L7.993 9.054 5.69 11.357a.75.75 0 0 1-.977.073l-.084-.073a.75.75 0 0 1 0-1.061l2.303-2.303L4.63 5.69a.75.75 0 0 1-.073-.977l.073-.084z" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
