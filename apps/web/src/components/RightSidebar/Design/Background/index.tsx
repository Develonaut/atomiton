import Group from "../../Group";

const Background = () => {
  return (
    <Group title="Background">
      <div className="flex items-center p-1 bg-surface-03 rounded-[0.625rem]">
        <div className="size-7 mr-3 bg-surface-01 rounded-md border border-shade-07/10"></div>
        F4F4F4
        <div className="flex justify-center gap-2 w-16 ml-auto border-l border-shade-07/10">
          <span>100</span>
          <span>%</span>
        </div>
      </div>
    </Group>
  );
};

export default Background;
