import { HeartPulse } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <HeartPulse className="w-6 h-6 mr-2" />
            <span className="text-xl font-bold">Gadad Hospital</span>
          </div>
          <div className="text-zinc-400 text-sm">
            © {new Date().getFullYear() + " "}
            Gadad Hospital. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
