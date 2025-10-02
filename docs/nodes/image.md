# Image Node

## Overview

The Image Node combines, overlays, and manipulates images. It supports various
operations for image composition, resizing, positioning, and format conversion.

## Purpose

Image nodes are essential for:

- Combining multiple images
- Adding overlays and watermarks
- Resizing and cropping images
- Image format conversion
- Thumbnail generation
- Batch image processing

## Parameters

### Core Parameters

| Parameter      | Type   | Default   | Description                              |
| -------------- | ------ | --------- | ---------------------------------------- |
| `operation`    | enum   | "overlay" | Image operation to perform               |
| `outputFormat` | enum   | "png"     | Output format (png, jpg, webp, etc.)     |
| `quality`      | number | 90        | Output quality for lossy formats (1-100) |

### Positioning

| Parameter   | Type   | Default  | Description                                  |
| ----------- | ------ | -------- | -------------------------------------------- |
| `position`  | enum   | "center" | Position (center, top-left, top-right, etc.) |
| `opacity`   | number | 1        | Opacity (0-1, where 1 is fully opaque)       |
| `blendMode` | enum   | "normal" | Blend mode (normal, multiply, screen, etc.)  |

### Layout

| Parameter             | Type    | Default       | Description                         |
| --------------------- | ------- | ------------- | ----------------------------------- |
| `backgroundColor`     | string  | "transparent" | Background color                    |
| `maintainAspectRatio` | boolean | true          | Preserve aspect ratio when resizing |
| `padding`             | number  | 0             | Padding around image (pixels)       |

### Common Parameters

| Parameter     | Type    | Default | Description                 |
| ------------- | ------- | ------- | --------------------------- |
| `enabled`     | boolean | true    | Whether node executes       |
| `timeout`     | number  | 30000   | Maximum execution time (ms) |
| `label`       | string  | -       | Custom node label           |
| `description` | string  | -       | Custom node description     |

## Input/Output

### Input Ports

| Port      | Type          | Required    | Description                           |
| --------- | ------------- | ----------- | ------------------------------------- |
| `base`    | buffer/string | Yes         | Base image (file path or buffer)      |
| `overlay` | buffer/string | Conditional | Overlay image (for overlay operation) |

### Output Ports

| Port     | Type   | Description                  |
| -------- | ------ | ---------------------------- |
| `result` | buffer | Processed image data         |
| `width`  | number | Output image width (pixels)  |
| `height` | number | Output image height (pixels) |
| `format` | string | Output format                |
| `size`   | number | File size in bytes           |

## Operations

### Overlay

Composite one image on top of another:

```javascript
{
  operation: "overlay",
  position: "center",
  opacity: 0.8,
  blendMode: "normal"
}
```

**Use cases**: Watermarks, logos, stamps

### Resize

Resize image to specific dimensions:

```javascript
{
  operation: "resize",
  width: 800,
  height: 600,
  maintainAspectRatio: true
}
```

**Use cases**: Thumbnails, responsive images

### Crop

Crop image to specific area:

```javascript
{
  operation: "crop",
  x: 100,
  y: 100,
  width: 400,
  height: 300
}
```

**Use cases**: Focus on specific area, remove borders

### Convert

Convert image format:

```javascript
{
  operation: "convert",
  outputFormat: "webp",
  quality: 85
}
```

**Use cases**: Format optimization, compatibility

## Use Cases

### 1. Add Watermark

```javascript
{
  type: "image",
  parameters: {
    operation: "overlay",
    position: "bottom-right",
    opacity: 0.5,
    outputFormat: "jpg",
    quality: 90
  },
  inputs: {
    base: "/images/photo.jpg",
    overlay: "/watermarks/logo.png"
  }
}
```

### 2. Generate Thumbnails

```javascript
{
  type: "image",
  parameters: {
    operation: "resize",
    width: 200,
    height: 200,
    maintainAspectRatio: true,
    outputFormat: "webp",
    quality: 80
  }
}
```

### 3. Batch Processing

```javascript
// Loop through images
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$imageFiles}}"
  },
  nodes: [
    {
      type: "image",
      parameters: {
        operation: "resize",
        width: 1920,
        height: 1080,
        outputFormat: "jpg",
        quality: 85
      }
    },
    {
      type: "file-system",
      parameters: {
        operation: "write",
        path: "/output/{{$item}}"
      }
    }
  ]
}
```

## Blend Modes

- **normal**: Standard compositing
- **multiply**: Darken effect
- **screen**: Lighten effect
- **overlay**: Contrast enhancement
- **darken**: Keep darker pixels
- **lighten**: Keep lighter pixels

## Best Practices

### Performance

- **Optimize quality settings** - Balance quality vs file size
- **Use appropriate formats** - WebP for web, PNG for transparency
- **Batch similar operations** - Process multiple images together
- **Resize before compositing** - Resize inputs to reduce processing

### Quality

- **Use high-quality sources** - Start with best possible input
- **Avoid multiple conversions** - Each conversion loses quality
- **Set appropriate quality** - 85-90 for photos, 100 for graphics
- **Test output** - Verify quality meets requirements

### Memory

- **Process in batches** - Don't load all images at once
- **Clean up buffers** - Release memory after processing
- **Monitor usage** - Watch memory with large images
- **Use streaming** - Stream large files when possible

## Technical Notes

### Supported Formats

**Input**: jpg, png, webp, gif, bmp, tiff, svg **Output**: jpg, png, webp, gif,
bmp, tiff

### Size Limits

- Practical limit: ~16000x16000 pixels
- Memory usage: width × height × 4 bytes (RGBA)
- Example: 4000×3000 = 48 MB per image

### Color Spaces

- RGB for standard images
- RGBA for transparency
- Converts automatically as needed

## Examples

### Example 1: Social Media Image

```javascript
{
  type: "image",
  parameters: {
    operation: "resize",
    width: 1200,
    height: 630,  // Facebook/LinkedIn size
    maintainAspectRatio: false,
    backgroundColor: "#ffffff",
    outputFormat: "jpg",
    quality: 90
  }
}
```

### Example 2: Product Photo with Logo

```javascript
{
  type: "image",
  parameters: {
    operation: "overlay",
    position: "bottom-right",
    opacity: 0.7,
    padding: 20,
    outputFormat: "png"
  },
  inputs: {
    base: "/products/item-123.jpg",
    overlay: "/brand/logo.png"
  }
}
```

### Example 3: Batch Thumbnail Generation

```javascript
{
  type: "loop",
  parameters: {
    loopType: "forEach",
    array: "{{$photos}}",
    parallel: true,
    concurrency: 5
  },
  nodes: [
    {
      type: "image",
      parameters: {
        operation: "resize",
        width: 300,
        height: 300,
        maintainAspectRatio: true,
        backgroundColor: "#f0f0f0",
        outputFormat: "webp",
        quality: 80
      }
    },
    {
      type: "file-system",
      parameters: {
        operation: "write",
        path: "/thumbnails/{{$item}}"
      }
    }
  ]
}
```

## Related Nodes

- **File System Node** - Read/write image files
- **Loop Node** - Batch image processing
- **HTTP Request Node** - Download images from URLs
- **Transform Node** - Process image metadata

## Future Enhancements

- More blend modes
- Image filters (blur, sharpen, etc.)
- Text overlay
- Drawing operations
- Advanced cropping (face detection)
- Color adjustments
- EXIF data preservation
- Animated GIF support
