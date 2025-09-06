// Vite-compatible adapter for DetailsPage
"use client";

import { useNavigate } from "react-router-dom";
import LayoutOnlyHeader from "@/components/LayoutOnlyHeader";
import Icon from "@/components/Icon";
import VideoPlayer from "@/components/VideoPlayer";
import Slider from "@/templates/Explore/DetailsPage/Slider";
import Details from "@/templates/Explore/DetailsPage/Details";
import Report from "@/templates/Explore/DetailsPage/Report";

function DetailsPageAdapter() {
  const navigate = useNavigate();

  return (
    <LayoutOnlyHeader>
      <div className="flex max-lg:block">
        <div className="relative w-[calc(100%-40rem)] pb-16 max-[1940px]:w-[calc(100%-31rem)] max-xl:w-[calc(100%-25rem)] max-lg:w-full max-md:pb-24">
          <button
            className="absolute top-5 right-5 z-2 size-11 rounded-xl bg-surface-01 border border-s-02 transition-colors hover:bg-surface-03 max-md:top-3"
            onClick={() => navigate(-1)}
          >
            <Icon className="!size-4 fill-primary" name="close" />
          </button>
          <Slider />
          <button className="absolute bottom-5 left-5 flex items-center gap-2 h-11 rounded-xl px-3.5 border border-s-02 transition-colors hover:bg-surface-02 max-md:bottom-0">
            <Icon className="!size-4 fill-red" name="heart" />
            200
          </button>
          <VideoPlayer className="bottom-5 max-md:bottom-16 max-md:left-5 max-md:right-5 max-md:w-auto max-md:translate-x-0" />
          <div className="absolute right-5 bottom-5 flex gap-3 max-md:bottom-0">
            <button className="size-11 rounded-xl bg-surface-01 border border-s-02 transition-colors hover:bg-surface-03">
              <Icon className="!size-4 fill-primary" name="share" />
            </button>
            <Report />
          </div>
        </div>
        <Details />
      </div>
    </LayoutOnlyHeader>
  );
}

export default DetailsPageAdapter;
