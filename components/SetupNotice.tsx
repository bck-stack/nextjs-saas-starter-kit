/** Shown instead of crashing when environment variables are missing. */
export function SetupNotice({ missing }: { missing: string[] }) {
  return (
    <div className="alert-error">
      <p className="mb-1 font-semibold">Configuration needed</p>
      <p>
        Add {missing.map((m, i) => (
          <span key={m}>
            <code className="rounded bg-red-900/40 px-1">{m}</code>
            {i < missing.length - 1 ? ", " : ""}
          </span>
        ))}{" "}
        to <code className="rounded bg-red-900/40 px-1">.env.local</code> and restart the dev server.
      </p>
    </div>
  );
}
