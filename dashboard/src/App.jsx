import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SideBar from "./components/SideBar";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";

import Dashboard from "./components/Dashboard";
import Orders from "./components/Orders";
import Users from "./components/Users";
import Profile from "./components/Profile";
import Products from "./components/Products";
function App() {
  const { openedComponent } = useSelector((state) => state.extra);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

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

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/password/forgot" element={<ForgotPassword />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />

        {/* Protected Admin Route */}
       <Route
        path="/"
        element={
          isAuthenticated && user?.role === "Seller" ? (
            <div className="flex min-h-screen w-full bg-white">
              <SideBar />
              {/* THÊM THẺ DIV NÀY ĐỂ CHỨA NỘI DUNG */}
              <main className="flex-1 overflow-y-auto">
                {renderDashboardContent()}
              </main>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
      <ToastContainer theme="dark" />
    </Router>
  );
}

export default App;
