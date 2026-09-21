import "server-only";

import { neon } from "@neondatabase/serverless";

// Every database call lives in this file. `server-only` above makes the build
// fail loudly if any of it is ever pulled into a client component, which is
// what keeps the driver and the connection string out of the browser bundle.

export type MemberInput = {
  fullName: string;
  phoneCc: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  monthlyAmount: number;
};

export type MemberRow = {
  id: string;
  full_name: string;
  phone_cc: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  monthly_amount: number;
  /** Already formatted in Mumbai time, so both drivers render identically. */
  submitted_display: string;
  updated_display: string;
};

type Rows = Record<string, unknown>[];
type Queryable = (text: string, params: unknown[]) => Promise<Rows>;

function connectionString(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and put the Neon connection string in it.",
    );
  }
  return url;
}

let queryable: Queryable | null = null;

function getQueryable(): Queryable {
  if (queryable) return queryable;
  const url = connectionString();

  if (url.includes(".neon.tech")) {
    // Production. The HTTP driver suits serverless: no pool to exhaust.
    const sql = neon(url);
    queryable = (text, params) => sql.query(text, params) as Promise<Rows>;
  } else {
    // A plain Postgres, used for local development and the test suite only.
    // `pg` is a devDependency and this branch is never taken in production.
    let pool: { query: (t: string, p: unknown[]) => Promise<{ rows: Rows }> } | null = null;
    queryable = async (text, params) => {
      if (!pool) {
        const { Pool } = await import("pg");
        pool = new Pool({ connectionString: url });
      }
      const result = await pool.query(text, params);
      return result.rows;
    };
  }

  return queryable;
}

/**
 * Record a pledge, or update the one already filed against this phone number.
 *
 * Re-submitting is deliberate: a voluntary amount is a thing people change
 * their mind about, and the phone number is the identity, so the second
 * filling replaces the first instead of making a duplicate member.
 */
export async function upsertMember(member: MemberInput): Promise<{ created: boolean }> {
  const query = getQueryable();
  const rows = await query(
    `INSERT INTO member
       (full_name, phone_cc, phone, email, address, city, country, monthly_amount)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT ON CONSTRAINT member_phone_unique DO UPDATE
       SET full_name      = EXCLUDED.full_name,
           email          = EXCLUDED.email,
           address        = EXCLUDED.address,
           city           = EXCLUDED.city,
           country        = EXCLUDED.country,
           monthly_amount = EXCLUDED.monthly_amount,
           updated_at     = now()
     RETURNING (xmax = 0) AS created`,
    [
      member.fullName,
      member.phoneCc,
      member.phone,
      member.email,
      member.address,
      member.city,
      member.country,
      member.monthlyAmount,
    ],
  );
  // Postgres sets xmax to 0 on a genuine insert, so this distinguishes a new
  // member from one who has filled the form again with a different amount.
  return { created: rows[0]?.created === true };
}

/** Every member who has filled the form, newest first. Used by /report only. */
export async function listMembers(): Promise<MemberRow[]> {
  const query = getQueryable();
  const rows = await query(
    `SELECT id::text            AS id,
            full_name,
            phone_cc,
            phone,
            email,
            address,
            city,
            country,
            monthly_amount,
            to_char(submitted_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY') AS submitted_display,
            to_char(updated_at   AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY') AS updated_display
       FROM member
      ORDER BY updated_at DESC, id DESC`,
    [],
  );
  return rows as unknown as MemberRow[];
}
