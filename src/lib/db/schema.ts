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
} from "drizzle-orm/pg-core";

import type { AdapterAccountType } from "next-auth/adapters";

// Define an enum for user roles.
export const userRoleEnum = pgEnum("userRole", ["doctor", "patient", "admin"]);

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  phone: text("phone"),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("patient"),
  hospitalId: integer("hospitalId").notNull(), // Multi-tenant support
});

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
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
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
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

export const authenticators = pgTable(
  "authenticators",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
);

// Define an enum for doctor specialities.
export const specialityEnum = pgEnum("speciality", [
  "ophthalmology",
  "pediatrics",
  "etc",
]);

// Doctor Table: stores doctor-specific details and links to a user.
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  speciality: specialityEnum("speciality").notNull(),
  aboutDetails: text("aboutDetails"),
  image: text("image"), // URL or file path
});

// Schedule Table: each schedule is linked to a doctor.
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }),
});

// Availability Table: each schedule can have multiple availabilities.
export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  days: integer("days").array(),
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
});

// Consultation Table: an event/appointment based on a schedule.
export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  scheduleId: integer("scheduleId")
    .notNull()
    .references(() => schedules.id, { onDelete: "cascade" }),
  duration: integer("duration").notNull(), // Duration in minutes
  consultationFee: integer("consultationFee").notNull().default(500),
  currency: text("currency").default("INR"), // ISO 4217 currency code (e.g., "USD", "INR")
});

// Booking Table: patients book consultations.
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultationId")
    .notNull()
    .references(() => consultations.id, { onDelete: "cascade" }),
  doctorId: integer("doctorId")
    .notNull()
    .references(() => doctors.id, { onDelete: "cascade" }), // Direct link to doctor
  inviteeEmail: text("inviteeEmail").notNull(),
  startDateUTC: timestamp("startDateUTC", { withTimezone: true }).notNull(),
  endDateUTC: timestamp("endDateUTC", { withTimezone: true }).notNull(),
  cancelCode: text("cancelCode").notNull(),
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
  doctors: many(doctors),
}));

// Accounts relations
export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

// Sessions relations
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

// Authenticators relations
export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));

// Doctors relations
export const doctorsRelations = relations(doctors, ({ one, many }) => ({
  user: one(users, {
    fields: [doctors.userId],
    references: [users.id],
  }),
  schedules: many(schedules),
}));

// Schedules relations
export const schedulesRelations = relations(schedules, ({ one, many }) => ({
  doctor: one(doctors, {
    fields: [schedules.doctorId],
    references: [doctors.id],
  }),
  availabilities: many(availabilities),
  consultations: many(consultations),
}));

// Availabilities relations
export const availabilitiesRelations = relations(availabilities, ({ one }) => ({
  schedule: one(schedules, {
    fields: [availabilities.scheduleId],
    references: [schedules.id],
  }),
}));

// Consultations relations
export const consultationsRelations = relations(
  consultations,
  ({ one, many }) => ({
    schedule: one(schedules, {
      fields: [consultations.scheduleId],
      references: [schedules.id],
    }),
    bookings: many(bookings),
  })
);

// Bookings relations
export const bookingsRelations = relations(bookings, ({ one }) => ({
  consultation: one(consultations, {
    fields: [bookings.consultationId],
    references: [consultations.id],
  }),
  doctor: one(doctors, {
    fields: [bookings.doctorId],
    references: [doctors.id],
  }),
}));
