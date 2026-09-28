"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main>
      <p>Unable to load the dashboard.</p>
      <button type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
