import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] text-center p-6">
      <div className="bg-rose-50 p-6 rounded-full mb-6">
        <ShieldAlert className="h-12 w-12 text-rose-500" />
      </div>
      <h1 className="text-3xl font-black text-slate-900 mb-2">Access Denied</h1>
      <p className="text-slate-500 max-w-sm mb-8">
        You do not have permission to view this page. This area is reserved for store owners only.
      </p>
      <Button 
        onClick={() => navigate("/dashboard")} 
        className="bg-slate-900 hover:bg-slate-800 rounded-xl px-8"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}