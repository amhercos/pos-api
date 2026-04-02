import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./features/auth/components/login-form";
import { SignupForm } from "./features/auth/components/signup-form";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { MainLayout } from "./components/layout/main-layout";
import { RecordsPage } from "@/features/records/RecordsPage";
import { InventoryPage } from "./features/inventory/InventoryPage";
import NewSalePage from "./features/sale/new-sale-page";
import CreditsPage from "./features/credit/credits-page";
import { Toaster } from "sonner";
import { UnauthorizedPage } from "./features/auth/components/unauthorized-page";
import SettingsPage from "./features/settings/settings-page";
import { initTables } from "./services/db";
import { useEffect } from "react";



function App() {
  useEffect(() => {
    initTables().catch(console.error);
}, []);
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        richColors 
        closeButton
        toastOptions={{
          style: { 
            borderRadius: '20px', 
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            border: 'none',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        }}
      />
      <Routes>
        {/* --- PUBLIC AUTH ROUTES --- */}
        <Route 
          path="/login" 
          element={
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
              <div className="w-full max-w-sm">
                <LoginForm />
              </div>
            </div>
          } 
        />

        <Route 
          path="/register" 
          element={
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50/50">
              <div className="w-full max-w-md">
                <SignupForm />
              </div>
            </div>
          } 
        />

        {/* --- PROTECTED ROUTES --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Any authenticated user can see these */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sales/new" element={<NewSalePage />} />
            <Route path="/credits" element={<CreditsPage/>} />
            <Route path="/settings" element={<SettingsPage/>} />
            
            {/* Standard unauthorized landing page inside layout */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* --- OWNER ONLY ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={["StoreOwner"]} />}>
               <Route path="/inventory" element={<InventoryPage />} />
               <Route path="/reports" element={<RecordsPage />} />
            </Route>
          </Route>
        </Route>
        
        {/* --- GLOBAL REDIRECTS --- */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* 404/Fallback: If logged in, go to dashboard. If not, go to login */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;