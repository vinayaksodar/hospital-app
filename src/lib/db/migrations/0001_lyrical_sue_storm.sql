ALTER TABLE "consultations" ADD COLUMN "consultationFee" integer DEFAULT 500 NOT NULL;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "currency" text DEFAULT 'INR';