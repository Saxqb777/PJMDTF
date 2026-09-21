import { listMembers } from "@/lib/db";
import {
  AMOUNT_OPTIONS,
  MONTHLY_TARGET,
  ORGANISATION,
  SIGNATORY,
  formatRupees,
} from "@/lib/constants";

// Behind the password. It answers one question at a glance: are the salaries
// covered?

export const dynamic = "force-dynamic";

// Matches Postgres's to_char(..., 'DD Mon YYYY') exactly, so the date in the
// heading and the dates in the table are written the same way.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function today(): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "numeric",
    year: "numeric",
  }).formatToParts(new Date());
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return part("day") + " " + MONTHS[Number(part("month")) - 1] + " " + part("year");
}

export default async function Report() {
  const members = await listMembers();

  const count = members.length;
  const total = members.reduce((sum, m) => sum + Number(m.monthly_amount), 0);
  const difference = total - MONTHLY_TARGET;
  const covered = difference >= 0;

  // One bar, no chart library. Scaling to whichever is larger means the
  // 25,000 line always has a place to sit, whether we are over it or under.
  const scaleMax = Math.max(total, MONTHLY_TARGET);
  const fillPercent = scaleMax === 0 ? 0 : (total / scaleMax) * 100;
  const targetPercent = scaleMax === 0 ? 100 : (MONTHLY_TARGET / scaleMax) * 100;

  const tally = new Map<number, number>();
  for (const amount of AMOUNT_OPTIONS) tally.set(amount, 0);
  for (const member of members) {
    const amount = Number(member.monthly_amount);
    tally.set(amount, (tally.get(amount) ?? 0) + 1);
  }
  const breakdown = [...tally.entries()].sort((a, b) => a[0] - b[0]);

  return (
    <main className="page report">
      <div className="report-actions screen-only">
        <a href="/">Back to the form</a>
        <form method="post" action="/api/lock">
          <button type="submit" className="link-button">
            Lock the report
          </button>
        </form>
      </div>

      <header className="masthead">
        <p className="eyebrow">{ORGANISATION}</p>
        <h1>Contributions pledged</h1>
        <p className="standfirst">Managing Committee &middot; as at {today()}</p>
        <div className="band" aria-hidden="true" />
      </header>

      <section className="verdict-section" aria-labelledby="verdict">
        <p className={covered ? "verdict verdict-covered" : "verdict verdict-short"} id="verdict">
          {count === 0
            ? "No one has filled the form yet."
            : covered
              ? "The salaries are covered."
              : "The salaries are not yet covered."}
        </p>

        <div
          className="meter"
          role="img"
          aria-label={
            "Pledged " +
            formatRupees(total) +
            " against the " +
            formatRupees(MONTHLY_TARGET) +
            " needed every month."
          }
        >
          <div className="meter-fill" style={{ width: fillPercent + "%" }} />
          <div className="meter-target" style={{ left: targetPercent + "%" }} />
        </div>
        <p className="meter-key">
          <span className="meter-key-fill" aria-hidden="true" /> pledged
          <span className="meter-key-target" aria-hidden="true" /> the {formatRupees(MONTHLY_TARGET)}{" "}
          needed
        </p>

        <dl className="stats">
          <div>
            <dt>Members joined</dt>
            <dd className="figure">{count}</dd>
          </div>
          <div>
            <dt>Total pledged per month</dt>
            <dd className="figure">{formatRupees(total)}</dd>
          </div>
          <div>
            <dt>Needed every month</dt>
            <dd className="figure">{formatRupees(MONTHLY_TARGET)}</dd>
          </div>
          <div>
            <dt>{covered ? "Surplus" : "Still short"}</dt>
            <dd className={covered ? "figure figure-good" : "figure figure-short"}>
              {formatRupees(Math.abs(difference))}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="by-amount">
        <h2 id="by-amount">By amount chosen</h2>
        <table className="tally">
          <thead>
            <tr>
              <th scope="col">Monthly amount</th>
              <th scope="col" className="numeric">
                Members
              </th>
              <th scope="col" className="numeric">
                Pledged
              </th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map(([amount, howMany]) => (
              <tr key={amount}>
                <th scope="row">{formatRupees(amount)}</th>
                <td className="numeric">{howMany}</td>
                <td className="numeric">{formatRupees(amount * howMany)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              <td className="numeric">{count}</td>
              <td className="numeric">{formatRupees(total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section aria-labelledby="everyone">
        <h2 id="everyone">Members</h2>
        {count === 0 ? (
          <p>Nobody has filled the form yet. Names will appear here as they come in.</p>
        ) : (
          <table className="members">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Mobile</th>
                <th scope="col">Email</th>
                <th scope="col">City</th>
                <th scope="col">Country</th>
                <th scope="col" className="numeric">
                  Monthly
                </th>
                <th scope="col">Filled</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td data-label="Name">{member.full_name}</td>
                  <td data-label="Mobile" className="numeric-text">
                    {member.phone_cc} {member.phone}
                  </td>
                  <td data-label="Email">{member.email === "" ? "—" : member.email}</td>
                  <td data-label="City">{member.city}</td>
                  <td data-label="Country">{member.country}</td>
                  <td data-label="Monthly" className="numeric">
                    {formatRupees(Number(member.monthly_amount))}
                  </td>
                  <td data-label="Filled">{member.updated_display}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <footer className="closing">
        <div className="band" aria-hidden="true" />
        <p className="signature">{SIGNATORY}</p>
      </footer>
    </main>
  );
}
