import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Dialog, DialogPanel, CloseButton } from "@headlessui/react";
import Icon from "#components/Icon";
import Image from "#components/Image";
import Button from "#components/Button";
import Share from "./Share";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import "swiper/css/thumbs";

import { FreeMode, Navigation, Thumbs } from "swiper/modules";

type ItemProps = {
  id: number;
  image: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  items: ItemProps[];
  activeId: number;
};
function ZoomIn({ open, onClose, items, activeId }: Props) {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(activeId);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveSlideIndex(swiper.activeIndex);
  };

  return (
    <Dialog className="relative z-50" open={open} onClose={onClose}>
      <div className="fixed inset-0 overflow-y-auto bg-surface-01">
        <DialogPanel
          className="w-full duration-300 ease-out data-[closed]:opacity-0 max-lg:pt-20"
          transition
        >
          <CloseButton className="absolute left-5 top-5 z-15 size-10 border border-s-02 bg-surface-01 rounded-xl transition-colors hover:bg-surface-03">
            <Icon className="!size-4 fill-primary" name="close" />
          </CloseButton>
          <div className="absolute top-5 right-5 z-2 flex gap-3">
            <button className="size-10 border border-s-02 bg-surface-01 rounded-xl transition-colors hover:bg-surface-03">
              <Icon className="!size-4 fill-primary" name="download" />
            </button>
            <Share image={items[activeSlideIndex].image} />
            <Button isPrimary>Add to Asset</Button>
          </div>
          <div className="flex items-center justify-center h-20 max-lg:hidden">
            <div className="max-w-91 min-[1260px]:max-w-137">
              <Swiper
                className="mySwiper"
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={6}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                initialSlide={activeId}
                onSlideChange={handleSlideChange}
                breakpoints={{
                  1260: {
                    slidesPerView: 9,
                  },
                }}
              >
                {items.map((item) => (
                  <SwiperSlide
                    className="!flex justify-center items-center border border-s-02 rounded-xl overflow-hidden cursor-pointer"
                    key={item.id}
                  >
                    <Image
                      className="size-12.5"
                      src={item.image}
                      width={50}
                      height={50}
                      alt=""
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          <div className="relative flex justify-center items-center h-[calc(100svh-5rem)] p-5 border-t border-s-01">
            <div className="w-183 max-md:w-full">
              <Swiper
                className="mySwiper2 !static border border-s-01 bg-surface-02 rounded-4xl overflow-hidden"
                spaceBetween={10}
                navigation={true}
                thumbs={{ swiper: thumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
                initialSlide={activeId}
                speed={700}
                onSlideChange={handleSlideChange}
              >
                {items.map((item) => (
                  <SwiperSlide className="" key={item.id}>
                    <Image
                      className="w-full h-auto max-h-[calc(100svh-7.5rem)] object-cover"
                      src={item.image}
                      width={732}
                      height={732}
                      alt=""
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}

export default ZoomIn;
