import Icon from "#components/Icon";
import Share from "#Share";

const socials = [
  {
    icon: "threads",
    href: "https://www.threads.net/@ui8net",
  },
  {
    icon: "twitter",
    href: "https://x.com/ui8",
  },
  {
    icon: "instagram",
    href: "https://www.instagram.com/ui8net/",
  },
];

type Props = {
  gallery: {
    id: number;
    title: string;
    image: string;
  }[];
};

function Contacts({ gallery }: Props) {
  return (
    <div className="flex gap-2 pt-2.5 max-md:mt-2 max-md:pl-24">
      <div className="flex gap-2">
        {socials.map((social, index) => (
          <a
            className="social"
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon className="fill-primary" name={social.icon} />
          </a>
        ))}
      </div>
      <Share images={gallery.slice(0, 3)} />
    </div>
  );
}

export default Contacts;
