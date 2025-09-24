import { options } from "./options";

function SelectAI() {
  return (
    <div className="w-51 p-2 bg-[#FCFCFC] border border-[#E2E2E2] rounded-[1.25rem] shadow-2xl">
      {options.map((option) => (
        <button
          className="w-full px-3 py-2.5 text-left rounded-xl leading-[1rem] font-medium cursor-pointer transition-colors hover:bg-[#F1F1F1]"
          key={option.id}
        >
          <div className="text-[0.8125rem]">{option.title}</div>
          <div className="mt-1 text-[0.6875rem] text-[#7B7B7B]/70">
            {option.description}
          </div>
        </button>
      ))}
    </div>
  );
}

export default SelectAI;
