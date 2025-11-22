
"use client"

import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { EventSourceInput } from "@fullcalendar/core/index.js"

type Booking = {
  booking: {
    id: number;
    encounterId: number;
    startDateUTC: string;
    endDateUTC: string;
    status: string;
  };
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
    speciality: string;
    user: {
      name: string;
      email: string;
    };
  };
  patient: {
    name: string;
    email: string;
  };
};

export function Calendar() {
  const fetchEvents = async (info: any, successCallback: any, failureCallback: any) => {
    try {
      const res = await fetch(
        `/api/calendar/appointments?start=${info.startStr}&end=${info.endStr}`
      );
      if (res.ok) {
        const data = await res.json();
        const bookings: Booking[] = data;
        const formattedEvents = bookings.map((booking) => ({
          id: booking.booking.id.toString(),
          title: `${booking.service.name} - Dr. ${booking.doctor.user.name} with ${booking.patient.name}`,
          start: booking.booking.startDateUTC,
          end: booking.booking.endDateUTC,
        }));
        successCallback(formattedEvents);
      } else {
        failureCallback(new Error("Failed to fetch bookings"));
      }
    } catch (error) {
      failureCallback(error);
    }
  };

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
        events={fetchEvents as EventSourceInput}
      />
    </div>
  )
}
