import { useState } from "react";
import {
  Menu as MenuHeadless,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import Icon from "#components/Icon";
import Modal from "#components/Modal";
import Folders from "#components/LeftSidebar/Head/Menu/Folders";
import DeleteFile from "#components/LeftSidebar/Head/Menu/DeleteFile";

function Menu() {
  const [openModalFolders, setOpenModalFolders] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);

  const items = [
    {
      title: "Export...",
      keyName: "⇧⌘E",
      onClick: () => {},
    },
    {
      title: "Create new scene...",
      keyName: "⌘N",
      onClick: () => {},
    },
    {
      title: "Duplicate",
      keyName: "⌘D",
      onClick: () => {},
    },
    {
      title: "Rename",
      onClick: () => {},
    },
    {
      title: "Move to folder...",
      onClick: () => setOpenModalFolders(true),
    },
    {
      title: "Delete",
      onClick: () => setOpenModalDelete(true),
    },
  ];
  return (
    <>
      <MenuHeadless>
        <MenuButton className="group flex items-center gap-2.5 text-title-str outline-0">
          Brainwave 2.0
          <div className="flex justify-center items-center size-6 rounded-md transition-colors group-hover:bg-shade-07/5 group-[[data-open]]:bg-shade-07/5">
            <Icon
              className="!size-4 transition-transform group-[[data-open]]:rotate-180"
              name="chevron"
            />
          </div>
        </MenuButton>
        <MenuItems
          className="z-30 w-51 p-2 rounded-[1.25rem] bg-surface-01 border border-s-01 outline-none shadow-popover [--anchor-gap:0.75rem] origin-top transition duration-200 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
          anchor="right start"
          transition
          modal={false}
        >
          {items.map((item, index) => (
            <MenuItem
              className="flex justify-between items-center gap-2.5 h-9 w-full px-2 rounded-xl text-body-sm transition-colors hover:bg-surface-03 nth-3:relative nth-3:mb-4 nth-3:after:absolute nth-3:after:top-[calc(100%+0.5rem)] nth-3:after:-left-2 nth-3:after:-right-2 nth-3:after:h-0.25 nth-3:after:bg-s-01 nth-3:after:pointer-events-none"
              key={index}
              as="button"
              onClick={item.onClick}
            >
              {item.title}
              {item.keyName && <div className="key">{item.keyName}</div>}
            </MenuItem>
          ))}
        </MenuItems>
      </MenuHeadless>
      <Modal
        classWrapper="max-w-69 rounded-[1.25rem] p-2"
        open={openModalFolders}
        onClose={() => setOpenModalFolders(false)}
        hideCloseButton
      >
        <Folders
          open={openModalFolders}
          onClose={() => setOpenModalFolders(false)}
        />
      </Modal>
      <Modal
        classWrapper="max-w-89"
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        hideCloseButton
      >
        <DeleteFile
          open={openModalDelete}
          onClose={() => setOpenModalDelete(false)}
        />
      </Modal>
    </>
  );
}

export default Menu;
