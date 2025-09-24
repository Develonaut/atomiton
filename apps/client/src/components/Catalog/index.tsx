import Card from "#Card";
import Filters from "#components/Filters";
import { useEffect, useRef, useState } from "react";
import { useWindowScroll } from "react-use";

type Props = {
  title: string;
  content: {
    id: string;
    title: string;
    category: string;
    image: string;
    type: string;
  }[];
  loading?: boolean;
  "data-testid"?: string;
};

function Catalog({ title, content, loading, ...props }: Props) {
  const scrollRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);
  const { y } = useWindowScroll();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fixed = isMounted && y > 1;

  return (
    <>
      <div
        className={`sticky top-20 z-10 flex items-center h-18 px-12 max-2xl:px-5 ${
          fixed ? "shadow-depth-01 bg-surface-01" : ""
        }`}
        ref={scrollRef}
        data-testid={props["data-testid"]}
      >
        <div className="mr-auto text-[1.25rem] leading-8 font-medium">
          {title}
        </div>
        <Filters />
      </div>
      <div className="px-12 pb-8 max-2xl:px-5">
        <div className="flex flex-wrap -mt-3 -mx-1.5">
          {content.map((item) => (
            <Card value={item} key={item.id} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Catalog;
