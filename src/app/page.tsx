import { cookies } from "next/headers";

import { PINNED_COUNTRIES, OTHER_COUNTRIES, DEFAULT_COUNTRY_ISO, countryByIso } from "@/lib/countries";
import { DRAFT_COOKIE, EMPTY_DRAFT, decodeDraft } from "@/lib/draft-cookie";
import { getPublicTotals } from "@/lib/db";
import { deadline, isUrgent } from "@/lib/deadline";
import { LANGS, copy, toLang } from "@/lib/strings";
import {
  AMOUNT_OPTIONS,
  CITY_SUGGESTIONS,
  CURRENT_COLLECTION_HIGH,
  CURRENT_COLLECTION_LOW,
  CURRENT_RATE,
  EFFECTIVE_FROM,
  FORM_CLOSES,
  MONTHLY_TARGET,
  ORGANISATION_SHORT,
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

/** An eight-pointed star, tiled. Defined once, drawn by every band. */
function StarDefs() {
  return (
    <svg className="svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="pjmdtf-stars" width="30" height="24" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.15">
            <polygon points="15,2 25,12 15,22 5,12" />
            <rect x="8" y="5" width="14" height="14" />
          </g>
        </pattern>
      </defs>
    </svg>
  );
}

function Band() {
  return (
    <div className="band" aria-hidden="true">
      <svg className="band-art" width="100%" height="24" focusable="false">
        <rect width="100%" height="24" fill="url(#pjmdtf-stars)" />
      </svg>
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const lang = toLang(one(params.lang));
  const t = copy(lang);
  const qs = lang === "en" ? "" : `?lang=${lang}`;

  // The draft is only read when the redirect says there was a problem, so
  // arriving at a bare "/" never shows a stale message from five minutes ago.
  const failed = one(params.e) === "1";
  const payload = failed ? decodeDraft((await cookies()).get(DRAFT_COOKIE)?.value) : null;
  const draft = payload?.draft ?? EMPTY_DRAFT;
  const problem = payload?.message ?? (failed ? t.problemFallback : "");

  const doneRaw = one(params.done);
  const done = /^[0-9]+$/.test(doneRaw) ? Number(doneRaw) : null;
  const wasUpdate = one(params.again) === "1";

  const selectedCountry = countryByIso(draft.country)?.iso ?? DEFAULT_COUNTRY_ISO;
  const selectedDial = countryByIso(selectedCountry)?.dial ?? "+91";

  const when = deadline();
  const totals = await getPublicTotals();

  // The running total, scaled so the ₹25,000 line always has a place to sit.
  const pledged = totals?.pledged ?? 0;
  const scaleMax = Math.max(pledged, MONTHLY_TARGET);
  const fillPercent = scaleMax === 0 ? 0 : (pledged / scaleMax) * 100;
  const targetPercent = scaleMax === 0 ? 100 : (MONTHLY_TARGET / scaleMax) * 100;
  const covered = pledged >= MONTHLY_TARGET;

  return (
    <main className="page page-form">
      <StarDefs />

      <nav className="lang-switch" aria-label={t.switchLabel}>
        <span className="lang-switch-label">{t.switchLabel}</span>
        {LANGS.map((l) =>
          l.code === lang ? (
            <span key={l.code} className="lang-current" aria-current="true">
              {l.label}
            </span>
          ) : (
            <a key={l.code} href={l.code === "en" ? "/" : `/?lang=${l.code}`}>
              {l.label}
            </a>
          ),
        )}
      </nav>

      <header className="masthead">
        <p className="arabic arabic-open" dir="rtl" lang="ar">
          السلام عليكم ورحمة الله وبركاته
        </p>
        <p className="eyebrow">{ORGANISATION_SHORT}</p>
        <h1>{t.title}</h1>
        <p className="standfirst">{t.standfirst}</p>
        <Band />
      </header>

      <div className={"action-bar" + (isUrgent(when) ? " action-bar-urgent" : "")}>
        <p className="countdown">
          {when.state === "open" && t.daysLeft(when.days)}
          {when.state === "last-day" && t.lastDay}
          {when.state === "closed" && t.closed(FORM_CLOSES)}
        </p>
        <p className="jump">
          <a href="#form">{t.jumpToForm} &darr;</a>
        </p>
      </div>

      <div className="columns">
        <div className="column-case">
          {totals && (
            <section className="progress" aria-labelledby="progress-heading">
              <h2 id="progress-heading">{t.progressHeading}</h2>
              {totals.members === 0 ? (
                <p>{t.progressEmpty}</p>
              ) : (
                <>
                  <p className="progress-joined">{t.progressJoined(totals.members)}</p>
                  <div
                    className="meter"
                    role="img"
                    aria-label={t.progressBarLabel(
                      formatRupees(pledged),
                      formatRupees(MONTHLY_TARGET),
                    )}
                  >
                    <div className="meter-fill" style={{ width: fillPercent + "%" }} />
                    <div className="meter-target" style={{ left: targetPercent + "%" }} />
                  </div>
                  <p className="progress-of">
                    {t.progressOf(formatRupees(pledged), formatRupees(MONTHLY_TARGET))}
                  </p>
                  {covered && <p className="progress-covered">{t.progressCovered}</p>}
                </>
              )}
            </section>
          )}

          <section className="prose" aria-labelledby="obligation">
            <h2 id="obligation">{t.obligationHeading}</h2>
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
                  <th scope="row">{t.roleTotal}</th>
                  <td className="figure">{formatRupees(MONTHLY_TARGET)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="prose" aria-labelledby="standing">
            <h2 id="standing">{t.standingHeading}</h2>
            <p>
              {t.standingBody(
                formatRupees(CURRENT_RATE),
                formatRupees(CURRENT_COLLECTION_LOW),
                formatRupees(CURRENT_COLLECTION_HIGH),
                formatRupees(MONTHLY_TARGET),
              )}
            </p>

            <p className="headline-figure">
              <span className="headline-figure-amount">
                {formatRupees(SHORTFALL_LOW)} &ndash; {formatRupees(SHORTFALL_HIGH)}
              </span>
              <span className="headline-figure-label">{t.shortfallLabel}</span>
            </p>

            <p>{t.standingAfter}</p>
          </section>

          <section className="prose" aria-labelledby="ask">
            <h2 id="ask">{t.askHeading}</h2>
            <p className="equation" aria-hidden="true">
              <span className="equation-part">{TARGET_MEMBERS}</span>
              <span className="equation-sign">&times;</span>
              <span className="equation-part">{formatRupees(SUGGESTED_AMOUNT)}</span>
              <span className="equation-sign">=</span>
              <span className="equation-total">{formatRupees(MONTHLY_TARGET)}</span>
            </p>
            <p className="visually-hidden">
              {t.askEquation(
                TARGET_MEMBERS,
                formatRupees(SUGGESTED_AMOUNT),
                formatRupees(MONTHLY_TARGET),
              )}
            </p>
            <p>{t.askBody}</p>
            <p className="notice">{t.notice}</p>
          </section>

          <section className="prose" aria-labelledby="dates">
            <h2 id="dates">{t.datesHeading}</h2>
            <dl className="dates">
              <div>
                <dt>{t.formCloses}</dt>
                <dd>{FORM_CLOSES}</dd>
              </div>
              <div>
                <dt>{t.effectiveFrom}</dt>
                <dd>{EFFECTIVE_FROM}</dd>
              </div>
            </dl>
            <p>{t.whoFor}</p>
          </section>
        </div>

        <div className="column-form">
          <section className="form-section" id="form" aria-labelledby="form-heading">
            <h2 id="form-heading">{done !== null ? " " : t.formHeading}</h2>

            {done !== null ? (
              <div className="confirmation" role="status">
                <p className="confirmation-tick" aria-hidden="true">
                  &#10003;
                </p>
                <p className="confirmation-heading">
                  {wasUpdate ? t.doneUpdatedHeading : t.doneHeading}
                </p>
                <p className="confirmation-amount">{t.doneAmount(formatRupees(done))}</p>
                <p className="confirmation-effective">{t.doneEffective(EFFECTIVE_FROM)}</p>
                <Band />
                <p className="hint">
                  <a href={`/${qs}#form`}>{t.doneChange}</a>
                </p>
              </div>
            ) : (
              <>
                {problem !== "" && (
                  <p className="banner banner-problem" role="alert">
                    {problem}
                  </p>
                )}

                <form method="post" action="/api/join" className="form">
                  <input type="hidden" name="lang" value={lang} />

                  <fieldset className="step">
                    <legend>
                      <span className="step-number" aria-hidden="true">
                        1
                      </span>
                      {t.step1}
                    </legend>

                    <div className="field">
                      <label htmlFor="fullName">{t.fullName}</label>
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
                      <label htmlFor="country">{t.country}</label>
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
                      <label htmlFor="phone">{t.mobile}</label>
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
                      <p className="hint">{t.mobileHint}</p>
                    </div>

                    <div className="field">
                      <label htmlFor="email">
                        {t.email} <span className="optional">{t.optional}</span>
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
                  </fieldset>

                  <fieldset className="step">
                    <legend>
                      <span className="step-number" aria-hidden="true">
                        2
                      </span>
                      {t.step2}
                    </legend>

                    <div className="field">
                      <label htmlFor="address">{t.address}</label>
                      <textarea
                        id="address"
                        name="address"
                        required
                        rows={4}
                        maxLength={ADDRESS_MAX}
                        autoComplete="street-address"
                        defaultValue={draft.address}
                      />
                      <p className="hint">{t.addressHint}</p>
                    </div>

                    <div className="field">
                      <label htmlFor="city">{t.city}</label>
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
                  </fieldset>

                  <fieldset className="step amounts-field">
                    <legend>
                      <span className="step-number" aria-hidden="true">
                        3
                      </span>
                      {t.step3}
                    </legend>

                    <p className="amount-question">{t.amountLegend}</p>

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
                            <span className="amount-note">{t.amountCovers(TARGET_MEMBERS)}</span>
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
                        <span className="amount-value amount-value-other">{t.amountOther}</span>
                      </label>
                    </div>

                    <div className="other-box">
                      <label htmlFor="otherAmount">{t.otherLabel}</label>
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
                    <button type="submit">{t.submit}</button>
                    <p className="hint">{t.refillHint}</p>
                  </div>
                </form>
              </>
            )}
          </section>
        </div>
      </div>

      <footer className="closing">
        <Band />
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
