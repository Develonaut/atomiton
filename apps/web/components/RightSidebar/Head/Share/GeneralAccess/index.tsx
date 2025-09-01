import Icon from "@/components/Icon";

const items = [
  {
    title: "Only those invited",
    description: "4 people",
    icon: "people",
  },
  {
    title: "Link access",
    description: "Only users have shared the link",
    icon: "link",
  },
];

const GeneralAccess = () => (
  <div className="px-4 py-2.5 border-t border-s-01">
    <div className="py-2 text-body-sm text-secondary/70">General access</div>
    <div className="">
      {items.map((item, index) => (
        <div className="flex items-center gap-3 py-2.5" key={index}>
          <div className="flex justify-center items-center size-8 border border-s-02 rounded-lg bg-surface-02 shadow-[0px_0px_4px_0px_rgba(18,18,18,0.10)]">
            <Icon className="!size-4" name={item.icon} />
          </div>
          <div className="grow">
            <div>{item.title}</div>
            <div className="text-body-sm text-secondary">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default GeneralAccess;
