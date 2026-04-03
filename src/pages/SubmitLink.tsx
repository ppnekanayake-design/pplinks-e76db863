import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";

export default function SubmitLink() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(path, imageFile);

      if (uploadError) {
        toast.error("Failed to upload image");
        setLoading(false);
        return;
      }

      const { data: publicUrl } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(path);
      finalImageUrl = publicUrl.publicUrl;
    }

    const { error } = await supabase.from("links").insert({
      title,
      url,
      description: description || null,
      category,
      image_url: finalImageUrl || null,
      submitted_by: user.id,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to submit link");
    } else {
      toast.success("Link submitted for review!");
      navigate("/");
    }
    setLoading(false);
  };

  const categories = [
    "Entertainment",
    "Education",
    "Technology",
    "Gaming",
    "Social",
    "Other",
  ];

  return (
    <div className="animated-bg min-h-screen">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-8">
        <div className="rounded-2xl border border-border bg-card/90 p-8 backdrop-blur-xl neon-glow">
          <h1 className="mb-6 text-2xl font-bold text-primary neon-text">
            Submit a Link
          </h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="url"
              placeholder="URL (https://...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="url"
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">
                Or upload an image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-muted-foreground file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50 neon-glow"
            >
              {loading ? "Submitting..." : "Submit Link"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
