import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import SideBar from "./components/SideBar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Orders from "./components/Orders";
import Users from "./components/Users";
import Profile from "./components/Profile";
import Products from "./components/Products";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import InventoryOverview from "./components/dashboard-components/InventoryOverview";

import { getUser } from "./store/slices/authSlice";
import Categories from "./components/Categories";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, isCheckingAuth } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  if (isCheckingAuth)
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  // Component Layout dùng chung cho toàn bộ trang Admin
  const AdminLayout = () => (
    <div className="flex min-h-screen w-full bg-[#f8faf9] dark:bg-[#050505]">
      <SideBar />
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header />
        <div className="flex-1 p-4 md:p-8 pt-2">
          {/* Outlet sẽ hiển thị Dashboard, Orders, v.v. tùy theo URL */}
          <Outlet />
        </div>
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
        />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* Cấu trúc Route lồng nhau */}
        <Route
          path="/"
          element={
            isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />
          }
        >
          {/* index nghĩa là khi vào "/" thì mặc định hiện Dashboard */}
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="products" element={<Products />} />
          <Route path="profile" element={<Profile />} />
          <Route path="inventory" element={<InventoryOverview />} />
          <Route path="categories" element={<Categories />} />
        </Route>
      </Routes>
      <ToastContainer theme="dark" position="bottom-right" />
    </Router>
  );
}
export default App;
