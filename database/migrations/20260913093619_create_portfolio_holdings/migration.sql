CREATE TABLE "portfolio_holdings" (
	"id" serial PRIMARY KEY,
	"owner_id" text NOT NULL,
	"symbol" text NOT NULL,
	"company_name" text NOT NULL,
	"quantity" numeric NOT NULL,
	"buy_price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
