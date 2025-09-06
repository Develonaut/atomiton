import React from "react";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: "blur" | "empty";
  blurDataURL?: string;
}

function Image({
  src,
  alt,
  width,
  height,
  priority,
  fill,
  sizes,
  quality,
  placeholder,
  blurDataURL,
  className,
  style,
  ...rest
}: ImageProps) {
  const imgStyle: React.CSSProperties = {
    ...style,
  };

  if (fill) {
    imgStyle.position = "absolute";
    imgStyle.height = "100%";
    imgStyle.width = "100%";
    imgStyle.left = 0;
    imgStyle.top = 0;
    imgStyle.right = 0;
    imgStyle.bottom = 0;
    imgStyle.objectFit = "cover";
  } else {
    if (width)
      imgStyle.width = typeof width === "number" ? `${width}px` : width;
    if (height)
      imgStyle.height = typeof height === "number" ? `${height}px` : height;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={imgStyle}
      loading={priority ? "eager" : "lazy"}
      {...rest}
    />
  );
}

export default Image;
