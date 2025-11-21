import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icons } from "./icons";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
  return (
    <header className="border-grid sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper">
        <div className="flex h-14 items-center justify-between gap-2 md:gap-4">
          <div className="mr-4 items-center flex">
            <div className="flex md:hidden">
              <MobileNav />
            </div>
            <Link href="/">
              <span className=" font-bold text-xl  md:ml-6 md:mr-6">
                {siteConfig.name}
              </span>
            </Link>
            <div className="hidden md:flex">
              <MainNav />
            </div>
          </div>
          <div className="md:mr-3">
            <div className="w-full flex-1 md:flex md:w-auto "></div>
            <nav className="flex items-center gap-0.5 md:gap-2">
              <Button>Login</Button>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
