import type { ImgHTMLAttributes } from "react";

type ImageProps = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean; // Next.js Image prop - ignored in Vite
  quality?: number; // Next.js Image prop - ignored in Vite
} & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">;

function Image({ className, fill, width, height, ...props }: ImageProps) {
  // If fill is true, use absolute positioning like Next.js Image
  if (fill) {
    return (
      <img
        className={`absolute inset-0 w-full h-full ${className || ""}`}
        {...props}
        loading="lazy"
      />
    );
  }

  return (
    <img
      className={`inline-block align-top ${className || ""}`}
      width={width}
      height={height}
      {...props}
      loading="lazy"
    />
  );
}

export default Image;
