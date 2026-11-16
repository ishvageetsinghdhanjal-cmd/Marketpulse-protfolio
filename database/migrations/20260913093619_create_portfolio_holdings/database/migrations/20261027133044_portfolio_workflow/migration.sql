ALTER TABLE "portfolio_holdings" ADD COLUMN "buy_date" date;--> statement-breakpoint
ALTER TABLE "portfolio_holdings" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "portfolio_holdings" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
CREATE INDEX "portfolio_holdings_owner_idx" ON "portfolio_holdings" ("owner_id");
