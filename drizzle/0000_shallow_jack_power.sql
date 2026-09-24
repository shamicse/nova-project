CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`line1` text NOT NULL,
	`city` text NOT NULL,
	`state` text NOT NULL,
	`postalCode` text NOT NULL,
	`country` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `addresses_user` ON `addresses` (`userId`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cart_items` (
	`owner` text NOT NULL,
	`productId` text NOT NULL,
	`quantity` integer NOT NULL,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "cart_quantity" CHECK("cart_items"."quantity" BETWEEN 1 AND 20)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `cart_owner_product` ON `cart_items` (`owner`,`productId`);--> statement-breakpoint
CREATE TABLE `coupons` (
	`code` text PRIMARY KEY NOT NULL,
	`percent` integer NOT NULL,
	`minimum` integer NOT NULL,
	`maximum` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`expiresAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`message` text NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notifications_user` ON `notifications` (`userId`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`productId` text NOT NULL,
	`sellerId` text NOT NULL,
	`name` text NOT NULL,
	`price` integer NOT NULL,
	`quantity` integer NOT NULL,
	`image` text NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `items_order` ON `order_items` (`orderId`);--> statement-breakpoint
CREATE INDEX `items_seller` ON `order_items` (`sellerId`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`idempotencyKey` text NOT NULL,
	`subtotal` integer NOT NULL,
	`discount` integer NOT NULL,
	`shipping` integer NOT NULL,
	`total` integer NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`status` text DEFAULT 'awaiting_payment' NOT NULL,
	`paymentStatus` text DEFAULT 'unpaid' NOT NULL,
	`paymentProvider` text NOT NULL,
	`providerId` text,
	`address` text NOT NULL,
	`coupon` text,
	`tracking` text DEFAULT '' NOT NULL,
	`createdAt` text NOT NULL,
	`deliveredAt` text,
	`expiresAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `order_user_idempotency` ON `orders` (`userId`,`idempotencyKey`);--> statement-breakpoint
CREATE INDEX `orders_user_created` ON `orders` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_status` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`subject` text NOT NULL,
	`body` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`sellerId` text NOT NULL,
	`name` text NOT NULL,
	`brand` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`comparePrice` integer DEFAULT 0 NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL,
	`image` text NOT NULL,
	`badge` text DEFAULT '' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`sellerId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "stock_nonnegative" CHECK("products"."stock" >= 0),
	CONSTRAINT "price_positive" CHECK("products"."price" > 0)
);
--> statement-breakpoint
CREATE INDEX `products_category_active` ON `products` (`category`,`active`);--> statement-breakpoint
CREATE INDEX `products_seller` ON `products` (`sellerId`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expiresAt` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `returns` (
	`id` text PRIMARY KEY NOT NULL,
	`orderId` text NOT NULL,
	`userId` text NOT NULL,
	`reason` text NOT NULL,
	`status` text DEFAULT 'requested' NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `return_order` ON `returns` (`orderId`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`productId` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "review_rating" CHECK("reviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `review_user_product` ON `reviews` (`userId`,`productId`);--> statement-breakpoint
CREATE TABLE `seller_applications` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`storeName` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `seller_application_user` ON `seller_applications` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`role` text DEFAULT 'customer' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_events` (
	`id` text PRIMARY KEY NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlists` (
	`userId` text NOT NULL,
	`productId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wishlist_user_product` ON `wishlists` (`userId`,`productId`);