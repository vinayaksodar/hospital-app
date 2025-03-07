"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HeartPulse, Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <HeartPulse className="h-6 w-6 text-white mr-2" />
              <span className="text-xl font-bold text-white">
                Gadad Hospital
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Home
            </Link>
            <Link
              href="/doctors"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Doctors
            </Link>
            <Link
              href="/services"
              className="text-zinc-400 hover:text-white transition-colors"
            >
              Services
            </Link>
            <Button>Login</Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden max-w-0.5 mx-auto bg-zin border-b border-zinc-800">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/"
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/doctors"
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Doctors
            </Link>
            <Link
              href="/services"
              className="block text-zinc-400 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Button className="" onClick={() => setIsMenuOpen(false)}>
              Login
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
