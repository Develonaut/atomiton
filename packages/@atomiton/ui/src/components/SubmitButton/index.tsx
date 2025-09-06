type Props = {
  className?: string;
  active?: boolean;
  disabled?: boolean;
  isMedium?: boolean;
};

function SubmitButton({ className, active, disabled, isMedium }: Props) {
  return (
    <button
      className={`group relative flex justify-center items-center cursor-pointer before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-b before:from-[#E5E5E5] before:to-[#E2E2E2] before:shadow-[0px_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4] before:transition-all after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-b after:from-[#323232] after:to-[#222222] after:shadow-[0px_0.5px_1px_0px_rgba(255,255,255,0.15)_inset,0px_2px_4px_-1px_rgba(13,13,13,0.50),0px_-1px_1.2px_0.35px_#121212_inset,0px_0px_0px_1px_#333] after:opacity-0 after:transition-all hover:after:opacity-100 ${
        active ? "after:opacity-100 hover:after:!opacity-90" : ""
      } ${isMedium ? "size-8 rounded-[0.625rem]" : "size-10 rounded-xl"} ${
        disabled ? "opacity-40 pointer-events-none" : ""
      } ${className || ""}`}
    >
      <svg
        className={`relative z-2 size-4 transition-colors ${
          active ? "fill-[#FCFCFC]" : ""
        } group-hover:fill-[#FCFCFC]`}
        width={16}
        height={16}
        viewBox="0 0 16 16"
      >
        <path d="M12.701 5.607a.75.75 0 0 1-1.061 1.061L8.755 3.781l-.001 9.69a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75l.001-9.691-2.887 2.888a.75.75 0 0 1-.977.073l-.084-.073a.75.75 0 0 1 0-1.061l3.224-3.224c.814-.814 2.133-.814 2.946 0l3.224 3.224z" />
      </svg>
    </button>
  );
}

export default SubmitButton;
