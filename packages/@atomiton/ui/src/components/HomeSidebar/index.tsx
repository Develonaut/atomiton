import Folders from "#components/Folders";
import Dropdown from "#components/HomeSidebar/Dropdown";
import NavLink from "#components/HomeSidebar/NavLink";
import Image from "#components/Image";
import Link from "#components/Link";
import { useLocation, useNavigate } from "@atomiton/router";

type DropdownItemProps = {
  active?: boolean;
  onClick?: () => void;
  to?: string;
  children: React.ReactNode;
};

function DropdownItem({
  active = false,
  onClick,
  to,
  children,
}: DropdownItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate({ to });
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`relative flex items-center h-10 pl-12 pr-3 text-[0.75rem] font-semibold transition-colors cursor-pointer hover:text-[#121212] before:absolute before:top-0 before:left-4.75 before:bottom-5 before:w-4 before:border-l-[1.5px] before:border-b-[1.5px] before:border-[#ececec] before:rounded-bl-lg ${
        active ? "text-[#121212]" : "text-[#7b7b7b]"
      }`}
      onClick={handleClick}
    >
      {children}
      <svg
        className={`size-4 ml-auto -rotate-90 fill-[#7b7b7b] transition-opacity ${
          active ? "opacity-100" : "opacity-0"
        }`}
        width={20}
        height={20}
        viewBox="0 0 20 20"
      >
        <path d="M11.371 12.38c-.757.827-1.985.827-2.742 0l-3.36-3.668a1.07 1.07 0 0 1 0-1.418c.359-.392.94-.392 1.299 0l3.36 3.668c.04.044.104.044.144 0l3.36-3.668c.359-.392.94-.392 1.299 0a1.07 1.07 0 0 1 0 1.418l-3.36 3.668z" />
      </svg>
    </button>
  );
}

