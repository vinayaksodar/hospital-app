import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
  doctors,
  schedules,
  availabilities,
  bookings,
} from "../db/schema";

// Users
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

// Accounts
export const insertAccountSchema = createInsertSchema(accounts);
export const selectAccountSchema = createSelectSchema(accounts);

// Sessions
export const insertSessionSchema = createInsertSchema(sessions);
export const selectSessionSchema = createSelectSchema(sessions);

// Verification Tokens
export const insertVerificationTokenSchema =
  createInsertSchema(verificationTokens);
export const selectVerificationTokenSchema =
  createSelectSchema(verificationTokens);

// Doctors
export const insertDoctorSchema = createInsertSchema(doctors);
export const selectDoctorSchema = createSelectSchema(doctors);

// Schedules
export const insertScheduleSchema = createInsertSchema(schedules);
export const selectScheduleSchema = createSelectSchema(schedules);

// Availabilities
export const insertAvailabilitySchema = createInsertSchema(availabilities);
export const selectAvailabilitySchema = createSelectSchema(availabilities);

// Bookings
export const insertBookingSchema = createInsertSchema(bookings);
export const selectBookingSchema = createSelectSchema(bookings);