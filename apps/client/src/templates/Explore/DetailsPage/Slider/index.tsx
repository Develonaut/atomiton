import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import Image from "@/components/Image";
import "swiper/css";
import { useRef } from "react";

import { content } from "./content";

function Slider() {
  const swiperRef = useRef<SwiperType>(null);

  const handleClick = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  return (
    <div className="py-10 overflow-hidden max-md:py-8">
      <div className="max-w-[35vw] mx-auto max-lg:max-w-100 max-md:max-w-[80vw]">
        <Swiper
          className="swiper-explore !overflow-visible"
          spaceBetween={12}
          slidesPerView={"auto"}
          centeredSlides={true}
          loop={true}
          speed={800}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onClick={handleClick}
          breakpoints={{
            1420: {
              spaceBetween: 88,
            },
            1260: {
              spaceBetween: 48,
            },
            768: {
              spaceBetween: 32,
            },
          }}
        >
          {content.map((item) => (
            <SwiperSlide key={item.id}>
              <Image
                className="w-full h-[calc(100svh-14rem)] rounded-2xl object-cover cursor-pointer max-lg:h-132 max-md:h-100"
                src={item.images}
                width={510}
                height={676}
                alt=""
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}

export default Slider;
