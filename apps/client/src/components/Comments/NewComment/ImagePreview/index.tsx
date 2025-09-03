import Icon from "@/components/Icon";
import Image from "@/components/Image";

type Props = {
  images: File[];
  onRemove: (index: number) => void;
};

const ImagePreview = ({ images, onRemove }: Props) => {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 px-4 pb-2">
      {images.map((image, index) => (
        <div
          className="group relative border border-s-01 rounded-xl"
          key={index}
        >
          <Image
            className="size-15 object-cover rounded-xl"
            src={URL.createObjectURL(image)}
            width={60}
            height={60}
            alt={`Uploaded ${index + 1}`}
          />

          <button
            onClick={() => onRemove(index)}
            className="absolute -top-1.5 -right-1.5 size-5 bg-gradient-to-b from-shade-07 to-shade-09 rounded-full text-0 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Icon className="!size-3 fill-white" name="close-thick" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImagePreview;
