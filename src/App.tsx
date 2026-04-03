import { useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import AgeVerification from "@/components/AgeVerification";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import SubmitLink from "@/pages/SubmitLink";
import Admin from "@/pages/Admin";
import Profile from "@/pages/Profile";

export default function App() {
  const [ageVerified, setAgeVerified] = useState(
    localStorage.getItem("age_verified") === "true"
  );

  const handleVerified = useCallback(() => {
    setAgeVerified(true);
  }, []);

  if (!ageVerified) {
    return <AgeVerification onVerified={handleVerified} />;
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/submit" element={<SubmitLink />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </AuthProvider>
  );
}
