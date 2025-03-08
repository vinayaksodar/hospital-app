"use client";

import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { navConfig } from "@/config/nav";

export function MainNav() {
  return (
    <nav className="flex items-center gap-4  xl:gap-6">
      {navConfig.mainNav?.map(
        (item) =>
          item.href && (
            <MainNavLink key={item.href} href={item.href}>
              {item.title}
            </MainNavLink>
          )
      )}
    </nav>
  );
}

interface MainNavLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
}

function MainNavLink({
  href,
  className,
  children,
  ...props
}: MainNavLinkProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      className={cn(
        "transition-colors hover:text-foreground/80",
        pathname?.startsWith(href.toString())
          ? "text-foreground"
          : "text-foreground/80",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
