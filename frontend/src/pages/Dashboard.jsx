import React from "react";

export function Dashboard() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold text-slate-800">
          Overview
        </h3>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
          This dashboard summarizes the main modules of the reengineered POS
          system. Use the navigation on the left to manage products, customers,
          employees, coupons, and to record sales, rentals, and returns.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="Products"
          description="Add and maintain sale and rental items, including pricing and inventory."
        />
        <InfoCard
          title="Transactions"
          description="Record sales and rentals, and process returns with calculated totals."
        />
        <InfoCard
          title="Reports"
          description="Use the normalized database for future reporting and analytics."
        />
      </section>
    </div>
  );
}

function InfoCard({ title, description }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="mt-2 text-xs text-slate-600">{description}</p>
    </div>
  );
}


