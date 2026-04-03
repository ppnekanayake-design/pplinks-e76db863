import { useState } from "react";
import { Heart, Eye, ExternalLink, Code } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ChallengeModal from "./ChallengeModal";

interface LinkCardProps {
  id: string;
  title: string;
  description: string | null;
  url: string;
  image_url: string | null;
  category: string;
  view_count: number;
  like_count: number;
  user_liked: boolean;
  onLikeToggle: () => void;
}

export default function LinkCard({
  id,
  title,
  description,
  url,
  image_url,
  category,
  view_count,
  like_count,
  user_liked,
  onLikeToggle,
}: LinkCardProps) {
  const { user } = useAuth();
  const [showChallenge, setShowChallenge] = useState(false);

  const handleVisit = async () => {
    // Increment view count
    await supabase.rpc("increment_view_count", { link_id: id });

    if (user) {
      // Challenge mode for logged-in users
      setShowChallenge(true);
    } else {
      // Direct access for guests
      window.open(url, "_blank");
    }
  };

  const handleChallengeComplete = () => {
    setShowChallenge(false);
    window.open(url, "_blank");
    toast.success("Challenge completed! Link unlocked.");
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like links");
      return;
    }

    if (user_liked) {
      await supabase.from("likes").delete().eq("link_id", id).eq("user_id", user.id);
    } else {
      await supabase.from("likes").insert({ link_id: id, user_id: user.id });
    }
    onLikeToggle();
  };

  return (
    <>
      <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        {image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={image_url}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full bg-primary/20 px-3 py-0.5 text-xs text-primary">
              {category}
            </span>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye size={14} /> {view_count}
              </span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 transition ${
                  user_liked
                    ? "text-accent"
                    : "text-muted-foreground hover:text-accent"
                }`}
              >
                <Heart size={14} fill={user_liked ? "currentColor" : "none"} />{" "}
                {like_count}
              </button>
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
              {description}
            </p>
          )}
          <button
            onClick={handleVisit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 neon-glow"
          >
            {user ? (
              <>
                <Code size={16} /> Complete Challenge to Visit
              </>
            ) : (
              <>
                <ExternalLink size={16} /> Visit Link
              </>
            )}
          </button>
        </div>
      </div>

      {showChallenge && (
        <ChallengeModal
          onComplete={handleChallengeComplete}
          onClose={() => setShowChallenge(false)}
        />
      )}
    </>
  );
}
