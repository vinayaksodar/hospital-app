import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { db } from "@/lib/db/drizzle";
import { memberships } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Eye, Users, Baby } from "lucide-react";
import Image from "next/image";
import { BookingButton } from "@/components/booking-button";

export default async function HomePage() {
  const doctors = await db.query.memberships.findMany({
    where: eq(memberships.role, "doctor"),
    with: {
      user: {
        with: {
          doctorProfiles: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Gadad Hospital Eye & Child Care
            </h1>
            <p className="font-light max-w-3xl text-lg md:text-xl">
              Welcome to Gadad Hospital, a family-run center where we provide
              the safest and best eye surgery & treatment, alongside dedicated
              pediatric care in Ranebennur. Our experienced team and advanced
              technology ensure you and your loved ones receive the highest
              quality care.
            </p>
          </div>
        </section>

        {/* Doctors Section */}
        <DoctorsSection doctors={doctors} />

        {/* Services Section */}
        <ServicesSection />
      </main>
    </div>
  );
}

function DoctorsSection({ doctors }: { doctors: any[] }) {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-center gap-15">
        {doctors.map((doctor) => (
          <Card
            key={doctor.user.id}
            className="overflow-hidden w-full max-w-sm"
          >
            <div className="h-72 relative">
              <Image
                src={
                  doctor.user.image
                    ? doctor.user.image.replace("/public", "")
                    : "/placeholder.svg"
                }
                alt={`Photo of ${doctor.user.name}`}
                className="object-cover w-full h-full"
                fill
              />
            </div>

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-center md:text-left">
                    {doctor.user.name}
                  </CardTitle>
                  <p className="text-muted-foreground text-center md:text-left">
                    {doctor.user.doctorProfiles[0]?.speciality}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 pb-4">
              <p className="text-center md:text-left">
                {doctor.user.doctorProfiles[0]?.aboutDetails}
              </p>
            </CardContent>

            <CardFooter className="justify-center md:justify-end">
              <BookingButton doctor={doctor} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
}

export function ServicesSection() {
  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Our Services
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map(({ title, description, Icon }, index) => (
          <Card
            key={index}
            className="p-6 flex flex-col items-center text-center"
          >
            <div className="p-3 rounded-full mb-4 border">
              <Icon className="w-6 h-6" />
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-thin">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

const services = [
  {
    title: "Lasik Eye Surgery",
    description:
      "Safest and best Lasik Eye Surgery & Treatment. We offer blade-free LASIK using the Femto second (FS) laser for better than 20/20 vision.",
    Icon: Eye,
  },
  {
    title: "Cataract Surgery",
    description:
      "Conventional phacoemulsification and advanced cataract surgery with over 1250 surgeries performed. We handle complex cases including Glaucoma and Retinal problems",
    Icon: Eye,
  },
  {
    title: "Pediatric Care",
    description:
      "Comprehensive pediatric consultations and care for children. Please note, we do not offer pediatric surgeries.",
    Icon: Baby,
  },
  {
    title: "Keratoconus Treatment",
    description:
      "All available treatment modalities for keratoconus such as Rose K contact lenses, collagen cross linking, INTACS, ICL and FEK for scarred keratoconus eyes.",
    Icon: Eye,
  },
  {
    title: "Dry Eye & Computer Vision Syndrome Clinic",
    description:
      "A dedicated clinic for Dry Eyes and Computer Vision Syndrome, addressing issues like difficulty focusing, eyestrain, headaches, and dry eyes.",
    Icon: Eye,
  },
  {
    title: "General Eye Check-up",
    description:
      "Routine eye examinations for all ages to ensure optimal eye health and early detection of any issues.",
    Icon: Users,
  },
];
