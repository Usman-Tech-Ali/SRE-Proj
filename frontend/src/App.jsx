import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AdminDashboard from "./pages/AdminDashboard";
import CashierDashboard from "./pages/CashierDashboard";
import ProductsPage from "./pages/ProductsPage";
import CustomersPage from "./pages/CustomersPage";
import InventoryPage from "./pages/InventoryPage";
import TransactionsPage from "./pages/TransactionsPage";
import RentalsPage from "./pages/RentalsPage";
import SalePage from "./pages/SalePage";
import RentalPage from "./pages/RentalPage";
import ReturnPage from "./pages/ReturnPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/cashier" element={<CashierDashboard />} />
      <Route path="/sale" element={<SalePage />} />
      <Route path="/rental" element={<RentalPage />} />
      <Route path="/return" element={<ReturnPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/rentals" element={<RentalsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
