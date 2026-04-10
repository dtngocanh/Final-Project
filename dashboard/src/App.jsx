import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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
import { getUser } from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const { openedComponent } = useSelector((state) => state.extra);
  const { isAuthenticated, isCheckingAuth } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const renderDashboardContent = () => {
    switch (openedComponent) {
      case "Dashboard":
        return <Dashboard />;
      case "Orders":
        return <Orders />;
      case "Users":
        return <Users />;
      case "Profile":
        return <Profile />;
      case "Products":
        return <Products />;
      default:
        return <Dashboard />;
    }
  };

  if (isCheckingAuth) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
           isAuthenticated ? <Navigate to="/" replace /> : <Login />
        } />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div className="flex min-h-screen w-full bg-[#f8faf9] dark:bg-[#050505]">
                <SideBar />
                <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
                  <Header />
                  <div className="flex-1 p-4 md:p-8 pt-2">
                    {renderDashboardContent()}
                  </div>
                </main>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
      <ToastContainer theme="dark" position="bottom-right" />
    </Router>
  );
}
export default App;
