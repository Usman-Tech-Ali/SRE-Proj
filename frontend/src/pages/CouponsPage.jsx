import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000/api";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    code: "",
    discount_percent: "10.00",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/coupons/`);
      if (!res.ok) throw new Error(`Failed to load coupons: ${res.status}`);
      const data = await res.json();
      setCoupons(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/coupons/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`Failed to create coupon: ${res.status}`);
      setForm({ code: "", discount_percent: "10.00" });
      await loadCoupons();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-slate-800">Coupons</h3>
        <p className="text-sm text-slate-500">
          Manage coupon codes that replace the legacy <code>couponNumber.txt</code>.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          {loading && <p className="text-sm text-slate-500">Loading…</p>}
          {error && (
            <p className="text-sm text-red-600 mb-2">Error: {error}</p>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <Th>Code</Th>
                    <Th>Discount %</Th>
                    <Th>Active</Th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.code} className="border-t border-slate-200">
                      <Td>{c.code}</Td>
                      <Td>{c.discount_percent}</Td>
                      <Td>{c.is_active ? "Yes" : "No"}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-800 mb-3">
            Add coupon
          </h4>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Field label="Code">
              <input
                type="text"
                className="w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                required
              />
            </Field>
            <Field label="Discount percent">
              <input
                type="number"
                step="0.01"
                className="w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={form.discount_percent}
                onChange={(e) =>
                  setForm({ ...form, discount_percent: e.target.value })
                }
                required
              />
            </Field>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-primary-700"
            >
              Save coupon
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({ children }) {
  return <td className="px-3 py-2 text-xs text-slate-700">{children}</td>;
}

function Field({ label, children }) {
  return (
    <label className="block text-xs text-slate-700 space-y-1">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}


