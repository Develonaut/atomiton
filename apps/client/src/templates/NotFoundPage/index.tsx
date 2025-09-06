"use client";

import { useId } from "react";
import { Tooltip } from "react-tooltip";
import LayoutOnlyHeader from "@/components/LayoutOnlyHeader";
import Image from "@/components/Image";
import Button from "@/components/Button";

import { items } from "./items";

function NotFoundPage() {
  const idTooltip = useId();

  return (
    <LayoutOnlyHeader classNameHeader="!bg-transparent !border-b-0">
      <div className="pb-16">
        <div className="center text-center">
          <div className="-mt-20 pl-16 max-md:-mt-10 max-md:pl-10">
            <Image
              className="size-161.5 max-2xl:size-132 max-md:size-80"
              src="/images/404.png"
              width={646}
              height={646}
              alt="404"
            />
          </div>
          <div className="relative z-2 max-w-115 -mt-6 mx-auto mb-4 text-h1 max-md:text-h2">
            Uh-oh... I think I took a wrong turn.
          </div>
          <div className="mb-8 text-title-lg text-secondary/80">
            Let’s get you back to where the cute things live.
          </div>
          <Button isPrimary as="link" href="/">
            Go home
          </Button>
        </div>
      </div>
      <div className="fixed top-1/2 right-3.5 flex flex-col gap-3 -translate-y-1/2 max-md:hidden">
        {items.map((item) => (
          <button
            className="border border-s-02 rounded-xl overflow-hidden"
            key={item.id}
            data-tooltip-id={idTooltip}
            data-tooltip-content="Copy prompt"
            data-tooltip-place="left"
          >
            <Image
              className="size-12.5"
              src={item.image}
              width={50}
              height={50}
              alt=""
            />
          </button>
        ))}
      </div>
      <Tooltip id={idTooltip} />
    </LayoutOnlyHeader>
  );
}

export default NotFoundPage;
