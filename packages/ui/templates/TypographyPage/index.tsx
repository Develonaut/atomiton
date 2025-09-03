"use client";

import Layout from "@/components/Layout";
import Group from "@/components/Group";

const TypographyPage = () => {
  const styles =
    "w-full table-fixed border border-[#ECECEC] text-[0.6875rem] leading-[1rem] font-medium text-[#7B7B7B] [&_th,&_td]:p-5 [&_th]:text-left [&_th]:font-medium [&_th]:opacity-50 [&_td]:border-t [&_td]:border-[#ECECEC] [&_td]:first:text-[#121212]";

  return (
    <Layout title="Typography">
      <Group title="Headline">
        <table className={styles}>
          <thead>
            <tr>
              <th>Style</th>
              <th>Font</th>
              <th>Font weight</th>
              <th>Size/Line height</th>
              <th>Letter spacing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[3rem] leading-[3.45rem] tracking-[-0.03em] font-normal">
                h1
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>48/115%</td>
              <td>-3%</td>
            </tr>
            <tr>
              <td className="text-[2.5rem] leading-[3rem] tracking-[-0.03em] font-normal">
                h2
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>40/48</td>
              <td>-3%</td>
            </tr>
            <tr>
              <td className="text-[2rem] leading-[2.5rem] tracking-[-0.03em] font-normal">
                h3
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>32/40</td>
              <td>-3%</td>
            </tr>
            <tr>
              <td className="text-[1.75rem] leading-[2.25rem] tracking-[-0.03em] font-normal">
                h4
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>28/36</td>
              <td>-3%</td>
            </tr>
            <tr>
              <td className="text-[1.5rem] leading-[2rem] tracking-[-0.03em] font-medium">
                h5
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>24/32</td>
              <td>-3%</td>
            </tr>
            <tr>
              <td className="text-[1.25rem] leading-[1.75rem] tracking-[-0.03em] font-medium">
                h6
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>20/28</td>
              <td>-3%</td>
            </tr>
          </tbody>
        </table>
      </Group>
      <Group title="Body">
        <table className={styles}>
          <thead>
            <tr>
              <th>Style</th>
              <th>Font</th>
              <th>Font weight</th>
              <th>Size/Line height</th>
              <th>Letter spacing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[0.625rem] leading-[1rem] tracking-[-0.01em]">
                Body, X Small
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>10/16</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.6875rem] leading-[1rem] tracking-[-0.01em] font-medium">
                Body, Small
              </td>
              <td>Inter</td>
              <td>Medium</td>
              <td>11/16</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.75rem] leading-[1rem] tracking-[-0.01em] font-medium">
                Body, Medium
              </td>
              <td>Inter</td>
              <td>Medium</td>
              <td>12/16</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.75rem] leading-[1rem] tracking-[-0.01em] font-semibold">
                Body Medium, Strong
              </td>
              <td>Inter</td>
              <td>Semibold</td>
              <td>12/16</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.8125rem] leading-[1rem] tracking-[-0.01em] font-semibold">
                Body Large, Strong
              </td>
              <td>Inter</td>
              <td>Semibold</td>
              <td>13/16</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.8125rem] leading-[1rem] tracking-[-0.01em] font-medium">
                Body Large, Medium
              </td>
              <td>Inter</td>
              <td>Medium</td>
              <td>13/16</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.8125rem] leading-[1rem] tracking-[-0.01em]">
                Body Large
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>13/16</td>
              <td>-1%</td>
            </tr>
          </tbody>
        </table>
      </Group>
      <Group title="Heading">
        <table className={styles}>
          <thead>
            <tr>
              <th>Style</th>
              <th>Font</th>
              <th>Font weight</th>
              <th>Size/Line height</th>
              <th>Letter spacing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[0.875rem] leading-[1.25rem] tracking-[-0.01em] font-medium">
                Heading
              </td>
              <td>Inter</td>
              <td>Medium</td>
              <td>14/20</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.875rem] leading-[1.25rem] tracking-[-0.02em] font-semibold">
                Heading, Strong
              </td>
              <td>Inter</td>
              <td>Semibold</td>
              <td>14/20</td>
              <td>-2%</td>
            </tr>
          </tbody>
        </table>
      </Group>
      <Group title="Title">
        <table className={styles}>
          <thead>
            <tr>
              <th>Style</th>
              <th>Font</th>
              <th>Font weight</th>
              <th>Size/Line height</th>
              <th>Letter spacing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[0.9375rem] leading-[1.5rem] tracking-[-0.02em] font-medium">
                Title
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>15/24</td>
              <td>-2%</td>
            </tr>
            <tr>
              <td className="text-[0.9375rem] leading-[1.5rem] tracking-[-0.02em] font-semibold">
                Title, Strong
              </td>
              <td>Inter</td>
              <td>Semibold</td>
              <td>15/24</td>
              <td>-2%</td>
            </tr>
            <tr>
              <td className="text-[1.125rem] leading-[1.6875rem] tracking-[-0.02em]">
                Title, Large
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>18/150%</td>
              <td>-2%</td>
            </tr>
          </tbody>
        </table>
      </Group>
      <Group title="Paragraph">
        <table className={styles}>
          <thead>
            <tr>
              <th>Style</th>
              <th>Font</th>
              <th>Font weight</th>
              <th>Size/Line height</th>
              <th>Letter spacing</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="text-[0.8125rem] leading-[1.22rem] tracking-[-0.01em]">
                Paragraph, small
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>13/150%</td>
              <td>-1%</td>
            </tr>
            <tr>
              <td className="text-[0.9375rem] leading-[1.41rem] tracking-[-0.01em] font-medium">
                Paragraph, medium
              </td>
              <td>Inter</td>
              <td>Regular</td>
              <td>15/150%</td>
              <td>-1%</td>
            </tr>
          </tbody>
        </table>
      </Group>
    </Layout>
  );
};

export default TypographyPage;
