import { relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  pgEnum,
  serial,
  time,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import type { AdapterAccountType } from "next-auth/adapters";

// =================================================================================
// ENUMS
// =================================================================================

export const userRoleEnum = pgEnum("userRole", ["doctor", "patient", "admin"]);
export const specialityEnum = pgEnum("speciality", [
  "ophthalmology",
  "pediatrics",
  "cardiology",
  "dermatology",
  "etc",
]);
export const bookingStatusEnum = pgEnum("bookingStatus", [
  "pending",
  "confirmed",
  "completed",
  "cancelled_by_patient",
  "cancelled_by_doctor",
  "no_show",
]);
export const paymentStatusEnum = pgEnum("paymentStatus", [
  "pending",
  "succeeded",
  "failed",
]);
export const encounterTypeEnum = pgEnum("encounterType", [
  "online_booking",
  "walk_in",
  "teleconsultation",
  "follow_up",
  "historical_data_entry",
]);
export const currencyEnum = pgEnum("currency", ["USD", "EUR", "GBP", "INR"]);

// =================================================================================
// CORE TABLES (Identity & Tenancy)
// =================================================================================

/**
 * Hospitals Table: The root of the multi-tenant system.
 * Every major resource is associated with a hospital.
 */
export const hospitals = pgTable("hospitals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // For URL identification, e.g., 'apollo-hospital'
});

/**
 * Users Table: Stores universal identity information for an individual.
 * This table is context-agnostic and contains no roles or hospital affiliations.
 */
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  phone: text("phone"),
});

/**
 * Memberships Table: The crucial junction table linking users, hospitals, and roles.
 * This allows a single user to have different roles (or the same role) across multiple hospitals.
 */
export const memberships = pgTable(
  "memberships",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hospitalId: integer("hospitalId")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").notNull(),
  },
  (membership) => ({
    compoundPk: primaryKey({
      columns: [membership.userId, membership.hospitalId, membership.role],
    }),
  })
);

// =================================================================================
// NEXT-AUTH ADAPTER TABLES
// =================================================================================

export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// =================================================================================
// PROFILE & SCHEDULING TABLES
// =================================================================================

/**
 * Doctors Table: Stores doctor-specific professional details for a given hospital.
 */
export const doctors = pgTable(
  "doctors",
  {
    id: serial("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hospitalId: integer("hospitalId")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    speciality: specialityEnum("speciality").notNull(),
    aboutDetails: text("aboutDetails"),
  },
  (table) => ({
    // A user can only have one doctor profile per hospital.
    unq: uniqueIndex().on(table.userId, table.hospitalId),
  })
);

/**
 * Patients Table: Stores patient-specific profile information for a given hospital.
 */
export const patients = pgTable(
  "patients",
  {
    id: serial("id").primaryKey(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hospitalId: integer("hospitalId")
      .notNull()
      .references(() => hospitals.id, { onDelete: "cascade" }),
    dateOfBirth: timestamp("dateOfBirth", { mode: "date" }),
    createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // A user can only have one patient profile per hospital.
    unq: uniqueIndex().on(table.userId, table.hospitalId),
  })
);

/**
 * Schedules Table: A doctor's schedule template at a specific hospital.
 */
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
});

/**
 * Availabilities Table: The specific recurring time slots within a schedule.
 */
export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  days: integer("days").array(), // 0 = Sunday, 1 = Monday, etc.
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
});

// =================================================================================
// CLINICAL & BOOKING TABLES
// =================================================================================

/**
 * Encounters Table: The central record for ANY clinical interaction (walk-in, online booking, etc.).
 * This is the key to decoupling medical records from the scheduling system.
 */
export const encounters = pgTable("encounters", {
  id: serial("id").primaryKey(),
  patientId: text("patientId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  hospitalId: integer("hospitalId")
    .notNull()
    .references(() => hospitals.id, { onDelete: "cascade" }),
  encounterDateUTC: timestamp("encounterDateUTC", { withTimezone: true })
    .notNull()
    .defaultNow(),
  type: encounterTypeEnum("type").notNull(),
});

/**
 * Medical Records Table: Stores clinical notes for a specific encounter.
 * Doctors can create an encounter and add a record here without any booking.
 */
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  encounterId: integer("encounterId")
    .notNull()
    .references(() => encounters.id, { onDelete: "cascade" })
    .unique(),
  notes: text("notes"),
  prescription: text("prescription"), // Could be JSON or structured text
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

/**
 * Services Table: Defines the types of consultations a doctor offers.
 */
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // e.g., "Standard Consultation", "Follow-up"
  duration: integer("duration").notNull(), // Duration in minutes
  consultationFee: integer("consultationFee").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
});

/**
 * Bookings Table: A scheduled future encounter. This links a service to a time slot.
 */
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  encounterId: integer("encounterId")
    .notNull()
    .references(() => encounters.id, { onDelete: "cascade" })
    .unique(),
  serviceId: integer("serviceId")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  startDateUTC: timestamp("startDateUTC", { withTimezone: true }).notNull(),
  endDateUTC: timestamp("endDateUTC", { withTimezone: true }).notNull(),
  status: bookingStatusEnum("status").notNull().default("confirmed"),
});

/**
 * Payments Table: Tracks the financial transaction for an encounter.
 */
export const payments = pgTable("payments", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  encounterId: integer("encounterId")
    .notNull()
    .references(() => encounters.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentGatewayId: text("paymentGatewayId"), // Transaction ID from Stripe, etc.
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(),
});

// =================================================================================
// RELATIONS
// =================================================================================

export const hospitalsRelations = relations(hospitals, ({ many }) => ({
  memberships: many(memberships),
  doctors: many(doctors),
  patients: many(patients),
  encounters: many(encounters),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  memberships: many(memberships),
  doctorProfiles: many(doctors),
  patientProfiles: many(patients),
  encountersAsPatient: many(encounters),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  hospital: one(hospitals, {
    fields: [memberships.hospitalId],
    references: [hospitals.id],
  }),
  user: one(users, { fields: [memberships.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, { fields: [doctors.userId], references: [users.id] }),
  hospital: one(hospitals, {
    fields: [doctors.hospitalId],
    references: [hospitals.id],
  }),
  schedules: many(schedules),
  services: many(services),
  encounters: many(encounters),
}));

export const patientsRelations = relations(patients, ({ one }) => ({
  user: one(users, { fields: [patients.userId], references: [users.id] }),
  hospital: one(hospitals, {
    fields: [patients.hospitalId],
    references: [hospitals.id],
  }),
}));

export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [schedules.doctorId],
    references: [doctors.id],
  }),
  availabilities: many(availabilities),
}));

export const availabilitiesRelations = relations(availabilities, ({ one }) => ({
  schedule: one(schedules, {
    fields: [availabilities.scheduleId],
    references: [schedules.id],
  }),
}));

export const encountersRelations = relations(encounters, ({ one }) => ({
  patient: one(users, {
    fields: [encounters.patientId],
    references: [users.id],
  }),
  doctor: one(doctors, {
    fields: [encounters.doctorId],
    references: [doctors.id],
  }),
  hospital: one(hospitals, {
    fields: [encounters.hospitalId],
    references: [hospitals.id],
  }),
  booking: one(bookings),
  payment: one(payments),
  medicalRecord: one(medicalRecords),
}));

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  encounter: one(encounters, {
    fields: [medicalRecords.encounterId],
    references: [encounters.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [services.doctorId],
    references: [doctors.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  encounter: one(encounters, {
    fields: [bookings.encounterId],
    references: [encounters.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  encounter: one(encounters, {
    fields: [payments.encounterId],
    references: [encounters.id],
  }),
}));
