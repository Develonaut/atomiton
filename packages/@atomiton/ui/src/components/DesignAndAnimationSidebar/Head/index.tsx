import Image from "#components/Image";
import Button from "#components/Button";

const avatars = ["/images/avatars/1.png", "/images/avatars/2.png"];

function Head() {
  return (
    <div className="flex justify-between items-center p-3 pl-4 border-b border-[#ECECEC]">
      <div className="flex">
        {avatars.map((avatar, index) => (
          <div
            className="-ml-2 size-8 border-2 border-[#fcfcfc] rounded-full first:ml-0"
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
      <Button isPrimary>Share</Button>
    </div>
  );
}

export default Head;
