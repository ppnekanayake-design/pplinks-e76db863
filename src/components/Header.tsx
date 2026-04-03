import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LogIn, Upload, Shield, Search } from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-2xl font-bold text-primary neon-text">
          LINKVERSE
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                to="/submit"
                className="flex items-center gap-2 rounded-lg bg-primary/20 px-4 py-2 text-sm text-primary transition hover:bg-primary/30"
              >
                <Upload size={16} />
                Submit Link
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground transition hover:bg-muted"
              >
                <Shield size={16} />
                Admin
              </Link>
              <button
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm text-secondary-foreground transition hover:bg-muted"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
              <LogIn size={16} />
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
