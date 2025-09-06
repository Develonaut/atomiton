import Invite from "@/components/Invite";
import Button from "@/components/Button";
import GeneralAccess from "./GeneralAccess";
import Person from "./Person";
import Foot from "./Foot";

import { people } from "./people";

function ShareFile() {
  return (
    <div className="w-105 rounded-[2rem] border border-[#ECECEC] bg-[#FCFCFC] shadow-2xl">
      <div className="flex gap-1.5 p-4">
        <Invite className="grow" />
        <Button isSecondary>Invite</Button>
      </div>
      <GeneralAccess />
      <div className="py-2.5 border-t border-[#ECECEC]">
        <div className="px-4 py-2 text-[0.6875rem] leading-[1rem] font-medium text-[#7B7B7B]/70">
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
    </div>
  );
}

export default ShareFile;
