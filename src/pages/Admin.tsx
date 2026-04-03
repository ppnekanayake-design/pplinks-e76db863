import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Header from "@/components/Header";
import { Check, X, Trash2 } from "lucide-react";

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [links, setLinks] = useState<any[]>([]);
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending");

  const handleLogin = () => {
    if (password === "admin123") {
      setAuthenticated(true);
      fetchLinks();
    } else {
      toast.error("Wrong password");
    }
  };

  const fetchLinks = async () => {
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("status", tab)
      .order("created_at", { ascending: false });
    if (data) setLinks(data);
  };

  useEffect(() => {
    if (authenticated) fetchLinks();
  }, [tab, authenticated]);

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("links").update({ status }).eq("id", id);
    toast.success(`Link ${status}`);
    fetchLinks();
  };

  const deleteLink = async (id: string) => {
    await supabase.from("links").delete().eq("id", id);
    toast.success("Link deleted");
    fetchLinks();
  };

  if (!authenticated) {
    return (
      <div className="animated-bg flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card/90 p-8 backdrop-blur-xl neon-glow">
          <h1 className="mb-6 text-center text-2xl font-bold text-primary neon-text">
            Admin Access
          </h1>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="mb-4 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition hover:brightness-110 neon-glow"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animated-bg min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-primary neon-text">
          Admin Dashboard
        </h1>

        <div className="mb-6 flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {links.length === 0 ? (
          <p className="text-muted-foreground">No {tab} links.</p>
        ) : (
          <div className="space-y-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {link.title}
                  </h3>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {link.url}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {link.category} • Views: {link.view_count}
                  </p>
                </div>
                <div className="flex gap-2">
                  {tab === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(link.id, "approved")}
                        className="rounded-lg bg-green-600 p-2 text-white transition hover:bg-green-700"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => updateStatus(link.id, "rejected")}
                        className="rounded-lg bg-red-600 p-2 text-white transition hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="rounded-lg bg-destructive p-2 text-destructive-foreground transition hover:brightness-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
