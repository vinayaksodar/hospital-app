import Footer from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Calendar, Clock, Star } from "lucide-react";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    experience: "15 years",
    availability: "Mon, Wed, Fri",
    timing: "9:00 AM - 5:00 PM",
    rating: 4.9,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Neurology",
    experience: "12 years",
    availability: "Tue, Thu, Sat",
    timing: "10:00 AM - 6:00 PM",
    rating: 4.8,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    experience: "10 years",
    availability: "Mon, Tue, Thu",
    timing: "8:00 AM - 4:00 PM",
    rating: 4.9,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    experience: "18 years",
    availability: "Wed, Fri, Sat",
    timing: "9:00 AM - 5:00 PM",
    rating: 4.7,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 5,
    name: "Dr. Aisha Patel",
    specialty: "Dermatology",
    experience: "8 years",
    availability: "Mon, Wed, Fri",
    timing: "10:00 AM - 6:00 PM",
    rating: 4.8,
    image: "/placeholder.svg?height=400&width=400",
  },
  {
    id: 6,
    name: "Dr. Robert Kim",
    specialty: "Oncology",
    experience: "20 years",
    availability: "Tue, Thu, Sat",
    timing: "9:00 AM - 5:00 PM",
    rating: 4.9,
    image: "/placeholder.svg?height=400&width=400",
  },
];

export default function DoctorsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="py-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Our Specialists
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Meet our team of experienced doctors dedicated to providing
            exceptional care across all medical specialties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card
              key={doctor.id}
              className="bg-zinc-950 border-zinc-800 overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={doctor.image || "/placeholder.svg"}
                  alt={doctor.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{doctor.name}</h3>
                    <p className="text-zinc-400">{doctor.specialty}</p>
                  </div>
                  <div className="flex items-center bg-zinc-900 px-2 py-1 rounded text-sm">
                    <Star
                      className="w-4 h-4 text-yellow-500 mr-1"
                      fill="currentColor"
                    />
                    {doctor.rating}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="flex items-center text-zinc-400">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{doctor.experience} experience</span>
                </div>
                <div className="flex items-center text-zinc-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <div>{doctor.availability}</div>
                    <div>{doctor.timing}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-white text-black hover:bg-zinc-200">
                  Book Appointment
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
