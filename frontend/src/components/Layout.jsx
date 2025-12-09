import React from "react";
import { NavLink } from "react-router-dom";

const navLinkBase =
  "block px-3 py-2 rounded-md text-sm font-medium transition-colors";

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200">
        <div className="px-4 py-4 border-b border-slate-200">
          <h1 className="text-lg font-semibold text-primary-600">
            SG Technologies POS
          </h1>
          <p className="text-xs text-slate-500">Reengineered Web System</p>
        </div>
        <nav className="px-3 py-4 space-y-1 text-slate-700">
          <SectionTitle>General</SectionTitle>
          <NavItem to="/">Dashboard</NavItem>

          <SectionTitle>Operations</SectionTitle>
          <NavItem to="/products">Products</NavItem>
          <NavItem to="/customers">Customers</NavItem>
          <NavItem to="/transactions">Transactions</NavItem>
          <NavItem to="/rentals">Rentals</NavItem>

          <SectionTitle>Administration</SectionTitle>
          <NavItem to="/employees">Employees</NavItem>
          <NavItem to="/coupons">Coupons</NavItem>
        </nav>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <h2 className="text-xl font-semibold text-slate-800">
            SG Technologies POS – Web Frontend
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            This UI talks to the Django backend at <code>/api</code> and
            provides product management, billing, rentals, returns, and
            reporting capabilities.
          </p>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `${navLinkBase} ${
          isActive
            ? "bg-primary-50 text-primary-700"
            : "text-slate-700 hover:bg-slate-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

function SectionTitle({ children }) {
  return (
    <div className="mt-4 mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
      {children}
    </div>
  );
}


