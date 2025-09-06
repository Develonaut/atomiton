import { useRef, useEffect, useState } from "react";
import type { RndResizeCallback } from "react-rnd";
import { Rnd } from "react-rnd";
import Image from "@/components/Image";

type Props = {
  image: string;
};

const DEFAULT_WIDTH = 640;
const DEFAULT_HEIGHT = 480;

function ResizeImage({ image }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [size, setSize] = useState({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
  });

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (rect.width - DEFAULT_WIDTH) / 2;
      const y = (rect.height - DEFAULT_HEIGHT) / 2;
      setPosition({ x, y });
      setReady(true);
    }
  }, []);

  const handleResize: RndResizeCallback = (e, direction, ref) => {
    setSize({
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    });
  };

  return (
    <div className="fixed inset-0 bg-shade-07/10">
      <div
        ref={containerRef}
        className="absolute top-20 right-79 left-79 bottom-64"
      >
        {ready && (
          <Rnd
            className="bg-surface-03 rounded-xl shadow-[inset_0_0_0_2px_#fcfcfc,0px_324px_91px_0px_rgba(0,0,0,0.00),_0px_208px_83px_0px_rgba(0,0,0,0.00),_0px_117px_70px_0px_rgba(0,0,0,0.01),_0px_52px_52px_0px_rgba(0,0,0,0.02),_0px_13px_29px_0px_rgba(0,0,0,0.02)]"
            default={{
              x: position.x,
              y: position.y,
              width: DEFAULT_WIDTH,
              height: DEFAULT_HEIGHT,
            }}
            minWidth={100}
            minHeight={100}
            bounds="parent"
            enableResizing={true}
            disableDragging={true}
            onResize={handleResize}
          >
            <div className="">
              <span className="absolute top-[calc(100%-0.25rem)] left-[calc(50%-1.125rem)] w-9 h-2 bg-surface-02 rounded-full shadow-[0px_-1px_4px_-2px_rgba(0,0,0,0.20)_inset,_0px_0px_2.6px_-1px_rgba(0,0,0,0.17),_0px_1px_4px_0px_rgba(0,0,0,0.14)]"></span>
              <span className="absolute bottom-[calc(100%-0.25rem)] left-[calc(50%-1.125rem)] w-9 h-2 bg-surface-02 rounded-full shadow-[0px_-1px_4px_-2px_rgba(0,0,0,0.20)_inset,_0px_0px_2.6px_-1px_rgba(0,0,0,0.17),_0px_1px_4px_0px_rgba(0,0,0,0.14)]"></span>
              <span className="absolute left-[calc(100%-0.25rem)] top-[calc(50%-1.125rem)] w-2 h-9 bg-surface-02 rounded-full shadow-[0px_-1px_4px_-2px_rgba(0,0,0,0.20)_inset,_0px_0px_2.6px_-1px_rgba(0,0,0,0.17),_0px_1px_4px_0px_rgba(0,0,0,0.14)]"></span>
              <span className="absolute right-[calc(100%-0.25rem)] top-[calc(50%-1.125rem)] w-2 h-9 bg-surface-02 rounded-full shadow-[0px_-1px_4px_-2px_rgba(0,0,0,0.20)_inset,_0px_0px_2.6px_-1px_rgba(0,0,0,0.17),_0px_1px_4px_0px_rgba(0,0,0,0.14)]"></span>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 flex items-center gap-1 h-6 mt-4 bg-primary rounded-lg pl-1 pr-0.5 shadow-[0px_4px_4px_-2px_rgba(0,0,0,0.40)] text-body-sm text-shade-05">
              <div className="min-w-16 text-center">
                {size.width} x {size.height}
              </div>
              <div className="flex items-center h-5 px-1 border border-shade-01/5 bg-[#303030] rounded-md">
                px
              </div>
            </div>
            <Image
              className="object-cover rounded-xl"
              src={image}
              fill
              alt=""
            />
          </Rnd>
        )}
      </div>
    </div>
  );
}

export default ResizeImage;
