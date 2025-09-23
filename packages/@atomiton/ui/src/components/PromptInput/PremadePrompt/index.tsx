import Button from "#components/Button";

const results = [
  "Create a 3D model of a sleek, futuristic car with neon accents.",
  "Design a 3D medieval sword with intricate engravings on the blade.",
  "Generate a 3D low-poly tree with a vibrant, autumn color palette.",
  "Build a 3D cozy wooden cabin with a detailed, textured roof.",
];

function PremadePrompt() {
  return (
    <div className="absolute left-0 right-0 bottom-full mb-3 bg-[#FCFCFC] border border-[#ECECEC] rounded-3xl shadow-[0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="flex flex-col gap-0.5 p-3">
        {results.map((result, index) => (
          <div
            className="p-3 border border-transparent rounded-[0.625rem] text-[0.8125rem] leading-[1rem] cursor-pointer transition-colors hover:border-[#ECECEC] hover:bg-[#F8F7F7]"
            key={index}
          >
            {result}
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 p-3 border-t border-[#ECECEC] bg-[#F8F7F7] overflow-auto scrollbar">
        <Button className="shrink-0 !rounded-xl" isPrimary isSmall>
          Surprise me
          <svg className="size-4" width={16} height={16} viewBox="0 0 16 16">
            <path d="M13.5 8.07a.75.75 0 0 1 .75.75v2c0 1.151-.933 2.083-2.083 2.083H4.143l.721.72a.75.75 0 0 1 .073.977l-.073.084a.75.75 0 0 1-1.061 0l-1.646-1.646a1.25 1.25 0 0 1 0-1.768l1.646-1.646a.75.75 0 0 1 1.061 1.061l-.721.719h8.024c.29 0 .53-.212.576-.489l.008-.095v-2a.75.75 0 0 1 .75-.75zm-2.364-6.78a.75.75 0 0 1 1.061 0l1.646 1.646a1.25 1.25 0 0 1 0 1.768L12.197 6.35a.75.75 0 0 1-1.061-1.061l.719-.72H3.833c-.29 0-.53.212-.576.489l-.008.095V6.82a.75.75 0 1 1-1.5 0V5.153c0-1.151.933-2.083 2.083-2.083h8.023l-.72-.72a.75.75 0 0 1-.073-.977l.073-.084z" />
          </svg>
        </Button>
        {["Characters", "Objects", "Backgrounds", "Characters", "Cute"].map(
          (button, index) => (
            <button
              className="shrink-0 px-5 border border-[#E2E2E2] rounded-xl text-[0.75rem] leading-[1rem] font-medium transition-all cursor-pointer hover:bg-[#FCFCFC] hover:shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.25)]"
              key={index}
            >
              {button}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

export default PremadePrompt;
