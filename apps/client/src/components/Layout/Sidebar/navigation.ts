// Base navigation items
const baseNavigation = [
  {
    title: "Explore",
    icon: "explore",
    href: "/explore",
    list: [
      {
        title: "Designs",
        href: "/explore/designs",
      },
      {
        title: "Animations",
        href: "/explore/animations",
      },
    ],
  },
  {
    title: "Assets",
    icon: "assets",
    counter: 112,
    list: [
      {
        title: "3D Objects",
        href: "/assets/3d-objects",
      },
      {
        title: "Materials",
        href: "/assets/materials",
      },
    ],
  },
  {
    title: "Likes",
    icon: "heart",
    href: "/likes",
  },
];

// Add debug item only in development
export const navigation = import.meta.env.DEV
  ? [
      ...baseNavigation,
      {
        title: "Debug",
        icon: "bug",
        href: "/debug",
      },
    ]
  : baseNavigation;

export const folders = [
  {
    title: "Untitled Folder",
    href: "/folders/untitled",
    color: "#E36323",
  },
  {
    title: "3D Icons",
    href: "/folders/3d-icons",
    color: "#49BA61",
  },
];
