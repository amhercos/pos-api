import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "@/features/auth/components/login-form";
import { DashboardPage } from "@/features/dashboard/dashboard-page";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { MainLayout } from "./components/layout/main-layout";

function App() {
  return (
    <BrowserRouter>
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
          <Route path="/sales/new" element={<div>New Sale Page (Coming Soon)</div>} />
          <Route path="/inventory" element={<div>Inventory Page (Coming Soon)</div>} />
          <Route path="/reports" element={<div>Reports Page (Coming Soon)</div>} />
          <Route path="/credits" element={<div>Credits Page (Coming Soon)</div>} />
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