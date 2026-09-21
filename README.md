# PJMDTF — Member Directory & Voluntary Contribution Form

Pewe Jama-tul-Muslimeen Deeni Thali Fund.

The Managing Committee's monthly contribution appeal, and the form that goes
with it. It replaces the WhatsApp message and Google Form.

## Routes

| Route | Access | What |
|---|---|---|
| `/` | open by link | The announcement, then the form. Shared in the Jamaat WhatsApp group. |
| `/report` | password | Who has joined, what they pledged, whether the ₹25,000 is covered. Prints to A4. |
| `/enter` | open | The password gate that `/report` redirects to. |

## Environment

Two variables, both set in the Vercel project. Neither belongs in the repo.

| Variable | Required | What |
|---|---|---|
| `DATABASE_URL` | yes | Neon Postgres connection string for the `pjmdtf-mumbai` project. |
| `SITE_PASSWORD` | no | Overrides the password for `/report`. Without it, the SHA-256 digest compiled into `src/lib/auth.ts` is used. |

Only a digest of the password is ever committed. Setting `SITE_PASSWORD` in
Vercel lets the committee change the password without a commit, and means the
live password is not the one the repository's digest describes.

## Running it locally

```sh
npm install
cp .env.example .env.local      # then put the real connection string in it
npm run dev
```

`.env.local` is gitignored. Do not commit it.

Against a plain local Postgres rather than Neon, create the table from
`schema.sql` and point `DATABASE_URL` at it — the database module picks the
driver from the connection string, so no other change is needed.

## How it is put together

- **Next.js** (App Router) and **TypeScript**, plain CSS, no UI framework.
- **No required JavaScript.** The form is a plain HTML POST followed by a
  redirect, so it survives a bad connection. The only script on the page
  updates the dialling code shown beside the mobile field, and the form works
  identically without it — the server trusts the country select, not the script.
- **`src/lib/db.ts` is the only file that touches the database**, and it starts
  with `import "server-only"` so the build fails if it is ever pulled into a
  client component.
- **The phone number is the member's identity.** It is normalised before
  storing, so `09892542400`, `+91 98925 42400` and `0091 9892542400` all come
  to rest as the same number. Filling the form again updates the pledge instead
  of creating a second member.
- **Every country is in the country list**, generated from ISO 3166 and joined
  to dialling codes. A member anywhere must be able to fill this in.

## What is deliberately not collected

Name, contact, address, amount. No Aadhaar, no PAN, no bank details, no
photographs. Members' phone numbers appear only behind the password.
