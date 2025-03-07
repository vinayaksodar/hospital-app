import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, HeartPulse, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-block p-3 bg-zinc-900 rounded-full mb-4">
              <HeartPulse className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Advanced Healthcare <br /> For Everyone
            </h1>
            <p className="text-zinc-400 max-w-2xl text-lg md:text-xl">
              Experience world-class medical care with cutting-edge technology
              and compassionate professionals dedicated to your well-being.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant={"outline"}>Book Appointment</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-zinc-900 p-3 rounded-full mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Specialists</h3>
              <p className="text-zinc-400">
                Our team of renowned doctors provides exceptional care across
                all medical specialties.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-zinc-900 p-3 rounded-full mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                24/7 Emergency Care
              </h3>
              <p className="text-zinc-400">
                Round-the-clock emergency services with rapid response teams
                ready to provide immediate care.
              </p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 flex flex-col items-center text-center">
              <div className="bg-zinc-900 p-3 rounded-full mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Advanced Technology
              </h3>
              <p className="text-zinc-400">
                State-of-the-art diagnostic and treatment equipment for precise
                and effective healthcare.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Ready to experience better healthcare?
                </h2>
                <p className="text-zinc-400 max-w-2xl">
                  Schedule an appointment with one of our specialists and take
                  the first step towards better health.
                </p>
              </div>
              <Link href="/doctors" className="shrink-0">
                <Button className="bg-white text-black hover:bg-zinc-200 px-8 py-6 text-base flex items-center gap-2">
                  Find a Doctor
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
