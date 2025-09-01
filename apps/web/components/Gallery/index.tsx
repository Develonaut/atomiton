import { Masonry } from "react-plock";
import Item from "./Item";

type Props = {
  className?: string;
  gallery: {
    id: number;
    title: string;
    image: string;
  }[];
  config: {
    columns: number[];
    gap: number[];
    media: number[];
  };
};

const Gallery = ({ className, gallery, config }: Props) => {
  return (
    <div className={className || ""}>
      <Masonry
        className=""
        items={gallery}
        config={config}
        render={(item, index) => <Item key={index} value={item} />}
      />
    </div>
  );
};

export default Gallery;
