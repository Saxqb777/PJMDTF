import { cookies } from "next/headers";

import { PINNED_COUNTRIES, OTHER_COUNTRIES, DEFAULT_COUNTRY_ISO, countryByIso } from "@/lib/countries";
import { DRAFT_COOKIE, EMPTY_DRAFT, decodeDraft } from "@/lib/draft-cookie";
import {
  AMOUNT_OPTIONS,
  CITY_SUGGESTIONS,
  CURRENT_COLLECTION_HIGH,
  CURRENT_COLLECTION_LOW,
  CURRENT_RATE,
  EFFECTIVE_FROM,
  FORM_CLOSES,
  JAMAAT,
  MONTHLY_TARGET,
  ORGANISATION,
  SALARIES,
  SIGNATORY,
  SUGGESTED_AMOUNT,
  TARGET_MEMBERS,
  formatRupees,
} from "@/lib/constants";
import { ADDRESS_MAX, CITY_MAX, EMAIL_MAX, NAME_MAX } from "@/lib/validate";

export const dynamic = "force-dynamic";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

function one(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const SHORTFALL_LOW = MONTHLY_TARGET - CURRENT_COLLECTION_HIGH;
const SHORTFALL_HIGH = MONTHLY_TARGET - CURRENT_COLLECTION_LOW;

export default async function Home({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;

  // The draft is only read when the redirect says there was a problem, so
  // arriving at a bare "/" never shows a stale message from five minutes ago.
  const failed = one(params.e) === "1";
  const payload = failed ? decodeDraft((await cookies()).get(DRAFT_COOKIE)?.value) : null;
  const draft = payload?.draft ?? EMPTY_DRAFT;
  const problem = payload?.message ?? (failed ? "Something went wrong. Please try again." : "");

  const doneRaw = one(params.done);
  const done = /^[0-9]+$/.test(doneRaw) ? Number(doneRaw) : null;
  const wasUpdate = one(params.again) === "1";

  const selectedCountry = countryByIso(draft.country)?.iso ?? DEFAULT_COUNTRY_ISO;
  const selectedDial = countryByIso(selectedCountry)?.dial ?? "+91";

  return (
    <main className="page">
      <header className="masthead">
        <p className="arabic arabic-open" dir="rtl" lang="ar">
          السلام عليكم ورحمة الله وبركاته
        </p>
        <p className="eyebrow">{ORGANISATION}</p>
        <h1>Monthly contribution towards the Jamaat&rsquo;s salaries</h1>
        <p className="standfirst">{JAMAAT} &middot; Managing Committee</p>
        <div className="band" aria-hidden="true" />
      </header>

      <section className="prose" aria-labelledby="obligation">
        <h2 id="obligation">What the Jamaat pays every month</h2>
        <table className="salaries">
          <tbody>
            {SALARIES.map((row) => (
              <tr key={row.role}>
                <th scope="row">{row.role}</th>
                <td className="figure">{formatRupees(row.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total every month</th>
              <td className="figure">{formatRupees(MONTHLY_TARGET)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <section className="prose" aria-labelledby="standing">
        <h2 id="standing">Where the fund stands today</h2>
        <p>
          At the present {formatRupees(CURRENT_RATE)} per member, collection averages{" "}
          {formatRupees(CURRENT_COLLECTION_LOW)} to {formatRupees(CURRENT_COLLECTION_HIGH)} a month.
          The salaries alone come to {formatRupees(MONTHLY_TARGET)}.
        </p>

        <p className="headline-figure">
          <span className="headline-figure-amount">
            {formatRupees(SHORTFALL_LOW)} &ndash; {formatRupees(SHORTFALL_HIGH)}
          </span>
          <span className="headline-figure-label">short every month, on salaries alone</span>
        </p>

        <p>
          That is before welfare, maintenance, religious education, emergencies or any development
          work.
        </p>
      </section>

      <section className="prose" aria-labelledby="ask">
        <h2 id="ask">What we are asking</h2>
        <p>
          If {TARGET_MEMBERS} earning members voluntarily give {formatRupees(SUGGESTED_AMOUNT)} a
          month, the {formatRupees(MONTHLY_TARGET)} is covered in full. Anything above that builds a
          reserve for the work the salaries do not cover.
        </p>
        <p className="notice">
          This is not a mandatory increase. Members give what they can afford.
        </p>
      </section>

      <section className="prose" aria-labelledby="dates">
        <h2 id="dates">Dates</h2>
        <dl className="dates">
          <div>
            <dt>Form closes</dt>
            <dd>{FORM_CLOSES}</dd>
          </div>
          <div>
            <dt>Contributions effective from</dt>
            <dd>{EFFECTIVE_FROM}</dd>
          </div>
        </dl>
        <p>
          This is for all earning members of the Jamaat, wherever they live &mdash; India, the UAE,
          Oman, elsewhere in the Gulf, or anywhere else.
        </p>
      </section>

      <section className="form-section" id="form" aria-labelledby="form-heading">
        <div className="band" aria-hidden="true" />
        <h2 id="form-heading">Your details</h2>

        {done !== null && (
          <p className="banner banner-done" role="status">
            <strong>
              {wasUpdate
                ? "Thank you. Your monthly contribution has been updated to " +
                  formatRupees(done) +
                  "."
                : "Thank you. Your monthly contribution of " + formatRupees(done) + " has been recorded."}
            </strong>
            <span>
              If you change your mind, fill the form again with the same mobile number and the new
              amount replaces the old.
            </span>
          </p>
        )}

        {problem !== "" && (
          <p className="banner banner-problem" role="alert">
            {problem}
          </p>
        )}

        <form method="post" action="/api/join" className="form">
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              maxLength={NAME_MAX}
              autoComplete="name"
              defaultValue={draft.fullName}
            />
          </div>

          <div className="field">
            <label htmlFor="country">Country you live in</label>
            <select id="country" name="country" required defaultValue={selectedCountry}>
              <optgroup label="India and the Gulf">
                {PINNED_COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso} data-dial={c.dial}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Every other country">
                {OTHER_COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso} data-dial={c.dial}>
                    {c.name} ({c.dial})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="field">
            <label htmlFor="phone">Mobile number</label>
            <div className="phone-row">
              <span className="dial" id="dial" aria-hidden="true">
                {selectedDial}
              </span>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                inputMode="tel"
                autoComplete="tel-national"
                defaultValue={draft.phone}
              />
            </div>
            <p className="hint">
              Your country above sets the code. Type only your own number after it.
            </p>
          </div>

          <div className="field">
            <label htmlFor="email">
              Email address <span className="optional">optional</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              maxLength={EMAIL_MAX}
              autoComplete="email"
              defaultValue={draft.email}
            />
          </div>

          <div className="field">
            <label htmlFor="address">Current residential address</label>
            <textarea
              id="address"
              name="address"
              required
              rows={4}
              maxLength={ADDRESS_MAX}
              autoComplete="street-address"
              defaultValue={draft.address}
            />
          </div>

          <div className="field">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              required
              maxLength={CITY_MAX}
              list="cities"
              autoComplete="address-level2"
              defaultValue={draft.city}
            />
            <datalist id="cities">
              {CITY_SUGGESTIONS.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
          </div>

          <fieldset className="field amounts-field">
            <legend>How much would you like to give each month?</legend>
            <div className="amounts">
              {AMOUNT_OPTIONS.map((amount) => (
                <label className="amount" key={amount}>
                  <input
                    type="radio"
                    name="amount"
                    value={amount}
                    defaultChecked={draft.amount === String(amount)}
                  />
                  <span className="amount-value">{formatRupees(amount)}</span>
                  {amount === SUGGESTED_AMOUNT && (
                    <span className="amount-note">
                      covers the salaries in full if {TARGET_MEMBERS} members choose it
                    </span>
                  )}
                </label>
              ))}
              <label className="amount" key="other">
                <input
                  type="radio"
                  name="amount"
                  value="other"
                  id="amount-other"
                  defaultChecked={draft.amount === "other"}
                />
                <span className="amount-value">Other</span>
              </label>
            </div>

            <div className="other-box">
              <label htmlFor="otherAmount">If you chose Other, how much each month?</label>
              <input
                type="number"
                id="otherAmount"
                name="otherAmount"
                min={50}
                step={1}
                inputMode="numeric"
                defaultValue={draft.otherAmount}
              />
            </div>
          </fieldset>

          <div className="submit-row">
            <button type="submit">Send my details</button>
            <p className="hint">
              Filled it already? Fill it again and the new amount replaces the old.
            </p>
          </div>
        </form>
      </section>

      <footer className="closing">
        <div className="band" aria-hidden="true" />
        <p className="arabic" dir="rtl" lang="ar">
          جزاك الله خيرا
        </p>
        <p className="signature">{SIGNATORY}</p>
      </footer>

      {/* Cosmetic only. The country select is what the server trusts, so the
          form works exactly the same if this never runs. */}
      <script
        dangerouslySetInnerHTML={{
          __html:
            "(function(){var s=document.getElementById('country'),d=document.getElementById('dial');" +
            "if(!s||!d)return;function u(){var o=s.options[s.selectedIndex];" +
            "if(o&&o.dataset.dial)d.textContent=o.dataset.dial;}s.addEventListener('change',u);u();})();",
        }}
      />
    </main>
  );
}
