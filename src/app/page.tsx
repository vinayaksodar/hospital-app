import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, HeartPulse, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <div className="inline-block p-3 rounded-full mb-4">
              <HeartPulse className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Advanced Healthcare <br /> For Everyone
            </h1>
            <p className="font-light max-w-2xl text-lg md:text-xl">
              Experience world-class medical care with cutting-edge technology
              and compassionate professionals dedicated to your well-being.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button variant={"outline"}>Book Appointment</Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection></FeaturesSection>

        {/* CTA Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <Card className="p-6 md:p-8">
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Text Section */}
              <div>
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  Ready to experience better healthcare?
                </CardTitle>
                <CardDescription className="max-w-2xl font-light">
                  Schedule an appointment with one of our specialists and take
                  the first step towards better health.
                </CardDescription>
              </div>

              {/* Button */}
              <Link href="/doctors">
                <Button className="px-8 py-6 text-base flex items-center gap-2">
                  Find a Doctor
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map(({ Icon, title, description }, index) => (
          <Card
            key={index}
            className="p-6 flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full mb-4 border">
              <Icon className="w-6 h-6" />
            </div>
            <CardHeader className="p-0">
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 font-thin">{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

const features = [
  {
    Icon: Users,
    title: "Expert Specialists",
    description:
      "Our team of renowned doctors provides exceptional care across all medical specialties.",
  },
  {
    Icon: Clock,
    title: "24/7 Emergency Care",
    description:
      "Round-the-clock emergency services with rapid response teams ready to provide immediate care.",
  },
  {
    Icon: Shield,
    title: "Advanced Technology",
    description:
      "State-of-the-art diagnostic and treatment equipment for precise and effective healthcare.",
  },
];
