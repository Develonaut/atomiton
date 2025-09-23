import Button from "#components/Button";
import Title from "../Title";

const features = [
  "Everything in Free",
  "Unlimited 3D scene generation",
  "Premium asset library access",
  "Animations up to 30 seconds",
  "Multiple AI models",
];

function Subscription() {
  return (
    <>
      <Title value="Subscription" />
      <div className="p-3 border-t border-[#ECECEC]">
        <div className="flex items-center px-3 py-4">
          <div className="text-[0.75rem] leading-[1rem] font-medium">
            Your plan auto-renews on Jul 3, 2025
          </div>
          <svg
            className="size-5 ml-auto fill-[#7B7B7B]"
            width={20}
            height={20}
            viewBox="0 0 20 20"
          >
            <path d="M9.15 12.221l-.064.005-.204.018-.09.011-.159.021-.119.02-.126.023-.144.03-.086.02-.182.047c-1.595.44-2.848 1.564-3.501 3.13l-.089.227c-.136.369.201.771.725.771h4.003a.75.75 0 1 1 0 1.5H5.111c-1.505 0-2.657-1.372-2.132-2.791.785-2.122 2.437-3.669 4.546-4.268l.121-.032.029-.01.06-.014.045-.011.137-.032.091-.021.027-.005.268-.049.028-.005.016-.003.061-.008.163-.024.058-.007.062-.007.065-.007.086-.008.124-.01.075-.006.041-.002.034-.002.278-.01h.05l.086-.001c.323 0 .64.02.951.059l.32.048.185.035.102.02.013.003.015.003.085.021.184.043.015.005.026.006.603.19.292.115a.75.75 0 0 1-.582 1.382 5.32 5.32 0 0 0-.557-.199l-.234-.062-.103-.025-.181-.038-.105-.02-.265-.04-.251-.026-.513-.021-.11.001-.27.01zm6.613.103a.75.75 0 1 1 1.286.772l-2.75 4.583a.75.75 0 0 1-1.093.214l-1.833-1.375a.75.75 0 1 1 .9-1.2l1.168.876 2.323-3.87zM9.53 1.96c2.14 0 3.875 1.735 3.875 3.875S11.67 9.71 9.53 9.71 5.655 7.975 5.655 5.835 7.39 1.96 9.53 1.96zm0 1.5c-1.312 0-2.375 1.063-2.375 2.375S8.219 8.21 9.53 8.21s2.375-1.063 2.375-2.375S10.842 3.46 9.53 3.46z" />
          </svg>
        </div>
        <div className="border border-[#E2E2E2] rounded-[1.25rem] overflow-hidden">
          <div className="-mt-0.25 -mx-0.25 p-3 bg-[#f8f7f7] border border-[#E2E2E2] rounded-[1.25rem] shadow-[0px_2px_2px_0px_rgba(255,255,255,0.80)_inset,0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)]">
            <div className="flex">
              <div className="px-0.5 py-1 text-[1.5rem] leading-[2rem] text-[#7b7b7b]">
                $
              </div>
              <div className="text-[2.5rem] leading-[3rem]">20</div>
              <div className="p-2 text-[0.75rem] leading-[1rem] font-medium text-[#7b7b7b]">
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
                <svg
                  className="size-5 mr-2.5 ml-0.5"
                  width={20}
                  height={20}
                  viewBox="0 0 20 20"
                >
                  <path d="M15.384 4.343a.89.89 0 0 1 1.286-.126c.388.334.443.931.121 1.334L8.729 15.657a.89.89 0 0 1-1.246.157L3.37 12.656a.97.97 0 0 1-.191-1.325.89.89 0 0 1 1.277-.198l3.417 2.623 7.51-9.413z" />
                </svg>
                <div className="text-[0.8125rem] leading-[1.2188rem]">
                  {feature}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default Subscription;
