import Layout from "@/components/Layout";
import Group from "@/components/Group";
import RowCards from "@/components/RowCards";
import Card from "@/components/Card";

const DepthsPage = () => {
  const style = "size-32 rounded-3xl bg-[#FCFCFC] border border-[#ECECEC]";
  return (
    <Layout title="Depths">
      <Group>
        <RowCards>
          <Card className="aspect-square" title="Surface" span={4} center>
            <div className={`${style}`}></div>
          </Card>
          <Card className="aspect-square" title="Toolbar" span={4} center>
            <div
              className={`${style} shadow-[0px_1px_4px_-4px_rgba(0,0,0,0.08),0px_8px_16px_-12px_rgba(0,0,0,0.13)]`}
            ></div>
          </Card>
          <Card className="aspect-square" title="Subtle" span={4} center>
            <div
              className={`${style} shadow-[0px_16px_4px_0px_rgba(0,0,0,0.00),0px_10px_4px_0px_rgba(0,0,0,0.00),0px_6px_3px_0px_rgba(0,0,0,0.01),0px_3px_3px_0px_rgba(0,0,0,0.02),0px_1px_1px_0px_rgba(0,0,0,0.02)]`}
            ></div>
          </Card>
          <Card className="aspect-square" title="Slight hover" span={4} center>
            <div
              className={`${style} shadow-[0px_2px_8px_-4px_rgba(0,0,0,0.25)]`}
            ></div>
          </Card>
          <Card className="aspect-square" title="Button" span={4} center>
            <div
              className={`${style} shadow-[0px_3px_4px_-1px_rgba(0,0,0,0.15),0px_1px_0px_0px_rgba(255,255,255,0.33)_inset,0px_0px_0px_1px_#D4D4D4]`}
            ></div>
          </Card>
          <Card className="aspect-square" title="Prompt Input" span={4} center>
            <div
              className={`${style} shadow-[0px_18px_24px_-20px_rgba(0,0,0,0.13),0px_2px_0px_0px_#FFF_inset,0px_8px_16px_-12px_rgba(0,0,0,0.08)]`}
            ></div>
          </Card>
          <Card className="aspect-square" title="Modal" span={4} center>
            <div className={`${style} shadow-2xl`}></div>
          </Card>
          <Card
            className="aspect-square"
            title="Large card hover"
            span={4}
            center
          >
            <div
              className={`${style} shadow-[0px_12px_11.1px_-12px_rgba(0,0,0,0.15),0px_80px_64px_-64px_rgba(0,0,0,0.20),0px_16px_32px_-24px_rgba(0,0,0,0.62)]`}
            ></div>
          </Card>
        </RowCards>
      </Group>
    </Layout>
  );
};

export default DepthsPage;
