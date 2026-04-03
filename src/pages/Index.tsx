import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import SearchFilters from "@/components/SearchFilters";
import LinkCard from "@/components/LinkCard";

export default function Index() {
  const { user } = useAuth();
  const [links, setLinks] = useState<any[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [visitorCount, setVisitorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
    incrementVisitor();
  }, []);

  useEffect(() => {
    if (user) fetchUserLikes();
  }, [user]);

  const incrementVisitor = async () => {
    const { data } = await supabase.rpc("increment_visitor_count");
    if (data) setVisitorCount(data);
  };

  const fetchLinks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("status", "approved");

    if (data) {
      setLinks(data);
      // Fetch like counts
      const { data: likesData } = await supabase.from("likes").select("link_id");
      if (likesData) {
        const counts: Record<string, number> = {};
        likesData.forEach((l) => {
          counts[l.link_id] = (counts[l.link_id] || 0) + 1;
        });
        setLikes(counts);
      }
    }
    setLoading(false);
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("likes")
      .select("link_id")
      .eq("user_id", user.id);
    if (data) setUserLikes(new Set(data.map((l) => l.link_id)));
  };

  const filtered = links
    .filter((l) => {
      const matchesSearch =
        l.title.toLowerCase().includes(search.toLowerCase()) ||
        (l.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        category === "All" || l.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === "popular") return b.view_count - a.view_count;
      if (sortBy === "most_liked")
        return (likes[b.id] || 0) - (likes[a.id] || 0);
      return 0;
    });

  return (
    <div className="animated-bg min-h-screen">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary neon-text">
            LINKVERSE
          </h1>
          <p className="text-muted-foreground">
            Discover and share amazing links •{" "}
            <span className="text-primary">{visitorCount}</span> visitors
          </p>
        </div>

        <SearchFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          sortBy={sortBy}
          onSortByChange={setSortBy}
        />

        {loading ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            Loading links...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-muted-foreground">
            No links found. Be the first to submit one!
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((link) => (
              <LinkCard
                key={link.id}
                id={link.id}
                title={link.title}
                description={link.description}
                url={link.url}
                image_url={link.image_url}
                category={link.category}
                view_count={link.view_count}
                like_count={likes[link.id] || 0}
                user_liked={userLikes.has(link.id)}
                onLikeToggle={() => {
                  fetchLinks();
                  fetchUserLikes();
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
