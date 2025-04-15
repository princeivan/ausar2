import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StoreProvider } from "./context/StoreContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import CustomBranding from "./pages/CustomBranding";

const AdminElements = () => <div>Elements Page</div>;
const AdminForms = () => <div>Forms Page</div>;
const AdminCalendar = () => <div>Calendar Page</div>;
const AdminSettings = () => <div>Settings Page</div>;
const AdminBackups = () => <div>Backups Page</div>;
const AdminLogs = () => <div>Logs Page</div>;

import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminCategoryPage from "./pages/admin/AdminCategoryPage";
import ProtectedRoute from "./components/ProtectedRoute";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Routes>
                {/* Admin Routes */}

                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/orders" element={<AdminOrdersPage />} />
                <Route path="/admin/category" element={<AdminCategoryPage />} />
                <Route path="/admin/elements" element={<AdminElements />} />
                <Route path="/admin/forms" element={<AdminForms />} />
                <Route path="/admin/calendar" element={<AdminCalendar />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/backups" element={<AdminBackups />} />
                <Route path="/admin/logs" element={<AdminLogs />} />

                {/* Public Routes */}
                <Route
                  path="*"
                  element={
                    <>
                      <Navbar />
                      <main className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route
                            path="/products/:id"
                            element={<ProductDetail />}
                          />
                          <Route path="/cart" element={<Cart />} />
                          <Route
                            path="/checkout"
                            element={
                              <ProtectedRoute>
                                <Checkout />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route
                            path="/account"
                            element={
                              <ProtectedRoute>
                                <Account />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/custom-branding"
                            element={<CustomBranding />}
                          />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                    </>
                  }
                />
              </Routes>
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </StoreProvider>
    </QueryClientProvider>
  );
}

export default App;
