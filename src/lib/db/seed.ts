import { db } from "./drizzle"; // Assuming you have a DB instance setup
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  authenticators,
  doctors,
  schedules,
  availabilities,
  consultations,
  booking,
} from "./schema";

async function main() {
  // Sample user IDs
  const userId1 = crypto.randomUUID();
  const userId2 = crypto.randomUUID();
  const userId3 = crypto.randomUUID();

  await db.insert(users).values([
    {
      id: userId1,
      phone: "9876543210",
      name: "Dr. John Doe",
      email: "john.doe@example.com",
      role: "doctor",
      hospitalId: 1,
    },
    {
      id: userId2,
      phone: "1234567890",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      role: "patient",
      hospitalId: 1,
    },
    {
      id: userId3,
      phone: "1112223333",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
      hospitalId: 1,
    },
  ]);

  await db.insert(accounts).values([
    {
      userId: userId1,
      type: "oauth",
      provider: "google",
      providerAccountId: "google-1234",
    },
    {
      userId: userId2,
      type: "credentials",
      provider: "email",
      providerAccountId: "jane.smith@example.com",
    },
  ]);

  await db.insert(sessions).values([
    {
      sessionToken: "session-123",
      userId: userId1,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  ]);

  await db.insert(verificationTokens).values([
    {
      identifier: "jane.smith@example.com",
      token: "verification-123",
      expires: new Date(Date.now() + 1000 * 60 * 10),
    },
  ]);

  await db.insert(authenticators).values([
    {
      credentialID: "cred-123",
      userId: userId1,
      providerAccountId: "google-1234",
      credentialPublicKey: "publicKey1",
      counter: 0,
      credentialDeviceType: "mobile",
      credentialBackedUp: true,
    },
  ]);

  // Doctor entry
  const doctorId1 = await db
    .insert(doctors)
    .values({
      userId: userId1,
      speciality: "ophthalmology",
      aboutDetails: "Expert eye specialist",
      image: "doctor1.jpg",
    })
    .returning({ id: doctors.id });

  const scheduleId1 = await db
    .insert(schedules)
    .values({
      name: "Morning Shift",
      timezone: "UTC+5:30",
      doctorId: doctorId1[0].id,
    })
    .returning({ id: schedules.id });

  await db.insert(availabilities).values([
    {
      scheduleId: scheduleId1[0].id,
      days: [1, 3, 5],
      startTime: "09:00",
      endTime: "12:00",
    },
  ]);

  const consultationId1 = await db
    .insert(consultations)
    .values({ scheduleId: scheduleId1[0].id, duration: 30 })
    .returning({ id: consultations.id });

  await db.insert(booking).values([
    {
      consultationId: consultationId1[0].id,
      doctorId: doctorId1[0].id,
      inviteeEmail: "jane.smith@example.com",
      startDateUTC: new Date(),
      endDateUTC: new Date(Date.now() + 30 * 60 * 1000),
      cancelCode: "cancel-123",
    },
  ]);

  console.log("Seed data inserted!");
}

main();
