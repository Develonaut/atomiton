import Icon from "@/components/Icon";
import Button from "@/components/Button";
import Title from "../Title";

const features = [
  "Everything in Free",
  "Unlimited 3D scene generation",
  "Premium asset library access",
  "Animations up to 30 seconds",
  "Multiple AI models",
];

const Subscription = () => {
  return (
    <>
      <Title value="Subscription" />
      <div className="p-3 border-t border-s-01">
        <div className="flex items-center px-3 py-4">
          <div>Your plan auto-renews on Jul 3, 2025</div>
          <Icon className="ml-auto fill-secondary" name="add-user" />
        </div>
        <div className="border border-s-02 rounded-[1.25rem] overflow-hidden">
          <div className="-mt-0.25 -mx-0.25 p-3 bg-surface-02 border border-s-02 rounded-[1.25rem] shadow-[0px_2px_2px_0px_rgba(255,255,255,0.80)_inset,0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)]">
            <div className="flex">
              <div className="px-0.5 py-1 text-h5 text-secondary">$</div>
              <div className="text-h2">20</div>
              <div className="p-2 text-secondary">
                USD /<br></br>
                month
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <Button className="flex-1" isPrimary>
                Cancel
              </Button>
              <Button className="flex-1" isSecondary>
                Upgrade
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {features.map((feature) => (
              <div className="flex items-center gap-2" key={feature}>
                <Icon className="mr-2.5 ml-0.5" name="check" />
                <div className="text-p-sm">{feature}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Subscription;
