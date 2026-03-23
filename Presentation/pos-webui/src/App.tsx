import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/login-form";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { MainLayout } from "./components/layout/main-layout";
import { RecordsPage } from "@/features/records/RecordsPage";
import { InventoryPage } from "./features/inventory/InventoryPage";
import CreditsPage from "./features/credit/credits-page";
import { Toaster } from "sonner";

function App() {
  return (
    <BrowserRouter>
    <Toaster 
  position="top-right"
  richColors 
  closeButton
  toastOptions={{
    style: { 
      zIndex: 99999,
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
        <Route 
          path="/login" 
          element={
            <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
              <div className="w-full max-w-sm">
                <LoginForm />
              </div>
            </div>
          } 
        />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales/new" element={<div>New Sale Page (Coming soon)</div>} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/reports" element={<RecordsPage />} />
          <Route path="/credits" element={<CreditsPage/>} />
          <Route path="/settings" element={<div>Settings Page (Coming Soon)</div>} />
      </Route>
    </Route>
       
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;