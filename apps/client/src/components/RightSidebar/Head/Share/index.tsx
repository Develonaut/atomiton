import Button from "#components/Button";
import Modal from "#components/Modal";
import Foot from "#Foot";
import GeneralAccess from "#GeneralAccess";
import Head from "#Head";
import Person from "#Person";
import { useState } from "react";

import { people } from "#people";

function Share() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button isPrimary onClick={() => setOpen(true)}>
        Share
      </Button>
      <Modal
        classWrapper="max-w-105 rounded-[1.75rem]"
        open={open}
        onClose={() => setOpen(false)}
        hideCloseButton
      >
        <Head />
        <GeneralAccess />
        <div className="py-2.5 border-t border-s-01">
          <div className="px-4 py-2 text-body-sm text-secondary/70">
            People with access
          </div>
          <div className="">
            {people.map((person) => (
              <Person
                name={person.name}
                email={person.email}
                avatar={person.avatar}
                accessPerson={person.accessPerson}
                key={person.id}
                isRemoveButton
              />
            ))}
            <Person
              name="Hellen"
              email="helen@ui8.net"
              avatar="/images/avatars/1.png"
              accessPerson="owner"
            />
          </div>
        </div>
        <Foot />
      </Modal>
    </>
  );
}

export default Share;
