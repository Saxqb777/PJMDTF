import { JAMAAT, ORGANISATION } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Search = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Enter({ searchParams }: { searchParams: Search }) {
  const params = await searchParams;
  const refused = (Array.isArray(params.e) ? params.e[0] : params.e) === "1";

  return (
    <main className="page gate">
      <header className="masthead">
        <p className="eyebrow">{ORGANISATION}</p>
        <h1>Contribution report</h1>
        <p className="standfirst">{JAMAAT} &middot; Managing Committee only</p>
        <div className="band" aria-hidden="true" />
      </header>

      <section className="form-section">
        {refused && (
          <p className="banner banner-problem" role="alert">
            That password is not right. Please try again.
          </p>
        )}

        <form method="post" action="/api/enter" className="form">
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              autoComplete="current-password"
              autoFocus
            />
            <p className="hint">
              This report lists members&rsquo; contact details, so it is kept behind a password.
            </p>
          </div>

          <div className="submit-row">
            <button type="submit">Open the report</button>
          </div>
        </form>

        <p className="hint">
          <a href="/">Back to the contribution form</a>
        </p>
      </section>
    </main>
  );
}
