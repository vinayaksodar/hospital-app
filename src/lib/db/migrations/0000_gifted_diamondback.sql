CREATE TYPE "public"."bookingStatus" AS ENUM('pending', 'confirmed', 'completed', 'cancelled_by_patient', 'cancelled_by_doctor', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'GBP', 'INR');--> statement-breakpoint
CREATE TYPE "public"."encounterType" AS ENUM('online_booking', 'walk_in', 'teleconsultation', 'follow_up', 'historical_data_entry');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."speciality" AS ENUM('ophthalmology', 'pediatrics', 'cardiology', 'dermatology', 'etc');--> statement-breakpoint
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
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
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
	"encounterId" integer NOT NULL,
	"serviceId" integer NOT NULL,
	"startDateUTC" timestamp with time zone NOT NULL,
	"endDateUTC" timestamp with time zone NOT NULL,
	"status" "bookingStatus" DEFAULT 'confirmed' NOT NULL,
	CONSTRAINT "bookings_encounterId_unique" UNIQUE("encounterId")
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"hospitalId" integer NOT NULL,
	"speciality" "speciality" NOT NULL,
	"aboutDetails" text
);
--> statement-breakpoint
CREATE TABLE "encounters" (
	"id" serial PRIMARY KEY NOT NULL,
	"patientId" text NOT NULL,
	"doctorId" integer NOT NULL,
	"hospitalId" integer NOT NULL,
	"encounterDateUTC" timestamp with time zone DEFAULT now() NOT NULL,
	"type" "encounterType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hospitals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "hospitals_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"encounterId" integer NOT NULL,
	"notes" text,
	"prescription" text,
	"createdAt" timestamp with time zone DEFAULT now(),
	CONSTRAINT "medical_records_encounterId_unique" UNIQUE("encounterId")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"userId" text NOT NULL,
	"hospitalId" integer NOT NULL,
	"role" "userRole" NOT NULL,
	CONSTRAINT "memberships_userId_hospitalId_role_pk" PRIMARY KEY("userId","hospitalId","role")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"hospitalId" integer NOT NULL,
	"dateOfBirth" timestamp,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"encounterId" integer NOT NULL,
	"amount" integer NOT NULL,
	"currency" "currency" NOT NULL,
	"status" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"paymentGatewayId" text,
	"createdAt" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"timezone" text NOT NULL,
	"doctorId" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctorId" integer NOT NULL,
	"name" text NOT NULL,
	"duration" integer NOT NULL,
	"consultationFee" integer NOT NULL,
	"currency" "currency" DEFAULT 'INR' NOT NULL
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
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"phone" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availabilities" ADD CONSTRAINT "availabilities_scheduleId_schedules_id_fk" FOREIGN KEY ("scheduleId") REFERENCES "public"."schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_encounterId_encounters_id_fk" FOREIGN KEY ("encounterId") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_services_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_hospitalId_hospitals_id_fk" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_patientId_users_id_fk" FOREIGN KEY ("patientId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "encounters" ADD CONSTRAINT "encounters_hospitalId_hospitals_id_fk" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_encounterId_encounters_id_fk" FOREIGN KEY ("encounterId") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_hospitalId_hospitals_id_fk" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_hospitalId_hospitals_id_fk" FOREIGN KEY ("hospitalId") REFERENCES "public"."hospitals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_encounterId_encounters_id_fk" FOREIGN KEY ("encounterId") REFERENCES "public"."encounters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_doctorId_doctors_id_fk" FOREIGN KEY ("doctorId") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "doctors_userId_hospitalId_index" ON "doctors" USING btree ("userId","hospitalId");--> statement-breakpoint
CREATE UNIQUE INDEX "patients_userId_hospitalId_index" ON "patients" USING btree ("userId","hospitalId");