import { ElementType, ReactElement } from 'react';
import { 
  PolymorphicComponentProps, 
  Size, 
  StyleProps, 
  WithIcons, 
  WithLoading, 
  WithDisabled 
} from '@/types';

/**
 * Button variants - maximum 3-5 as per our philosophy
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

/**
 * Base Button props
 */
export interface ButtonBaseProps extends StyleProps, WithIcons, WithLoading, WithDisabled {
  /**
   * The visual variant of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Size of the button using t-shirt sizing
   * @default 'md'
   */
  size?: Size;
  
  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Icon to display on the left side (alias for leftIcon)
   */
  startIcon?: ReactElement;
  
  /**
   * Icon to display on the right side (alias for rightIcon)
   */
  endIcon?: ReactElement;
}

/**
 * Polymorphic Button props
 */
export type ButtonProps<E extends ElementType = 'button'> = PolymorphicComponentProps<E, ButtonBaseProps>;