import { useState, ImgHTMLAttributes } from "react";

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean; // Next.js Image prop - ignored in Vite
  quality?: number; // Next.js Image prop - ignored in Vite
}

const Image = ({ className, fill, width, height, ...props }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  // If fill is true, use absolute positioning like Next.js Image
  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className={`absolute inset-0 w-full h-full opacity-0 transition-opacity ${
          loaded && "opacity-100"
        } ${className || ""}`}
        onLoad={handleLoad}
        {...props}
        loading="lazy"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`inline-block align-top opacity-0 transition-opacity ${
        loaded && "opacity-100"
      } ${className || ""}`}
      onLoad={handleLoad}
      width={width}
      height={height}
      {...props}
      loading="lazy"
    />
  );
};

export default Image;
