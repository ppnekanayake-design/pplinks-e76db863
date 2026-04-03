import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ChallengeModalProps {
  onComplete: () => void;
  onClose: () => void;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  language: string;
  starter_code: string;
  expected_output: string;
  level: number;
}

export default function ChallengeModal({
  onComplete,
  onClose,
}: ChallengeModalProps) {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [selectedLang, setSelectedLang] = useState("python");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge();
  }, [selectedLang]);

  const fetchChallenge = async () => {
    setLoading(true);
    // Get user's current level for this language
    let level = 1;
    if (user) {
      const { data: progress } = await supabase
        .from("user_progress")
        .select("current_level")
        .eq("user_id", user.id)
        .eq("language", selectedLang)
        .maybeSingle();
      if (progress) level = progress.current_level;
    }

    const { data } = await supabase
      .from("challenges")
      .select("*")
      .eq("language", selectedLang)
      .eq("level", level)
      .limit(1)
      .maybeSingle();

    if (data) {
      setChallenge(data);
      setCode(data.starter_code || "");
    } else {
      // If no challenge for this level, get any
      const { data: fallback } = await supabase
        .from("challenges")
        .select("*")
        .eq("language", selectedLang)
        .limit(1)
        .maybeSingle();
      if (fallback) {
        setChallenge(fallback);
        setCode(fallback.starter_code || "");
      }
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!challenge) return;

    // Simple validation: check if code contains expected output
    const trimmedCode = code.trim().toLowerCase();
    const expected = challenge.expected_output.trim().toLowerCase();

    if (trimmedCode.includes(expected)) {
      // Update user progress
      if (user) {
        const { data: existing } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("language", selectedLang)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("user_progress")
            .update({
              challenges_completed: existing.challenges_completed + 1,
              current_level: existing.current_level + 1,
            })
            .eq("id", existing.id);
        } else {
          await supabase.from("user_progress").insert({
            user_id: user.id,
            language: selectedLang,
            challenges_completed: 1,
            current_level: 2,
          });
        }
      }
      onComplete();
    } else {
      toast.error("Incorrect solution. Try again!");
    }
  };

  const languages = ["python", "html", "csharp", "javascript"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-3xl rounded-2xl border border-border bg-card p-6 neon-glow">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
        >
          <X size={20} />
        </button>

        <h2 className="mb-4 text-xl font-bold text-primary neon-text">
          Complete a Challenge
        </h2>

        <div className="mb-4 flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                selectedLang === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading challenge...
          </div>
        ) : challenge ? (
          <>
            <div className="mb-4 rounded-lg bg-secondary p-4">
              <h3 className="mb-1 font-semibold text-foreground">
                {challenge.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {challenge.description}
              </p>
            </div>

            <div className="mb-4 overflow-hidden rounded-lg border border-border">
              <Editor
                height="250px"
                language={
                  selectedLang === "csharp" ? "csharp" : selectedLang
                }
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition hover:brightness-110 neon-glow"
            >
              Submit Solution
            </button>
          </>
        ) : (
          <p className="text-muted-foreground">
            No challenges available for this language yet.
          </p>
        )}
      </div>
    </div>
  );
}
