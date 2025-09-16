export function getAssetFileName(assetInfo: {
  name?: string;
  names?: string[];
}): string {
  const fileName = assetInfo.names?.[0] || assetInfo.name || "asset";
  const info = fileName.split(".");
  const extType = info[info.length - 1];

  if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
    return `images/[name]-[hash][extname]`;
  }

  if (/woff2?|eot|ttf|otf/i.test(extType)) {
    return `fonts/[name]-[hash][extname]`;
  }

  if (/css/i.test(extType)) {
    return `styles/[name]-[hash][extname]`;
  }

  return `assets/[name]-[hash][extname]`;
}

export const DEFAULT_ASSETS_INCLUDE = [
  "**/*.png",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.svg",
  "**/*.gif",
  "**/*.webp",
  "**/*.ico",
  "**/*.woff",
  "**/*.woff2",
  "**/*.eot",
  "**/*.ttf",
  "**/*.otf",
];

export const DEFAULT_INLINE_LIMIT = 4096;
