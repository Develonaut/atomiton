import { forwardRef } from "react";

interface ColorDisplayProps {
  color: string;
  onColorChange?: (color: string) => void;
  opacity?: number;
  onOpacityChange?: (opacity: number) => void;
  showOpacity?: boolean;
  className?: string;
  colorBoxClassName?: string;
  readonly?: boolean;
}

const ColorDisplay = forwardRef<HTMLDivElement, ColorDisplayProps>(
  (
    {
      color,
      onColorChange,
      opacity = 100,
      onOpacityChange,
      showOpacity = true,
      className = "",
      colorBoxClassName = "",
      readonly = false,
      ...props
    },
    ref,
  ) => {
    const handleColorClick = () => {
      if (readonly || !onColorChange) return;

      // Create a hidden color input to trigger the color picker
      const input = document.createElement("input");
      input.type = "color";
      input.value = color.startsWith("#") ? color : `#${color}`;
      input.style.visibility = "hidden";
      input.style.position = "absolute";

      document.body.appendChild(input);

      input.addEventListener("change", (e) => {
        const target = e.target as HTMLInputElement;
        onColorChange(target.value.replace("#", ""));
        document.body.removeChild(input);
      });

      input.click();
    };

    const displayColor = color.startsWith("#") ? color : `#${color}`;

    return (
      <div
        ref={ref}
        className={`flex items-center p-1 bg-surface-03 rounded-[0.625rem] ${className}`}
        {...props}
      >
        <div
          className={`size-7 mr-3 bg-surface-01 rounded-md border border-shade-07/10 ${
            !readonly && onColorChange ? "cursor-pointer" : ""
          } ${colorBoxClassName}`}
          style={{ backgroundColor: displayColor }}
          onClick={handleColorClick}
        />
        <span className="text-body-md text-primary">{color.toUpperCase()}</span>
        {showOpacity && (
          <div className="flex justify-center gap-2 w-16 ml-auto border-l border-shade-07/10">
            {readonly || !onOpacityChange ? (
              <>
                <span>{opacity}</span>
                <span>%</span>
              </>
            ) : (
              <>
                <input
                  type="number"
                  value={opacity}
                  onChange={(e) => onOpacityChange(Number(e.target.value))}
                  min={0}
                  max={100}
                  className="w-8 bg-transparent text-center outline-none"
                />
                <span>%</span>
              </>
            )}
          </div>
        )}
      </div>
    );
  },
);

ColorDisplay.displayName = "ColorDisplay";

export default ColorDisplay;
