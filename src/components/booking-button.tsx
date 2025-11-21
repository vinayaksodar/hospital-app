"use client";

import { Button } from "@/components/ui/button";
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

export function BookingButton({ doctor }: { doctor: Doctor }) {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [doctorServices, setDoctorServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<string | null>(null);

  useEffect(() => {
    if (isBookingDialogOpen) {
      const fetchServices = async () => {
        const res = await fetch(
          `/api/doctors/${doctor.user.doctorProfiles[0].id}/services`
        );
        if (res.ok) {
          const data = await res.json();
          setDoctorServices(data);
        }
      };
      fetchServices();
    }
  }, [isBookingDialogOpen, doctor]);

  useEffect(() => {
    if (selectedService && selectedDate && isBookingDialogOpen) {
      const fetchAvailability = async () => {
        const date = new Date(
          selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];
        const res = await fetch(
          `/api/doctors/${doctor.user.doctorProfiles[0].id}/available-slots?serviceId=${selectedService.id}&date=${date}`
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
  }, [selectedService, selectedDate, doctor, isBookingDialogOpen]);

  const openBookingDialog = () => {
    setIsBookingDialogOpen(true);
    setSelectedService(null);
    setSelectedDate(new Date());
    setAvailableSlots([]);
    setSelectedTimeslot(null);
  };

  const handleBooking = async () => {
    if (!selectedService || !selectedTimeslot || !selectedDate) {
      alert("Please select a service, date, and timeslot.");
      return;
    }

    const patientId = "719956b3-2bab-48cf-a6f0-55ec77f20c73";
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
      doctorId: doctor.user.doctorProfiles[0].id,
      hospitalId: doctor.hospitalId,
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
    <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" onClick={openBookingDialog}>
          Book Appointment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Appointment with {doctor.user.name}</DialogTitle>
          <DialogDescription>
            Select a service and an available time slot.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Select Service</h3>
            <Select
              onValueChange={(value) =>
                setSelectedService(
                  doctorServices.find((s) => s.id === parseInt(value)) || null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {doctorServices.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name} - {service.consultationFee}{" "}
                    {service.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <div>
              <h3 className="text-lg font-medium mb-2">Select Date</h3>
              <DatePicker selected={selectedDate} onSelect={setSelectedDate} />
            </div>
          )}

          {selectedDate && availableSlots.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Select Time Slot</h3>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTimeslot === slot ? "default" : "outline"}
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
  );
}
