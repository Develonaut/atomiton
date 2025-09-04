import React, { ElementType, forwardRef } from 'react';
import { buttonVariants, spinnerClasses, iconClasses } from './Button.styles';
import { ButtonProps } from './Button.types';
import { cn } from '@/utils/cn';
import { extractStyleProps } from '@/utils/extractStyleProps';
import Link from '@/components/Link';

/**
 * Button component with style props, variants, and polymorphic support
 * 
 * @example
 * // Primary button
 * <Button>Click me</Button>
 * 
 * @example
 * // Secondary with icon
 * <Button variant="secondary" leftIcon={<Icon />}>
 *   Save
 * </Button>
 * 
 * @example
 * // As a link
 * <Button as="a" href="/about">
 *   Learn more
 * </Button>
 * 
 * @example
 * // With style props
 * <Button mb={4} fullWidth variant="danger">
 *   Delete
 * </Button>
 */
const Button = forwardRef(
  <E extends ElementType = 'button'>(
    {
      as,
      variant = 'primary',
      size = 'md',
      fullWidth,
      fw,
      fh,
      fullHeight,
      leftIcon,
      rightIcon,
      startIcon,
      endIcon,
      loading,
      loadingText,
      disabled,
      className,
      children,
      ...props
    }: ButtonProps<E>,
    ref: React.Ref<any>
  ) => {
    // Extract style props
    const { styleClasses, restProps } = extractStyleProps(props);
    
    // Handle icon aliases
    const _leftIcon = leftIcon || startIcon;
    const _rightIcon = rightIcon || endIcon;
    
    // Handle fullWidth/fullHeight and their shortcuts
    const _fullWidth = fullWidth || fw;
    const _fullHeight = fullHeight || fh;
    
    // Determine the component to render
    const Component = as || 'button';
    const isLink = Component === 'a' || Component === Link;
    
    // Build class names
    const classes = cn(
      buttonVariants({ 
        variant, 
        size, 
        fullWidth: _fullWidth 
      }),
      _fullHeight && 'h-full',
      styleClasses,
      className
    );
    
    // Build data attributes for styling hooks
    const dataAttributes = {
      'data-state': loading ? 'loading' : disabled ? 'disabled' : undefined,
      'data-variant': variant,
      'data-size': size,
      ...restProps['data-state'] && { 'data-state': restProps['data-state'] }
    };
    
    return (
      <Component
        ref={ref}
        className={classes}
        disabled={!isLink && (disabled || loading)}
        {...dataAttributes}
        {...restProps}
      >
        {/* Loading spinner */}
        {loading && !loadingText && (
          <svg
            className={spinnerClasses}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {/* Left icon */}
        {!loading && _leftIcon && (
          <span className={iconClasses}>{_leftIcon}</span>
        )}
        
        {/* Button content */}
        <span className="relative z-10">
          {loading && loadingText ? loadingText : children}
        </span>
        
        {/* Right icon */}
        {!loading && _rightIcon && (
          <span className={iconClasses}>{_rightIcon}</span>
        )}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export default Button;