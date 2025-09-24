import Item from "#components/Gallery/Item";
import { Masonry } from "react-plock";

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

function Gallery({ className, gallery, config }: Props) {
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
}

export default Gallery;
