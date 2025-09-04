import { cn } from './cn';

/**
 * Style props that can be applied to any component
 * These props map to Tailwind utility classes
 */
export interface StyleProps {
  // Margin
  m?: number | string;
  mt?: number | string;
  mr?: number | string;
  mb?: number | string;
  ml?: number | string;
  mx?: number | string;
  my?: number | string;
  
  // Padding
  p?: number | string;
  pt?: number | string;
  pr?: number | string;
  pb?: number | string;
  pl?: number | string;
  px?: number | string;
  py?: number | string;
  
  // Width & Height
  w?: number | string;
  h?: number | string;
  minW?: number | string;
  minH?: number | string;
  maxW?: number | string;
  maxH?: number | string;
  fullWidth?: boolean;
  fullHeight?: boolean;
  fw?: boolean; // shorthand for fullWidth
  fh?: boolean; // shorthand for fullHeight
  
  // Display & Position
  display?: 'block' | 'inline-block' | 'inline' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'hidden' | 'none';
  position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | string;
  right?: number | string;
  bottom?: number | string;
  left?: number | string;
  zIndex?: number;
  
  // Flexbox
  flex?: string | number;
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  flexWrap?: 'wrap' | 'wrap-reverse' | 'nowrap';
  justifyContent?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  gap?: number | string;
  
  // Typography
  fontSize?: string;
  fontWeight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  
  // Background
  bg?: string;
  bgColor?: string;
  
  // Border
  border?: boolean | string;
  borderWidth?: string;
  borderColor?: string;
  borderRadius?: string;
  rounded?: string | boolean;
  
  // Opacity
  opacity?: number;
  
  // Cursor
  cursor?: string;
  
  // Overflow
  overflow?: 'auto' | 'hidden' | 'visible' | 'scroll';
  overflowX?: 'auto' | 'hidden' | 'visible' | 'scroll';
  overflowY?: 'auto' | 'hidden' | 'visible' | 'scroll';
}

/**
 * Maps a style prop value to a Tailwind class
 */
function mapStyleProp(prop: string, value: string | number | boolean | undefined): string | null {
  if (value === undefined || value === null || value === false) return null;
  
  // Handle boolean values
  if (value === true) {
    switch (prop) {
      case 'fullWidth':
      case 'fw':
        return 'w-full';
      case 'fullHeight':
      case 'fh':
        return 'h-full';
      case 'border':
        return 'border';
      case 'rounded':
        return 'rounded';
      default:
        return null;
    }
  }
  
  // Convert numbers to Tailwind scale (4px units by default)
  const numValue = typeof value === 'number' ? value : value;
  
  // Map props to Tailwind classes
  switch (prop) {
    // Margin
    case 'm': return `m-${numValue}`;
    case 'mt': return `mt-${numValue}`;
    case 'mr': return `mr-${numValue}`;
    case 'mb': return `mb-${numValue}`;
    case 'ml': return `ml-${numValue}`;
    case 'mx': return `mx-${numValue}`;
    case 'my': return `my-${numValue}`;
    
    // Padding
    case 'p': return `p-${numValue}`;
    case 'pt': return `pt-${numValue}`;
    case 'pr': return `pr-${numValue}`;
    case 'pb': return `pb-${numValue}`;
    case 'pl': return `pl-${numValue}`;
    case 'px': return `px-${numValue}`;
    case 'py': return `py-${numValue}`;
    
    // Width & Height
    case 'w': return `w-${numValue}`;
    case 'h': return `h-${numValue}`;
    case 'minW': return `min-w-${numValue}`;
    case 'minH': return `min-h-${numValue}`;
    case 'maxW': return `max-w-${numValue}`;
    case 'maxH': return `max-h-${numValue}`;
    
    // Display
    case 'display':
      if (value === 'none') return 'hidden';
      return value as string;
    
    // Position
    case 'position': return value as string;
    case 'top': return `top-${numValue}`;
    case 'right': return `right-${numValue}`;
    case 'bottom': return `bottom-${numValue}`;
    case 'left': return `left-${numValue}`;
    case 'zIndex': return `z-${numValue}`;
    
    // Flexbox
    case 'flex': return `flex-${numValue}`;
    case 'flexDirection': return `flex-${value}`;
    case 'flexWrap': return `flex-${value}`;
    case 'justifyContent': return `justify-${value}`;
    case 'alignItems': return `items-${value}`;
    case 'gap': return `gap-${numValue}`;
    
    // Typography
    case 'fontSize': return `text-${numValue}`;
    case 'fontWeight': return `font-${value}`;
    case 'textAlign': return `text-${value}`;
    case 'color': return `text-${numValue}`;
    
    // Background
    case 'bg':
    case 'bgColor': return `bg-${numValue}`;
    
    // Border
    case 'borderWidth': return `border-${numValue}`;
    case 'borderColor': return `border-${numValue}`;
    case 'borderRadius':
    case 'rounded': return `rounded-${numValue}`;
    
    // Opacity
    case 'opacity': return `opacity-${numValue}`;
    
    // Cursor
    case 'cursor': return `cursor-${numValue}`;
    
    // Overflow
    case 'overflow': return `overflow-${value}`;
    case 'overflowX': return `overflow-x-${value}`;
    case 'overflowY': return `overflow-y-${value}`;
    
    default: return null;
  }
}

/**
 * Extracts style props from component props and returns:
 * - styleClasses: Tailwind classes generated from style props
 * - restProps: Remaining props without style props
 */
export function extractStyleProps<T extends StyleProps>(
  props: T
): {
  styleClasses: string;
  restProps: Omit<T, keyof StyleProps>;
} {
  const styleClasses: string[] = [];
  const restProps: any = {};
  
  for (const [key, value] of Object.entries(props)) {
    if (key in STYLE_PROP_KEYS) {
      const className = mapStyleProp(key, value);
      if (className) {
        styleClasses.push(className);
      }
    } else {
      restProps[key] = value;
    }
  }
  
  return {
    styleClasses: cn(...styleClasses),
    restProps
  };
}

// Set of all style prop keys for quick lookup
const STYLE_PROP_KEYS: Record<keyof StyleProps, true> = {
  m: true,
  mt: true,
  mr: true,
  mb: true,
  ml: true,
  mx: true,
  my: true,
  p: true,
  pt: true,
  pr: true,
  pb: true,
  pl: true,
  px: true,
  py: true,
  w: true,
  h: true,
  minW: true,
  minH: true,
  maxW: true,
  maxH: true,
  fullWidth: true,
  fullHeight: true,
  fw: true,
  fh: true,
  display: true,
  position: true,
  top: true,
  right: true,
  bottom: true,
  left: true,
  zIndex: true,
  flex: true,
  flexDirection: true,
  flexWrap: true,
  justifyContent: true,
  alignItems: true,
  gap: true,
  fontSize: true,
  fontWeight: true,
  textAlign: true,
  color: true,
  bg: true,
  bgColor: true,
  border: true,
  borderWidth: true,
  borderColor: true,
  borderRadius: true,
  rounded: true,
  opacity: true,
  cursor: true,
  overflow: true,
  overflowX: true,
  overflowY: true
};