import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  loading?: "lazy" | "eager";
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
  unoptimized?: boolean;
}

const Image: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  className,
  style,
  ...rest
}) => {
  const imgStyle: React.CSSProperties = {
    ...style,
  };

  if (fill) {
    imgStyle.position = "absolute";
    imgStyle.inset = 0;
    imgStyle.width = "100%";
    imgStyle.height = "100%";
    imgStyle.objectFit = style?.objectFit || "cover";
  } else if (width || height) {
    imgStyle.width = width;
    imgStyle.height = height;
  }

  return (
    <img src={src} alt={alt} className={className} style={imgStyle} {...rest} />
  );
};

export default Image;
