import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import CustomerPage from "./pages/CustomerPage";
import ResellerPage from "./pages/ResellerPage";

function Nav() {
  const { pathname } = useLocation();

  return (
    <div className="navWrap">
      <div className="nav">
        <Link className={pathname === "/admin" ? "active" : ""} to="/admin">
          Admin
        </Link>
        <Link className={pathname === "/customer" ? "active" : ""} to="/customer">
          Customer
        </Link>
        <Link className={pathname === "/reseller" ? "active" : ""} to="/reseller">
          Reseller
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="container">
      <h1 className="title">Digital Coupon Marketplace</h1>
      <p className="subtitle">Minimal UI for Admin / Customer / Reseller flows.</p>

      <div className="pageNav">
        <Nav />
      </div>

      <div className="card">
        <Routes>
          <Route path="/" element={<Navigate to="/customer" replace />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/customer" element={<CustomerPage />} />
          <Route path="/reseller" element={<ResellerPage />} />
        </Routes>
      </div>
    </div>
  );
}