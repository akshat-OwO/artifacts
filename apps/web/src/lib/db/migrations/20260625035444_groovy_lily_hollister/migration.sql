CREATE TABLE "device_code" (
	"client_id" text,
	"device_code" text NOT NULL,
	"expires_at" timestamp(6) with time zone NOT NULL,
	"id" text PRIMARY KEY,
	"last_polled_at" timestamp(6) with time zone,
	"polling_interval" integer,
	"scope" text,
	"status" text NOT NULL,
	"user_code" text NOT NULL,
	"user_id" text
);
