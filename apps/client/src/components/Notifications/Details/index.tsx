import Comment from "#Comment";
import Icon from "#components/Icon";
import Image from "#components/Image";

type Props = {
  onClose: () => void;
};

function Details({ onClose }: Props) {
  return (
    <div className="absolute top-1/2 right-full w-92 mr-2 p-1 -translate-y-1/2 bg-surface-01 rounded-[1.25rem] shadow-popover max-lg:w-85 max-md:hidden">
      <div className="flex items-center gap-3 mb-2 p-3">
        <button
          className="size-9 border border-s-02 rounded-[0.625rem]"
          onClick={onClose}
        >
          <Icon className="!size-4" name="close" />
        </button>
        <div className="grow">
          <div className="text-heading-str">Shop House Icon</div>
          <div className="text-body-sm text-secondary/80">3D Objects</div>
        </div>
      </div>
      <div className="mb-2 bg-surface-03 border border-s-02 rounded-2xl overflow-hidden text-center">
        <Image
          src="/images/3d-objects/2.png"
          width={264}
          height={264}
          alt="3D Object"
        />
      </div>
      <Comment />
    </div>
  );
}

export default Details;
