import LayoutOnlyHeader from "@/components/LayoutOnlyHeader";
import Image from "@/components/Image";

import { content } from "./content";

function UpdatesPage() {
  return (
    <LayoutOnlyHeader>
      <div className="py-12 max-md:py-8">
        <div className="center">
          <div className="mb-12 pl-87 text-h2 max-[1279px]:pl-64 max-lg:pl-0 max-md:mb-8 max-md:text-h4">
            Updates
            <span className="block text-secondary">
              What’s new in Brainwave.
            </span>
          </div>
          <div className="flex flex-col gap-22 max-lg:gap-16 max-md:gap-12">
            {content.map((item) => (
              <div className="flex max-lg:block" key={item.id}>
                <div className="shrink-0 w-87 pr-6 max-[1279px]:w-64 max-lg:w-full max-lg:mb-4 max-lg:pr-0">
                  <div className="text-h6">{item.title}</div>
                  <div className="mt-1.5 text-secondary">{item.date}</div>
                </div>
                <div className="grow">
                  <div className="">
                    <Image
                      className="w-full rounded-4xl max-md:rounded-3xl"
                      src={item.image}
                      width={692}
                      height={470}
                      alt=""
                    />
                  </div>
                  <div className="content mt-8">{item.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LayoutOnlyHeader>
  );
}

export default UpdatesPage;
