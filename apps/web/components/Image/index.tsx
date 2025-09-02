import { useState, ImgHTMLAttributes } from "react";

interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  priority?: boolean; // Next.js Image prop - ignored in Vite
  quality?: number;   // Next.js Image prop - ignored in Vite
}

const Image = ({ className, fill, width, height, ...props }: ImageProps) => {
  const [loaded, setLoaded] = useState(false);

  const handleLoad = () => {
    setLoaded(true);
  };

  // If fill is true, use absolute positioning like Next.js Image
  if (fill) {
    return (
      <img
        className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className || ""}`}
        onLoad={handleLoad}
        {...props}
        loading="lazy"
      />
    );
  }

  return (
    <img
      className={`inline-block align-top transition-opacity duration-300 ${
        loaded ? "opacity-100" : "opacity-0"
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
