import LayoutOnlyHeader from "@/components/LayoutOnlyHeader";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import Contacts from "./Contacts";
import Gallery from "@/components/Gallery";

import { gallery } from "./content";

function ProfilePage() {
  return (
    <LayoutOnlyHeader>
      <div className="py-11 max-md:py-8">
        <div className="center !max-w-300">
          <div className="flex justify-between mb-11 max-md:block max-md:mb-8">
            <div className="flex items-center">
              <div className="shrink-0">
                <Image
                  className="size-20 rounded-full object-cover opacity-100"
                  src="/images/avatars/1.png"
                  width={80}
                  height={80}
                  alt=""
                />
              </div>
              <div className="pl-6 max-md:pl-4">
                <div className="text-h5 max-md:text-h6">Sophie Bennett ®</div>
                <div className="flex flex-wrap gap-5 mt-2 text-heading max-md:gap-2 max-md:mt-1">
                  <div className="">159 scenes</div>
                  <div className="">5,882 likes</div>
                  <div className="flex items-center gap-1.5 text-secondary">
                    <Icon className="!size-4 fill-secondary" name="location" />
                    Dubai
                  </div>
                  <a
                    className="group flex items-center gap-1.5 text-secondary transition-colors hover:text-primary"
                    href="https://ui8.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon
                      className="!size-4 fill-secondary transition-colors group-hover:fill-primary"
                      name="link"
                    />
                    ui8.net
                  </a>
                </div>
              </div>
            </div>
            <Contacts gallery={gallery} />
          </div>
          <Gallery
            config={{
              columns: [1, 2, 3, 4],
              gap: [12, 12, 12, 12],
              media: [767, 1023, 1680, 1920],
            }}
            gallery={gallery}
          />
        </div>
      </div>
    </LayoutOnlyHeader>
  );
}

export default ProfilePage;
