CREATE TYPE "public"."speciality" AS ENUM('ophthalmology', 'pediatrics', 'etc');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('doctor', 'patient', 'admin');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text
);
--> statement-breakpoint
CREATE TABLE "authenticators" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "authenticators_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "availabilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheduleId" integer NOT NULL,
	"days" integer[],
	"startTime" time NOT NULL,
	"endTime" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" serial PRIMARY KEY NOT NULL,
	"consultationId" integer NOT NULL,
	"doctorId" integer NOT NULL,
	"inviteeEmail" text NOT NULL,
	"startDateUTC" timestamp with time zone NOT NULL,
	"endDateUTC" timestamp with time zone NOT NULL,
	"cancelCode" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" serial PRIMARY KEY NOT NULL,
	"scheduleId" integer NOT NULL,
	"duration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"speciality" "speciality" NOT NULL,
	"aboutDetails" text,
	"image" text
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"doctorId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" text,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"role" "userRole" DEFAULT 'patient' NOT NULL,
	"hospitalId" integer NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticators" ADD CONSTRAINT "authenticators_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_scheduleId_schedules_id_fk" FOREIGN KEY ("scheduleId") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_consultationId_consultations_id_fk" FOREIGN KEY ("consultationId") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_scheduleId_schedules_id_fk" FOREIGN KEY ("scheduleId") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;