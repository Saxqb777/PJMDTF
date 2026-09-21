-- The member table, as it already exists in the Neon project `pjmdtf-mumbai`.
-- Kept here so the database can be recreated, and so the test suite can stand
-- up an identical one locally.

CREATE TABLE IF NOT EXISTS member (
  id             bigserial PRIMARY KEY,
  full_name      text        NOT NULL,
  phone_cc       text        NOT NULL,
  phone          text        NOT NULL,
  email          text        NOT NULL DEFAULT '',
  address        text        NOT NULL,
  city           text        NOT NULL,
  country        text        NOT NULL,
  monthly_amount integer     NOT NULL,
  submitted_at   timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_phone_unique UNIQUE (phone_cc, phone),
  CONSTRAINT member_amount_sane  CHECK (monthly_amount >= 50 AND monthly_amount <= 1000000)
);
