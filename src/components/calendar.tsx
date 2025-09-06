
"use client"

import { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"

type Booking = {
  id: number;
  encounterId: number;
  startDateUTC: string;
  endDateUTC: string;
  status: string;
  service: {
    id: number;
    doctorId: number;
    name: string;
    duration: number;
    consultationFee: number;
    currency: string;
  };
  doctor: {
    id: number;
    hospitalId: number;
    speciality: string;
    aboutDetails: string;
    user: {
      id: string;
      name: string;
      email: string;
      emailVerified: null;
      image: null;
      phone: string;
    };
  };
};

export function Calendar() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    const fetchBookings = async () => {
      const res = await fetch("/api/bookings")
      if (res.ok) {
        const data = await res.json()
        const bookings: Booking[] = data.bookings
        const formattedEvents = bookings.map((booking) => ({
          id: booking.id.toString(),
          title: `${booking.service.name} - ${booking.doctor.user.name}`,
          start: booking.startDateUTC,
          end: booking.endDateUTC,
        }))
        setEvents(formattedEvents)
      }
    }

    fetchBookings()
  }, [])

  return (
    <div className="p-4">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
      />
    </div>
  )
}
