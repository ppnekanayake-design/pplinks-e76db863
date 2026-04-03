import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export default function Profile() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (data) setProgress(data);
        });
    }
  }, [user]);

  return (
    <div className="animated-bg min-h-screen">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-2xl border border-border bg-card/90 p-8 backdrop-blur-xl neon-glow">
          <h1 className="mb-4 text-2xl font-bold text-primary neon-text">
            Profile
          </h1>
          <p className="mb-6 text-muted-foreground">{user?.email}</p>

          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Challenge Progress
          </h2>
          {progress.length === 0 ? (
            <p className="text-muted-foreground">
              No challenges completed yet.
            </p>
          ) : (
            <div className="space-y-3">
              {progress.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg bg-secondary p-4"
                >
                  <span className="font-medium capitalize text-foreground">
                    {p.language}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Level {p.current_level} •{" "}
                    {p.challenges_completed} completed
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
