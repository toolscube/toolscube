"use client";

import { useEffect, useState } from "react";

export function GitHubStars() {
  const [stars, setStars] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStars() {
      try {
        const res = await fetch(
          "https://api.github.com/repos/toolscube/toolscube",
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          setStars(data.stargazers_count || 0);
        }
      } catch (error) {
        console.error("Error fetching GitHub stars:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStars();
  }, []);

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <span className="text-xs font-semibold tabular-nums opacity-50">0</span>
    );
  }

  return (
    <span className="text-xs font-semibold tabular-nums">
      {stars > 0 ? formatStars(stars) : "0"}
    </span>
  );
}
