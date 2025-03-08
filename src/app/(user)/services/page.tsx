import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  Brain,
  AmbulanceIcon as FirstAid,
  Heart,
  Microscope,
  Stethoscope,
  Syringe,
} from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: 1,
    name: "Cardiology",
    description:
      "Comprehensive heart care including diagnostics, treatment, and preventive services for all cardiac conditions.",
    icon: Heart,
  },
  {
    id: 2,
    name: "Neurology",
    description:
      "Advanced diagnosis and treatment of disorders of the nervous system, including the brain, spinal cord, and nerves.",
    icon: Brain,
  },
  {
    id: 3,
    name: "Pediatrics",
    description:
      "Specialized healthcare for infants, children, and adolescents, focusing on growth, development, and disease prevention.",
    icon: FirstAid,
  },
  {
    id: 4,
    name: "Diagnostics",
    description:
      "State-of-the-art imaging and laboratory services for accurate diagnosis and monitoring of medical conditions.",
    icon: Microscope,
  },
  {
    id: 5,
    name: "Emergency Care",
    description:
      "24/7 emergency services with rapid response teams ready to provide immediate care for critical conditions.",
    icon: Stethoscope,
  },
  {
    id: 6,
    name: "Vaccination",
    description:
      "Comprehensive immunization services for all age groups to prevent infectious diseases and promote public health.",
    icon: Syringe,
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <main className="py-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer a comprehensive range of medical services with cutting-edge
            technology and expert care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(({ id, name, description, icon: Icon }) => (
            <Card key={id} className="overflow-hidden">
              <CardHeader>
                <div className="p-3 rounded-full w-fit mb-4 bg-muted">
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="p-0 flex items-center gap-2">
                  Learn more <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">
              Need specialized care?
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-muted-foreground max-w-2xl">
              Our team of specialists is ready to provide personalized treatment
              plans for your specific health needs.
            </p>
            <Link href="/doctors" className="shrink-0">
              <Button className="px-8 py-6 text-base flex items-center gap-2">
                Find a Doctor
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
