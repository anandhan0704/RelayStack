CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES customers(id),
  name text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  preview text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS api_keys_customer_id_idx ON api_keys(customer_id);

CREATE TABLE IF NOT EXISTS wallets (
  id text PRIMARY KEY,
  customer_id text NOT NULL UNIQUE REFERENCES customers(id),
  balance numeric(12, 4) NOT NULL,
  currency text NOT NULL DEFAULT 'USD'
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id text PRIMARY KEY,
  wallet_id text NOT NULL REFERENCES wallets(id),
  amount numeric(12, 4) NOT NULL,
  type text NOT NULL,
  reference_id text,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS wallet_transactions_wallet_id_idx ON wallet_transactions(wallet_id);

CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES customers(id),
  channel text NOT NULL,
  from_address text NOT NULL,
  to_address text NOT NULL,
  subject text,
  body text NOT NULL,
  status text NOT NULL,
  provider text NOT NULL,
  provider_message_id text,
  cost numeric(12, 4) NOT NULL,
  callback_url text,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject text;

CREATE INDEX IF NOT EXISTS messages_customer_id_created_at_idx ON messages(customer_id, created_at);

CREATE TABLE IF NOT EXISTS message_status_events (
  id text PRIMARY KEY,
  message_id text NOT NULL REFERENCES messages(id),
  status text NOT NULL,
  raw_payload jsonb,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS message_status_events_message_id_idx ON message_status_events(message_id);

CREATE TABLE IF NOT EXISTS provider_routes (
  id text PRIMARY KEY,
  name text NOT NULL,
  channel text NOT NULL,
  country text NOT NULL,
  health text NOT NULL DEFAULT 'healthy',
  unit_cost numeric(12, 4) NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_approvals (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL,
  created_at timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
