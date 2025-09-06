import Image from "@/components/Image";
import Button from "@/components/Button";
import Icon from "@/components/Icon";

type Props = {
  item: {
    id: number;
    title: string;
    description: string;
    priceMonthly: string;
    priceYearly: string;
    features: string[];
  };
  price: number;
};

function Item({ item, price }: Props) {
  const planFree = item.title === "Free";
  const planCreator = item.title === "Creator";
  const planStudio = item.title === "Studio";

  return (
    <div
      className={`relative flex flex-col flex-1 rounded-[1.25rem] bg-surface-03 max-lg:shrink-0 max-lg:flex-auto max-lg:w-80 max-lg:mr-6 max-lg:last:mr-0 max-md:mr-4 ${
        planCreator ? "shadow-popover max-lg:shadow-2xl" : ""
      }`}
    >
      {planCreator && (
        <Image
          className="object-cover opacity-100 rounded-t-[1.25rem] rounded-b-3xl"
          src="/images/bg-pricing.png"
          fill
          alt=""
          sizes="(max-width: 767px) 100vw, 33vw"
        />
      )}
      <div
        className={`px-6 py-3 text-h6 ${
          planCreator ? "relative z-1 text-shade-01" : ""
        }`}
      >
        {item.title}
      </div>
      <div className="relative z-1 grow p-3 bg-surface-01 border border-s-02 rounded-[1.25rem]">
        <div className="mb-3 p-3 text-p-md">{item.description}</div>
        <div className="p-3 border border-s-02 bg-surface-02 rounded-[1.25rem] shadow-[0px_2px_2px_0px_rgba(255,255,255,0.80)_inset,0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)]">
          <div className="flex">
            <div className="px-0.5 py-1 text-h5 text-secondary">$</div>
            <div className="text-h2">
              {price === 0 ? item.priceMonthly : item.priceYearly}
            </div>
            <div className="p-2 text-secondary">
              USD /<br></br>
              {price === 0 ? "month" : "year"}
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
              <Icon className="mr-2.5 ml-0.5" name="check" />
              <div className="text-p-sm">{feature}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Item;
