import { forwardRef } from "react";
import Image from "@/components/Image";

export type ImageGridItem = {
  id: number;
  image: string;
  alt?: string;
};

type ImageGridProps = {
  items: ImageGridItem[];
  activeIndex: number | null;
  onSelectionChange: (index: number | null) => void;
  className?: string;
  itemClassName?: string;
  imageSize?: number;
  columns?: number;
};

const ImageGrid = forwardRef<HTMLDivElement, ImageGridProps>(
  (
    {
      items,
      activeIndex,
      onSelectionChange,
      className = "",
      itemClassName = "",
      imageSize = 64,
      columns = 2,
      ...props
    },
    ref,
  ) => {
    const getColumnClass = () => {
      switch (columns) {
        case 1:
          return "w-full";
        case 2:
          return "w-[calc(50%-0.5rem)]";
        case 3:
          return "w-[calc(33.333%-0.667rem)]";
        case 4:
          return "w-[calc(25%-0.75rem)]";
        default:
          return "w-[calc(50%-0.5rem)]";
      }
    };

    return (
      <div
        ref={ref}
        className={`flex flex-wrap -mt-2 -mx-1 ${className}`}
        {...props}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex justify-center items-center aspect-square ${getColumnClass()} mx-1 mt-2 p-1.5 bg-surface-03 rounded-2xl cursor-pointer transition-shadow hover:shadow-[0_0_0_1.5px_var(--color-shade-06)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset] ${
              activeIndex === item.id
                ? "shadow-[0_0_0_1.5px_var(--color-shade-06)_inset,0px_0px_0px_4px_var(--color-surface-01)_inset]"
                : ""
            } ${itemClassName}`}
            onClick={() => onSelectionChange(item.id)}
          >
            <Image
              src={item.image}
              width={imageSize}
              height={imageSize}
              alt={item.alt || "Grid item"}
            />
          </div>
        ))}
      </div>
    );
  },
);

ImageGrid.displayName = "ImageGrid";

export default ImageGrid;
