import { useSwitchContext } from "#SwitchContext";

type SwitchThumbProps = {
  className?: string;
};

function SwitchThumb({ className = "" }: SwitchThumbProps) {
  const { checked } = useSwitchContext();

  return (
    <span
      className={`size-4.5 rounded-full bg-surface-02 shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.82)_inset,0px_0px_2.6px_0px_rgba(0,0,0,0.25),0px_1px_4px_0px_rgba(0,0,0,0.14)] transition ${
        checked ? "translate-x-[1.125rem]" : ""
      } ${className}`}
    />
  );
}

export default SwitchThumb;
