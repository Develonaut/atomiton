import Image from "#components/Image";
import Button from "#components/Button";

type Props = {
  item: {
    title: string;
    description: string;
    price: string;
    features: string[];
  };
};

function PriceCard({ item }: Props) {
  const planFree = item.title === "Free";
  const planCreator = item.title === "Creator";
  const planStudio = item.title === "Studio";

  return (
    <div
      className={`relative flex flex-col w-80 rounded-[1.25rem] bg-[#F1F1F1] ${
        planCreator ? "shadow-2xl" : ""
      }`}
    >
      {planCreator && (
        <Image
          className="object-cover rounded-t-[1.25rem] rounded-b-3xl"
          src="/images/bg-pricing.png"
          fill
          alt=""
          sizes="(max-width: 767px) 100vw, 33vw"
        />
      )}
      <div
        className={`px-6 py-3 text-[1.25rem] leading-[1.75rem] tracking-[-0.03em] font-medium ${
          planCreator ? "relative z-1 text-[#FCFCFC]" : ""
        }`}
      >
        {item.title}
      </div>
      <div className="relative z-1 grow p-3 bg-[#FCFCFC] border border-[#E2E2E2] rounded-[1.25rem]">
        <div className="mb-3 p-3 text-[0.9375rem] leading-[1.41rem] tracking-[-0.01em] font-medium">
          {item.description}
        </div>
        <div className="p-3 border border-[#E2E2E2] bg-[#F8F7F7] rounded-[1.25rem] shadow-[0px_2px_2px_0px_rgba(255,255,255,0.80)_inset,0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)]">
          <div className="flex">
            <div className="px-0.5 py-1 text-[1.5rem] leading-[2rem] tracking-[-0.03em] font-medium text-[#7B7B7B]">
              $
            </div>
            <div className="text-[2.5rem] leading-[3rem] tracking-[-0.03em] font-normal">
              {item.price}
            </div>
            <div className="p-2 text-[0.75rem] leading-[1rem] text-[#7B7B7B]">
              USD /<br></br>
              month
            </div>
          </div>
          <Button
            className={`w-full mt-2 ${planFree ? "opacity-50" : ""}`}
            isPrimary={!planStudio}
            isSecondary={planStudio}
          >
            {planFree
              ? "You're on Creator"
              : planCreator
                ? "Current Plan"
                : "Get Studio"}
          </Button>
        </div>
        <div className="flex flex-col gap-2 mt-3 p-3 pt-2">
          {item.features.map((feature) => (
            <div className="flex items-center" key={feature}>
              <svg
                className="size-4 mr-2.5 ml-0.5"
                width={16}
                height={16}
                viewBox="0 0 16 16"
              >
                <path d="M12.422 3.522a.75.75 0 0 1 1.156.956l-6.622 8a.75.75 0 0 1-1.024.125l-3.378-2.5a.75.75 0 1 1 .892-1.206l2.807 2.077 6.169-7.452z" />
              </svg>
              <div className="text-[0.8125rem] leading-[1.22rem] tracking-[-0.01em]">
                {feature}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PriceCard;