function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex flex-col w-60 min-h-219 bg-[#FCFCFC] border-r border-[#ECECEC]">
      <div className="p-6">
        <Link href="/">
          <Image
            className="opacity-100"
            src="/images/logo.svg"
            width={145}
            height={32}
            alt="Logo"
          />
        </Link>
      </div>
      <div className="px-5 pb-5 overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-0.5 mb-3">
          <Dropdown
            title="Explore"
            iconPath="M8.177 2.76h.75a.75.75 0 0 0-.75-.75v.75zm0 5.417v.75a.75.75 0 0 0 .75-.75h-.75zm-5.417 0h-.75a.75.75 0 0 0 .75.75v-.75zm.91-5.235l.34.668-.34-.668zm-.728.728l.668.34-.668-.34zm8.152-.91v-.75a.75.75 0 0 0-.75.75h.75zm5.417 5.417v.75a.75.75 0 0 0 .75-.75h-.75zm-5.417 0h-.75a.75.75 0 0 0 .75.75v-.75zM15.6 2.942l-.34.668.34-.668zm.728.728l-.668.34.668-.34zM2.76 11.093v-.75a.75.75 0 0 0-.75.75h.75zm5.417 0h.75a.75.75 0 0 0-.75-.75v.75zm0 5.417v.75a.75.75 0 0 0 .75-.75h-.75zm-4.507-.182l.34-.668-.34.668zm-.728-.728l.668-.34-.668.34zm13.77 2.173a.75.75 0 1 0 1.061-1.061l-1.061 1.061zm-.992-2.053l-.531-.529.531.529zM5.427 2.76v.75h2.75v-.75-.75h-2.75v.75zm2.75 0h-.75v5.417h.75.75V2.76h-.75zm0 5.417v-.75H2.76v.75.75h5.417v-.75zm-5.417 0h.75v-2.75h-.75-.75v2.75h.75zM5.427 2.76v-.75c-.454 0-.84-.001-1.156.025-.324.026-.64.085-.941.238l.341.668.34.668c.055-.028.151-.061.383-.08.24-.02.555-.02 1.034-.02v-.75zM2.76 5.427h.75l.02-1.034c.019-.232.052-.328.08-.383l-.668-.34-.668-.34c-.154.302-.212.617-.238.941-.026.316-.025.701-.025 1.156h.75zm.91-2.485l-.34-.668c-.455.232-.824.601-1.056 1.056l.668.341.668.34c.088-.172.228-.313.401-.401l-.34-.668zm7.423-.182v.75h2.75v-.75-.75h-2.75v.75zm5.417 2.667h-.75v2.75h.75.75v-2.75h-.75zm0 2.75v-.75h-5.417v.75.75h5.417v-.75zm-5.417 0h.75V2.76h-.75-.75v5.417h.75zm2.75-5.417v.75l1.034.02c.232.019.328.052.383.08l.34-.668.341-.668c-.302-.154-.617-.212-.941-.238-.316-.026-.701-.025-1.156-.025v.75zm2.667 2.667h.75l-.025-1.156c-.026-.324-.084-.64-.238-.941l-.668.341-.668.34c.028.055.061.151.08.383.02.24.02.555.02 1.034h.75zm-.91-2.485l-.34.668c.172.088.313.228.401.401l.668-.34.668-.34c-.232-.455-.601-.824-1.056-1.056l-.341.668zM2.76 11.093v.75h5.417v-.75-.75H2.76v.75zm5.417 0h-.75v5.417h.75.75v-5.417h-.75zm0 5.417v-.75h-2.75v.75.75h2.75v-.75zM2.76 13.843h.75v-2.75h-.75-.75v2.75h.75zm2.667 2.667v-.75c-.479 0-.793-.001-1.034-.02-.232-.019-.328-.052-.383-.08l-.34.668-.34.668c.302.154.617.212.941.238.316.026.701.025 1.156.025v-.75zM2.76 13.843h-.75l.025 1.156c.026.324.085.64.238.941l.668-.341.668-.34c-.028-.055-.061-.151-.08-.383-.02-.24-.02-.555-.02-1.034h-.75zm.91 2.485l.34-.668c-.172-.088-.313-.228-.401-.401l-.668.34-.668.341c.232.455.601.824 1.056 1.056l.341-.668zm10.132.188v-.75a1.96 1.96 0 0 1-1.958-1.958h-.75-.75a3.46 3.46 0 0 0 3.458 3.458v-.75zm-2.708-2.708h.75a1.96 1.96 0 0 1 1.958-1.958v-.75-.75a3.46 3.46 0 0 0-3.458 3.458h.75zm2.708-2.708v.75a1.96 1.96 0 0 1 1.958 1.958h.75.75a3.46 3.46 0 0 0-3.458-3.458v.75zm1.918 4.62l-.53.53 1.522 1.522.53-.53.53-.53-1.522-1.522-.53.53zm.79-1.912h-.75a1.95 1.95 0 0 1-.571 1.382l.531.529.531.529a3.45 3.45 0 0 0 1.009-2.441h-.75zm-.79 1.912l-.531-.529a1.95 1.95 0 0 1-1.387.576v.75.75a3.45 3.45 0 0 0 2.45-1.017l-.531-.529z"
            active
            defaultOpen
          >
            <DropdownItem active>Designs</DropdownItem>
            <DropdownItem>Animations</DropdownItem>
          </Dropdown>

          <Dropdown
            title="Assets"
            iconPath="M10.005 14.004a.75.75 0 0 1 .75.75v1.699l.982-.552a.75.75 0 0 1 .966.201l.056.085a.75.75 0 0 1-.286 1.021l-1.691.951c-.482.271-1.071.271-1.553 0l-1.691-.951a.75.75 0 1 1 .735-1.307l.982.552v-1.699a.75.75 0 0 1 .648-.743l.102-.007zm6.875-3.294a.75.75 0 0 1 .75.75v1.922c0 .572-.309 1.1-.807 1.38l-1.808 1.017a.75.75 0 1 1-.735-1.307l1.086-.611-1.442-.833a.75.75 0 0 1-.319-.933l.045-.092a.75.75 0 0 1 1.025-.275l1.457.842v-1.11a.75.75 0 0 1 .648-.743l.102-.007zm-13.75 0a.75.75 0 0 1 .75.75v1.11l1.457-.842a.75.75 0 0 1 .968.19l.057.085a.75.75 0 0 1-.275 1.025l-1.443.833 1.087.611a.75.75 0 0 1 .33.929l-.044.092a.75.75 0 0 1-1.021.286l-1.808-1.017c-.499-.28-.807-.808-.807-1.38V11.46a.75.75 0 0 1 .75-.75zm10.863-6.199a.75.75 0 0 1 1.021-.286l1.808 1.017c.499.28.807.808.807 1.38v1.921a.75.75 0 1 1-1.5 0V7.432l-1.423.823a.75.75 0 0 1-.968-.19l-.057-.085a.75.75 0 0 1 .275-1.025l1.409-.814-1.086-.61a.75.75 0 0 1-.33-.929l.044-.092zm-8.998-.286a.75.75 0 1 1 .735 1.307l-1.087.61 1.409.814a.75.75 0 0 1 .319.933l-.045.092a.75.75 0 0 1-1.025.275L3.88 7.433v1.11a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75V6.622c0-.572.309-1.1.807-1.38l1.808-1.017zm4.233-2.381c.482-.271 1.071-.271 1.553 0l1.691.951a.75.75 0 0 1-.735 1.307l-.982-.553V5.21a.75.75 0 0 1-.648.743l-.102.007a.75.75 0 0 1-.75-.75V3.549l-.982.553a.75.75 0 0 1-.966-.201l-.056-.085a.75.75 0 0 1 .286-1.021l1.691-.951"
            counter={112}
          >
            <DropdownItem>3D Objects</DropdownItem>
            <DropdownItem>Materials</DropdownItem>
          </Dropdown>

          <NavLink
            title="Likes"
            iconPath="M10.137 3.308c2.84-2.175 6.607-1.109 7.907 2.139 1.535 3.836-1.049 8.561-7.68 12.287a.75.75 0 0 1-.735 0C2.998 14.009.415 9.283 1.949 5.447c1.299-3.248 5.067-4.313 7.907-2.139l.14.112.141-.112zm6.514 2.696c-1.01-2.524-4.007-3.194-6.12-1.046a.75.75 0 0 1-1.069 0C7.35 2.81 4.352 3.48 3.342 6.004c-1.164 2.91.818 6.726 6.354 10.035l.3.176.301-.176c5.428-3.245 7.439-6.976 6.419-9.863l-.065-.172z"
          />

          <Dropdown
            title="Debug"
            iconPath="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2zm0 13a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15zM2 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2 10zm13 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 15 10zM4.343 4.343a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 1 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061zm9.193 9.193a.75.75 0 0 1 1.06 0l1.061 1.06a.75.75 0 1 1-1.06 1.061l-1.061-1.06a.75.75 0 0 1 0-1.061zM15.657 4.343a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 1 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0zM6.464 13.536a.75.75 0 0 1 0 1.06l-1.061 1.061a.75.75 0 1 1-1.06-1.06l1.06-1.061a.75.75 0 0 1 1.061 0z"
            defaultOpen={location.pathname !== "/"}
          >
            <DropdownItem
              to="/buttons"
              active={location.pathname === "/buttons"}
            >
              Buttons
            </DropdownItem>
            <DropdownItem to="/cards" active={location.pathname === "/cards"}>
              Cards
            </DropdownItem>
            <DropdownItem to="/colors" active={location.pathname === "/colors"}>
              Colors
            </DropdownItem>
            <DropdownItem
              to="/comment"
              active={location.pathname === "/comment"}
            >
              Comment
            </DropdownItem>
            <DropdownItem to="/depths" active={location.pathname === "/depths"}>
              Depths
            </DropdownItem>
            <DropdownItem
              to="/dropdown"
              active={location.pathname === "/dropdown"}
            >
              Dropdown
            </DropdownItem>
            <DropdownItem
              to="/iconography"
              active={location.pathname === "/iconography"}
            >
              Iconography
            </DropdownItem>
            <DropdownItem to="/inputs" active={location.pathname === "/inputs"}>
              Inputs
            </DropdownItem>
            <DropdownItem to="/menu" active={location.pathname === "/menu"}>
              Menu
            </DropdownItem>
            <DropdownItem to="/modal" active={location.pathname === "/modal"}>
              Modal
            </DropdownItem>
            <DropdownItem
              to="/notifications"
              active={location.pathname === "/notifications"}
            >
              Notifications
            </DropdownItem>
            <DropdownItem
              to="/prompt-input"
              active={location.pathname === "/prompt-input"}
            >
              Prompt Input
            </DropdownItem>
            <DropdownItem
              to="/sidebar"
              active={location.pathname === "/sidebar"}
            >
              Sidebar
            </DropdownItem>
            <DropdownItem
              to="/toolbar"
              active={location.pathname === "/toolbar"}
            >
              Toolbar
            </DropdownItem>
            <DropdownItem to="/topbar" active={location.pathname === "/topbar"}>
              Topbar
            </DropdownItem>
            <DropdownItem
              to="/typography"
              active={location.pathname === "/typography"}
            >
              Typography
            </DropdownItem>
          </Dropdown>
        </div>
        <div className="">
          <div className="p-2.5 text-[0.75rem] font-medium text-[#7b7b7b]/70">
            My scenes
          </div>
          <NavLink
            title="My Scenes"
            iconPath="M8.69 2.07c.736-.414 1.634-.414 2.37 0L16.268 5c.761.428 1.232 1.233 1.232 2.106v5.785c0 .873-.471 1.678-1.232 2.106l-5.208 2.93c-.736.414-1.634.414-2.37 0l-5.208-2.93c-.761-.428-1.232-1.233-1.232-2.106V7.106c0-.873.471-1.678 1.232-2.106L8.69 2.07zM3.75 7.413v5.478c0 .331.179.637.467.799l4.908 2.76v-6.013L3.75 7.413zm12.25 0l-5.375 3.024v6.013l4.908-2.76c.253-.142.421-.394.459-.676l.008-.123V7.413zm-5.676-4.035c-.279-.157-.62-.157-.899 0L4.53 6.131l5.345 3.007 5.344-3.007-4.895-2.753z"
          />
          <Folders />
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
