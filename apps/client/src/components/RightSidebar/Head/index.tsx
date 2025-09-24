import Image from "#components/Image";
import Share from "#components/RightSidebar/Head/Share";

const avatars = ["/images/avatars/1.png", "/images/avatars/2.png"];

function Head() {
  return (
    <div className="flex justify-between items-center p-3 pl-4 border-b border-s-01">
      <div className="flex">
        {avatars.map((avatar, index) => (
          <div
            className="-ml-2 size-8 border-2 border-surface-01 rounded-full first:ml-0"
            style={{
              zIndex: avatars.length - index,
            }}
            key={index}
          >
            <Image
              className="size-full opacity-100"
              src={avatar}
              width={32}
              height={32}
              alt="Avatar"
            />
          </div>
        ))}
      </div>
      <Share />
    </div>
  );
}

export default Head;
