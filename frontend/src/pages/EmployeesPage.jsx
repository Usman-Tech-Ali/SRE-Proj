import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8000/api";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/employees/`);
      if (!res.ok) throw new Error(`Failed to load employees: ${res.status}`);
      const data = await res.json();
      setEmployees(data);
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h3 className="text-lg font-semibold text-slate-800">Employees</h3>
        <p className="text-sm text-slate-500">
          Read-only view of application employees imported from the legacy
          system (create/update via Django admin).
        </p>
      </header>

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
                  <Th>Username</Th>
                  <Th>Name</Th>
                  <Th>Position</Th>
                  <Th>Active</Th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => (
                  <tr key={e.username} className="border-t border-slate-200">
                    <Td>{e.username}</Td>
                    <Td>
                      {e.first_name} {e.last_name}
                    </Td>
                    <Td>{e.position}</Td>
                    <Td>{e.is_active ? "Yes" : "No"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
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


