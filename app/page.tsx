"use client";

import { useEffect, useState } from "react";

type PexelsPhoto = {
  id: number;
  src: {
    medium: string;
    original: string;
  };
};

export default function Page() {
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("wallpaper");
  const [loading, setLoading] = useState(false);

  // ✅ SAFE EFFECT (async boundary)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);

      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${query}&per_page=20&page=${page}`,
        {
          headers: {
            Authorization: process.env.NEXT_PUBLIC_PEXELS_API_KEY as string,
          },
        }
      );

      const data = await res.json();

      if (!cancelled) {
        setPhotos((prev) => [...prev, ...data.photos]);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, query]);

  // ✅ Infinite scroll (event → allowed)
  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        setPage((p) => p + 1);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ Reset OUTSIDE effect
  const handleSearch = () => {
    setPhotos([]);
    setPage(1);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>📱 Wallify</h1>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search wallpapers..."
      />
      <button onClick={handleSearch}>Search</button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 15,
          marginTop: 20,
        }}
      >
        {photos.map((photo) => (
          <div key={photo.id}>
            <img
              src={photo.src.medium}
              style={{ width: "100%", borderRadius: 8 }}
            />
            <a href={photo.src.original} target="_blank">
              Download
            </a>
          </div>
        ))}
      </div>

      {loading && <p>Loading...</p>}
    </main>
  );
}

