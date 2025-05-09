import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/home/Home";
import About from "./pages/about/About";
import Ticket from "./pages/ticket/Ticket";
import Detail from "./pages/ticket/detail/Detail";
import Invoice from "./pages/ticket/invoice/Invoice";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Activities from "./pages/activities/Activities";
import Promo from "./pages/promo/Promo";
import ActivityDetail from "./pages/activitydetail/ActivityDetail";
import Categories from "./pages/categories/Categories";
import { CartProvider } from "./contexts/CartContext";
import Cart from "./pages/cart/Cart";
import Checkout2 from "./pages/ticket/checkout2/Checkout2";
import Checkout from "./pages/checkout/Checkout";
import Transaction from "./pages/transaction/Transaction";
import AdminLayout from "./layouts/adminlayout/AdminLayout";
import UsersTable from "./pages/admin/userstable/UsersTable";
import PromosTable from "./pages/admin/promostable/PromosTable";
import CategoriesTable from "./pages/admin/categoriestable/CategoriesTable";
import CategoryDetail from "./pages/categorydetail/CategoryDetail";
import Services from "./pages/home/services/Services";
import BannersTable from "./pages/admin/bannerstable/BannersTable";
import ActivitiesTable from "./pages/admin/activitiestable/ActivitiesTable";
import MainDashboard from "./pages/admin/maindashboard/MainDashboard";
import AdminTransaction from "./pages/admin/transaction/AdminTransaction";
import Profile from "./pages/profile/Profile";

const App = () => {
  return (
    <CartProvider>
      <Router>
        <ToastContainer />
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Main layout routes (public and user-accessible) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/bus-tickets" element={<Ticket />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:id" element={<CategoryDetail />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/promo" element={<Promo />} />
            <Route path="/carts" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />

            {/* Protected routes for authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/ticket" element={<Ticket />} />
              <Route path="/ticket/:id" element={<Detail />} />
              <Route path="/invoice/:id" element={<Invoice />} />
              <Route path="/checkout2" element={<Checkout2 />} />
              <Route path="/transaction" element={<Transaction />} />
            </Route>
          </Route>

          {/* Admin routes (protected) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route
                index
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route path="dashboard" element={<MainDashboard />} />
              <Route path="users" element={<UsersTable />} />
              <Route path="promos" element={<PromosTable />} />
              <Route path="categories" element={<CategoriesTable />} />
              <Route path="banners" element={<BannersTable />} />
              <Route path="activities" element={<ActivitiesTable />} />
              <Route path="transactions" element={<AdminTransaction />} />
            </Route>
          </Route>

          {/* Catch-all for invalid routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
};

export default App;
