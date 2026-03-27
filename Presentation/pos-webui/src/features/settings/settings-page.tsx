import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Store, 
  Lock, 
  UserCircle, 
  Loader2, 
  Eye, 
  EyeOff 
} from "lucide-react"; // Added Eye icons
import { useSettings } from "./hooks/use-settings";
import { toast } from "sonner";
import { type StoreSettings } from "./types/settings";

export default function SettingsPage() {
  const { 
    loading, 
    getStoreSettings, 
    getProfile, 
    updateStore, 
    updateProfile, 
    changePassword 
  } = useSettings();

  // --- States ---
  const [storeData, setStoreData] = useState<StoreSettings>({
    storeName: "",
    location: "",
    lowStockThreshold: 0,
    nearExpiryAlertDays: 30,
  });

  const [profileData, setProfileData] = useState({
    fullName: "",
    userName: ""
  });

  const [passwords, setPasswords] = useState({ 
    current: "", 
    new: "", 
    confirm: "" 
  });

  // New state to toggle password visibility for each field
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Load Data ---
  useEffect(() => {
    const loadInitialData = async () => {
      const [store, profile] = await Promise.all([
        getStoreSettings(),
        getProfile()
      ]);
      
      if (store) {
        setStoreData({
          storeName: store.storeName || "",
          location: store.location || "",
          lowStockThreshold: store.lowStockThreshold,
          nearExpiryAlertDays: store.nearExpiryAlertDays,
        });
      }

      if (profile) {
        setProfileData({
          fullName: profile.fullName || "",
          userName: profile.userName || ""
        });
      }
    };
    loadInitialData();
  }, [getStoreSettings, getProfile]);

  // --- Handlers ---
  const handleUpdateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStore(storeData);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(profileData);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new) {
      return toast.error("Please fill in all password fields");
    }
    if (passwords.new !== passwords.confirm) {
      return toast.error("New passwords do not match");
    }
    const success = await changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
    if (success) {
      setPasswords({ current: "", new: "", confirm: "" });
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto w-full bg-white min-h-screen text-slate-900 overflow-y-auto custom-scrollbar">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-slate-500">Manage your business profile and account security.</p>
      </div>

      <Separator className="bg-slate-100" />

      {/* 1. USER PROFILE SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <UserCircle className="h-4 w-4" />
            <h3>Personal Profile</h3>
          </div>
          <p className="text-xs text-slate-400">Your personal account identity.</p>
        </div>
        
        <form onSubmit={handleUpdateProfile} className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Full Name</Label>
              <Input 
                value={profileData.fullName}
                onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                className="h-10 border-slate-200 focus-visible:ring-slate-200" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Username / Email</Label>
              <Input 
                value={profileData.userName}
                onChange={(e) => setProfileData({...profileData, userName: e.target.value})}
                className="h-10 border-slate-200 focus-visible:ring-slate-200" 
              />
            </div>
          </div>
          <Button disabled={loading} size="sm" className="bg-slate-900 hover:bg-black text-white px-6 h-9 text-xs font-bold rounded-lg transition-all">
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </section>

      <Separator className="bg-slate-100" />

      {/* 2. BUSINESS PROFILE SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Store className="h-4 w-4" />
            <h3>Business Profile</h3>
          </div>
          <p className="text-xs text-slate-400">Information used for receipts and alerts.</p>
        </div>
        
        <form onSubmit={handleUpdateStore} className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Store Name</Label>
              <Input 
                value={storeData.storeName}
                onChange={(e) => setStoreData({...storeData, storeName: e.target.value})}
                className="h-10 border-slate-200" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Location</Label>
              <Input 
                value={storeData.location}
                onChange={(e) => setStoreData({...storeData, location: e.target.value})}
                className="h-10 border-slate-200" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Low Stock Threshold</Label>
              <Input 
                type="number"
                value={storeData.lowStockThreshold === 0 ? "" : storeData.lowStockThreshold}
                placeholder="0"
                onChange={(e) => {
                  const val = e.target.value;
                  setStoreData({...storeData, lowStockThreshold: val === "" ? 0 : parseInt(val)});
                }}
                className="h-10 border-slate-200" 
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">
                Near Expiry Alert (Days Before)
              </Label>
              <Input 
                type="number"
                min="1"
                value={storeData.nearExpiryAlertDays || ""}
                placeholder="30"
                onChange={(e) => {
                  const val = e.target.value;
                  setStoreData({...storeData, nearExpiryAlertDays: val === "" ? 0 : parseInt(val)});
                }}
                className="h-10 border-slate-200" 
              />
              <p className="text-[10px] text-slate-400">Products expiring within this many days will trigger an alert.</p>
            </div>
          </div>

          <Button disabled={loading} size="sm" className="bg-slate-900 hover:bg-black text-white px-6 h-9 text-xs font-bold rounded-lg transition-all">
            {loading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
            Save Store Settings
          </Button>
        </form>
      </section>

      <Separator className="bg-slate-100" />

      {/* 3. SECURITY SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-20">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Lock className="h-4 w-4" />
            <h3>Security</h3>
          </div>
          <p className="text-xs text-slate-400">Update your account password.</p>
        </div>

        <form onSubmit={handleChangePassword} className="md:col-span-2 space-y-4">
          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-500 uppercase">Current Password</Label>
              <div className="relative">
                <Input 
                  type={showCurrent ? "text" : "password"}
                  value={passwords.current}
                  onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                  className="h-10 border-slate-200 pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase">New Password</Label>
                <div className="relative">
                  <Input 
                    type={showNew ? "text" : "password"}
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="h-10 border-slate-200 pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="h-10 border-slate-200 pr-10" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Button variant="outline" disabled={loading} className="border-slate-200 hover:bg-slate-50 px-8 h-10 text-xs font-bold rounded-lg">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </section>
    </div>
  );
}