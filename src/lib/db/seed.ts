import { db } from "./drizzle";
import {
  users,
  hospitals,
  memberships,
  doctors,
  schedules,
  availabilities,
  services,
  encounters,
  bookings,
  patients
} from "./schema";

async function main() {
  // Create a hospital
  const [hospital] = await db
    .insert(hospitals)
    .values({ name: "General Hospital", slug: "general-hospital" })
    .returning();

  // Create a user for the doctor
  const [doctorUser] = await db
    .insert(users)
    .values({
      name: "Dr. John Doe",
      email: "john.doe@example.com",
      phone: "9876543210",
    })
    .returning();

  // Create a doctor profile
  const [doctor] = await db
    .insert(doctors)
    .values({
      userId: doctorUser.id,
      hospitalId: hospital.id,
      speciality: "cardiology",
      aboutDetails: "Expert cardiologist",
    })
    .returning();

  // Create a membership for the doctor
  await db.insert(memberships).values({
    userId: doctorUser.id,
    hospitalId: hospital.id,
    role: "doctor",
  });

  // Create a service for the doctor
  const [service] = await db
    .insert(services)
    .values({
      doctorId: doctor.id,
      name: "Consultation",
      duration: 30,
      consultationFee: 100,
      currency: "USD",
    })
    .returning();

  // Create a schedule for the doctor
  const [schedule] = await db
    .insert(schedules)
    .values({
      doctorId: doctor.id,
      name: "Morning Shift",
      timezone: "UTC",
    })
    .returning();

  // Create an availability for the schedule
  await db.insert(availabilities).values({
    scheduleId: schedule.id,
    days: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "12:00",
  });

  // Create a patient
  const [patientUser] = await db
    .insert(users)
    .values({
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "1234567890",
    })
    .returning();

  const [patient] = await db.insert(patients).values({
    userId: patientUser.id,
    hospitalId: hospital.id,
    dateOfBirth: new Date("1990-01-01")
  }).returning();

  // Create a membership for the patient
  await db.insert(memberships).values({
    userId: patientUser.id,
    hospitalId: hospital.id,
    role: "patient",
  });

  // Create an encounter
  const [encounter] = await db
    .insert(encounters)
    .values({
      patientId: patientUser.id,
      doctorId: doctor.id,
      hospitalId: hospital.id,
      type: "online_booking",
    })
    .returning();

  // Create a booking
  await db.insert(bookings).values({
    encounterId: encounter.id,
    serviceId: service.id,
    startDateUTC: new Date(),
    endDateUTC: new Date(Date.now() + 30 * 60 * 1000),
    status: "confirmed",
  });

  console.log("Seed data inserted!");
}

main();
