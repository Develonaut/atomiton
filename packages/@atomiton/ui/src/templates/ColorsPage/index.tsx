import Group from "#components/Group";
import Layout from "#components/Layout";

import { colors } from "./content";

function ColorsPage() {
  return (
    <Layout title="Colors">
      {colors.map((group, index) => (
        <Group title={group.title} key={index}>
          <div className="flex flex-wrap -mt-4 -mx-2">
            {group.items.map((item, index) => (
              <div
                className="w-[calc(20%-1rem)] mt-4 mx-2 p-1.5 rounded-xl border border-[#ECECEC] max-[1259px]:w-[calc(25%-1rem)]"
                key={index}
              >
                <div
                  className="h-15 mb-1.5 rounded-[0.625rem] border border-[#ECECEC]"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div className="p-2">
                  <div className="text-[0.875rem] leading-[1.25] font-medium">
                    {item.title}
                  </div>
                  <div className="text-[0.625rem] leading-[1rem] text-[#7B7B7B]">
                    {item.color.slice(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Group>
      ))}
    </Layout>
  );
}

export default ColorsPage;
