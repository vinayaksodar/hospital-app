import { createInsertSchema, createSelectSchema } from "drizzle-zod";
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

// Authenticators
export const insertAuthenticatorSchema = createInsertSchema(authenticators);
export const selectAuthenticatorSchema = createSelectSchema(authenticators);

// Doctors
export const insertDoctorSchema = createInsertSchema(doctors);
export const selectDoctorSchema = createSelectSchema(doctors);

// Schedules
export const insertScheduleSchema = createInsertSchema(schedules);
export const selectScheduleSchema = createSelectSchema(schedules);

// Availabilities
export const insertAvailabilitySchema = createInsertSchema(availabilities);
export const selectAvailabilitySchema = createSelectSchema(availabilities);

// Consultations
export const insertConsultationSchema = createInsertSchema(consultations);
export const selectConsultationSchema = createSelectSchema(consultations);

// Bookings
export const insertBookingSchema = createInsertSchema(booking);
export const selectBookingSchema = createSelectSchema(booking);
