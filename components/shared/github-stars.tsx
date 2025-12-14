import { Suspense } from "react";

async function getGitHubStars() {
  try {
    const res = await fetch(
      "https://api.github.com/repos/toolscube/tools-cube",
      {
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch stars");
    }

    const data = await res.json();
    return data.stargazers_count || 0;
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return 0;
  }
}

async function GitHubStarsCount() {
  const stars = await getGitHubStars();

  const formatStars = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <span className="text-xs font-semibold tabular-nums">
      {stars > 0 ? formatStars(stars) : "0"}
    </span>
  );
}

function GitHubStarsSkeleton() {
  return (
    <span className="text-xs font-semibold tabular-nums opacity-50">0</span>
  );
}

export function GitHubStars() {
  return (
    <Suspense fallback={<GitHubStarsSkeleton />}>
      <GitHubStarsCount />
    </Suspense>
  );
}
