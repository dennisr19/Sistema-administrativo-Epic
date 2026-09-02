CREATE TABLE `agents` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`phone` text,
	`company` text,
	`email` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `agents_by_organization` ON `agents` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `agents_by_name` ON `agents` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`phone` text,
	`license` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `drivers_by_organization` ON `drivers` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_by_name` ON `drivers` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `guides` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`phone` text,
	`email` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `guides_by_organization` ON `guides` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `guides_by_name` ON `guides` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`phone` text,
	`address` text,
	`email` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `hotels_by_organization` ON `hotels` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `hotels_by_name` ON `hotels` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `meal_options` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `meal_options_by_organization` ON `meal_options` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `meal_options_by_name` ON `meal_options` (`organization_id`,`name`);--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizations_slug_unique` ON `organizations` (`slug`);--> statement-breakpoint
CREATE TABLE `reservation_meals` (
	`id` text PRIMARY KEY NOT NULL,
	`reservation_id` text NOT NULL,
	`meal_option_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`meal_option_id`) REFERENCES `meal_options`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reservation_meals_by_reservation` ON `reservation_meals` (`reservation_id`);--> statement-breakpoint
CREATE TABLE `reservation_tickets` (
	`id` text PRIMARY KEY NOT NULL,
	`reservation_id` text NOT NULL,
	`passport` text,
	`name` text,
	`kind` text,
	FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `reservation_tickets_by_reservation` ON `reservation_tickets` (`reservation_id`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`code` text NOT NULL,
	`date` text NOT NULL,
	`time` text,
	`customer_name` text NOT NULL,
	`people` integer DEFAULT 1 NOT NULL,
	`ticket_count` integer DEFAULT 0 NOT NULL,
	`tour_id` text,
	`hotel_id` text,
	`pickup_point` text,
	`driver_id` text,
	`guide_id` text,
	`agent_id` text,
	`net_rate_cents` integer DEFAULT 0 NOT NULL,
	`deposit_cents` integer DEFAULT 0 NOT NULL,
	`note` text,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`hotel_id`) REFERENCES `hotels`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`guide_id`) REFERENCES `guides`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`agent_id`) REFERENCES `agents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reservations_by_date` ON `reservations` (`organization_id`,`date`);--> statement-breakpoint
CREATE UNIQUE INDEX `reservations_by_code` ON `reservations` (`organization_id`,`code`);--> statement-breakpoint
CREATE INDEX `reservations_by_tour` ON `reservations` (`tour_id`);--> statement-breakpoint
CREATE INDEX `reservations_by_guide` ON `reservations` (`guide_id`);--> statement-breakpoint
CREATE INDEX `reservations_by_driver` ON `reservations` (`driver_id`);--> statement-breakpoint
CREATE INDEX `reservations_by_agent` ON `reservations` (`agent_id`);--> statement-breakpoint
CREATE TABLE `tours` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`description` text,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`kind` text,
	`includes_meals` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `tours_by_organization` ON `tours` (`organization_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `tours_by_name` ON `tours` (`organization_id`,`name`);