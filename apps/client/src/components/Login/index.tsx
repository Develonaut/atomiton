import Image from "#components/Image";
import Icon from "#components/Icon";
import PanelMessage from "#components/PanelMessage";

type Props = {
  title: string;
  image: string;
  children: React.ReactNode;
};

function Login({ title, image, children }: Props) {
  return (
    <div className="flex p-5 max-lg:h-screen">
      <div className="flex justify-center items-center grow">
        <div className="w-full max-w-80">
          <div className="mb-10 text-center text-h3">{title}</div>
          {children}
        </div>
      </div>
      <div className="relative w-[55%] h-[calc(100svh-2.5rem)] max-xl:w-[60%] max-lg:hidden">
        <Image
          className="rounded-xl object-cover"
          src={image}
          fill
          alt=""
          sizes="50vw"
        />
        <button className="absolute top-4 left-4">
          <Icon className="!size-6 fill-shade-01" name="volume" />
        </button>
        <PanelMessage className="!absolute !bottom-14" />
        <div className="absolute left-0 right-0 bottom-5 text-center text-body-lg text-surface-01">
          Try Brainwave 2.0 for free
        </div>
      </div>
    </div>
  );
}

export default Login;
