"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { DatePicker } from "@/components/date-picker";

type Doctor = {
  userId: string;
  hospitalId: number;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    doctorProfiles: {
      id: number;
      speciality: string;
      aboutDetails: string;
    }[];
  };
};

type Service = {
  id: number;
  name: string;
  duration: number;
  consultationFee: number;
  currency: string;
  doctorId: number;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedDoctorForBooking, setSelectedDoctorForBooking] =
    useState<Doctor | null>(null);
  const [doctorServices, setDoctorServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      const res = await fetch("/api/doctors");
      if (res.ok) {
        const data = await res.json();
        setDoctors(data);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorForBooking) {
      const fetchServices = async () => {
        const res = await fetch(
          `/api/doctors/${selectedDoctorForBooking.user.doctorProfiles[0].id}/services`
        );
        if (res.ok) {
          const data = await res.json();
          setDoctorServices(data);
        }
      };
      fetchServices();
    }
  }, [selectedDoctorForBooking]);

  useEffect(() => {
    if (selectedService && selectedDate && selectedDoctorForBooking) {
      const fetchAvailability = async () => {
        const date = new Date(
          selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];
        const res = await fetch(
          `/api/doctors/${selectedDoctorForBooking.user.doctorProfiles[0].id}/available-slots?serviceId=${selectedService.id}&date=${date}`
        );
        if (res.ok) {
          const data = await res.json();
          const formattedSlots = data.map((slot: string) => {
            const date = new Date(slot);
            return `${date.getHours().toString().padStart(2, "0")}:${date
              .getMinutes()
              .toString()
              .padStart(2, "0")}`;
          });
          setAvailableSlots(formattedSlots);
        }
      };
      fetchAvailability();
    }
  }, [selectedService, selectedDate, selectedDoctorForBooking]);

  const openBookingDialog = (doctor: Doctor) => {
    setSelectedDoctorForBooking(doctor);
    setIsBookingDialogOpen(true);
    setSelectedService(null);
    setSelectedDate(new Date());
    setAvailableSlots([]);
    setSelectedTimeslot(null);
  };

  const handleBooking = async () => {
    if (
      !selectedDoctorForBooking ||
      !selectedService ||
      !selectedTimeslot ||
      !selectedDate
    ) {
      alert("Please select a doctor, service, date, and timeslot.");
      return;
    }

    // For now, we'll use a placeholder patient ID and encounter type
    const patientId = "clx000000000000000000000"; // Replace with actual patient ID from auth context
    const encounterType = "online_booking";

    const [hours, minutes] = selectedTimeslot.split(":").map(Number);
    const bookingDate = new Date(selectedDate);
    bookingDate.setHours(hours, minutes);

    const startDateUTC = bookingDate.toISOString();
    const endDateUTC = new Date(
      bookingDate.getTime() + selectedService.duration * 60000
    ).toISOString();

    const bookingData = {
      serviceId: selectedService.id,
      startDateUTC,
      endDateUTC,
      status: "pending",
      patientId: patientId,
      doctorId: selectedDoctorForBooking.user.doctorProfiles[0].id,
      hospitalId: selectedDoctorForBooking.hospitalId,
      type: encounterType,
    };

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });

    if (res.ok) {
      alert("Appointment booked successfully!");
      setIsBookingDialogOpen(false);
    } else {
      alert("Failed to book appointment.");
    }
  };

  return (
    <div className="min-h-screen">
      <main className="py-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Our Specialists
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Meet our team of experienced doctors dedicated to providing
            exceptional care across all medical specialties.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.user.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img
                  src="/placeholder.svg?height=400&width=400"
                  alt={doctor.user.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {doctor.user.name}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {doctor.user.doctorProfiles[0]?.speciality}
                    </p>
                  </div>
                  <div className="flex items-center bg-muted px-2 py-1 rounded text-sm">
                    <Star
                      className="w-4 h-4 text-yellow-500 mr-1"
                      fill="currentColor"
                    />
                    {/* Assuming a rating is available or calculate it */}
                    4.9
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-4">
                <div className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>
                    {/* Experience data not available from API yet */}
                  </span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  <div>
                    <div>
                      {/* Availability data not available from API yet */}
                    </div>
                    <div>{/* Timing data not available from API yet */}</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog
                  open={isBookingDialogOpen}
                  onOpenChange={setIsBookingDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => openBookingDialog(doctor)}
                    >
                      Book Appointment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Book Appointment with{" "}
                        {selectedDoctorForBooking?.user.name}
                      </DialogTitle>
                      <DialogDescription>
                        Select a service and an available time slot.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Select Service
                        </h3>
                        <Select
                          onValueChange={(value) =>
                            setSelectedService(
                              doctorServices.find(
                                (s) => s.id === parseInt(value)
                              ) || null
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service" />
                          </SelectTrigger>
                          <SelectContent>
                            {doctorServices.map((service) => (
                              <SelectItem
                                key={service.id}
                                value={service.id.toString()}
                              >
                                {service.name} - {service.consultationFee}{" "}
                                {service.currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedService && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Select Date
                          </h3>
                          <DatePicker
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                          />
                        </div>
                      )}

                      {selectedDate && availableSlots.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Select Time Slot
                          </h3>
                          <div className="grid grid-cols-4 gap-2">
                            {availableSlots.map((slot) => (
                              <Button
                                key={slot}
                                variant={
                                  selectedTimeslot === slot
                                    ? "default"
                                    : "outline"
                                }
                                onClick={() => setSelectedTimeslot(slot)}
                              >
                                {slot}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsBookingDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleBooking}>Confirm Booking</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
