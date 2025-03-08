import { MainNavItem, SidebarNavItem } from "@/types/nav";

export interface NavConfig {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
}

export const navConfig: NavConfig = {
  mainNav: [
    {
      title: "Doctors",
      href: "/doctors",
    },
    {
      title: "Services",
      href: "/services",
    },
  ],
  sidebarNav: [
    // {
    //   title: "Getting Started",
    //   items: [
    //     {
    //       title: "Introduction",
    //       href: "/docs",
    //       items: [],
    //     },
    //     {
    //       title: "Installation",
    //       href: "/docs/installation",
    //       items: [],
    //     },
    //     {
    //       title: "components.json",
    //       href: "/docs/components-json",
    //       items: [],
    //     },
    //     {
    //       title: "Theming",
    //       href: "/docs/theming",
    //       items: [],
    //     },
    //     {
    //       title: "Dark mode",
    //       href: "/docs/dark-mode",
    //       items: [],
    //     },
    //     {
    //       title: "CLI",
    //       href: "/docs/cli",
    //       items: [],
    //     },
    //     {
    //       title: "Monorepo",
    //       href: "/docs/monorepo",
    //       items: [],
    //     },
    //     {
    //       title: "Tailwind v4",
    //       href: "/docs/tailwind-v4",
    //       items: [],
    //       label: "New",
    //     },
    //     {
    //       title: "Next.js 15 + React 19",
    //       href: "/docs/react-19",
    //       items: [],
    //     },
    //     {
    //       title: "Typography",
    //       href: "/docs/components/typography",
    //       items: [],
    //     },
    //     {
    //       title: "Open in v0",
    //       href: "/docs/v0",
    //       items: [],
    //     },
    //     {
    //       title: "Blocks",
    //       href: "/docs/blocks",
    //       items: [],
    //     },
    //     {
    //       title: "Figma",
    //       href: "/docs/figma",
    //       items: [],
    //     },
    //     {
    //       title: "Changelog",
    //       href: "/docs/changelog",
    //       items: [],
    //     },
    //   ],
    // },
  ],
};
