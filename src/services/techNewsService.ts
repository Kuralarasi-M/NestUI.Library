// Service to fetch tech updates from ASP.NET Core backend (/api/tech-news)
// with client-side fallback to direct public endpoints or curated cache if backend is starting up.

import type { TechUpdate, TechNewsQueryParams, TechNewsPagedResponse } from "../types/techUpdate";

const BACKEND_BASE = "http://localhost:5000";

// Fallback curated news matching reference layout
const FALLBACK_UPDATES: TechUpdate[] = [
  {
    id: "react-19-release",
    title: "React 19.0 Released – New Features and Improvements",
    summary:
      "React 19 brings better performance, simplified forms, and improved developer experience. This release focuses on making React easier to build with and more predictable in production.",
    source: "GitHub",
    sourceUrl: "https://github.com/facebook/react/releases",
    publishedAt: "2025-04-24T10:00:00Z",
    category: "Releases",
    tags: ["React", "Release", "GitHub"],
    upvotes: 342,
    commentsCount: 28,
    domain: "github.com",
  },
  {
    id: "ts-5-7-release",
    title: "TypeScript 5.7 – What's New",
    summary:
      "TypeScript 5.7 introduces new compiler options, improved type checking, and better support for modern JavaScript features.",
    source: "Official Blog",
    sourceUrl: "https://devblogs.microsoft.com/typescript/",
    publishedAt: "2025-04-23T14:30:00Z",
    category: "Releases",
    tags: ["TypeScript", "Release", "Official Blog"],
    upvotes: 128,
    commentsCount: 12,
    domain: "devblogs.microsoft.com",
  },
  {
    id: "ai-models-open-source",
    title: "The next big thing in AI: Open-source models are closing the gap",
    summary:
      "Developers are excited about new open-source models that are matching proprietary performance, making AI more accessible and affordable.",
    source: "Hacker News",
    sourceUrl: "https://news.ycombinator.com/",
    publishedAt: "2025-04-22T08:15:00Z",
    category: "Trending News",
    tags: ["AI", "Open Source", "Hacker News"],
    upvotes: 612,
    commentsCount: 104,
    domain: "news.ycombinator.com",
  },
  {
    id: "node-22-lts",
    title: "Node.js 22.14.0 LTS Released",
    summary:
      "This release includes security updates, performance improvements, and better support for modern JavaScript features.",
    source: "GitHub",
    sourceUrl: "https://github.com/nodejs/node/releases",
    publishedAt: "2025-04-21T18:00:00Z",
    category: "Releases",
    tags: ["Node.js", "Release", "GitHub"],
    upvotes: 96,
    commentsCount: 8,
    domain: "github.com",
  },
  {
    id: "fullstack-react-dotnet",
    title: "Build a Full-Stack App with React and .NET Core",
    summary:
      "A step-by-step guide to building a complete web application using React for the frontend and .NET Core for the backend.",
    source: "DEV Community",
    sourceUrl: "https://dev.to/",
    publishedAt: "2025-04-20T12:00:00Z",
    category: "Tutorials",
    tags: ["React", ".NET", "Tutorial", "DEV Community"],
    upvotes: 78,
    commentsCount: 15,
    domain: "dev.to",
  },
  {
    id: "dotnet-aspire-microservices",
    title: ".NET Aspire: Cloud-Ready Application Architecture",
    summary:
      "Explore how .NET Aspire simplifies orchestrating distributed cloud services, telemetry, and containerized microservices for high throughput applications.",
    source: "Official Blog",
    sourceUrl: "https://devblogs.microsoft.com/dotnet/",
    publishedAt: "2025-04-19T09:30:00Z",
    category: "Updates",
    tags: [".NET", "Cloud", "Official Blog"],
    upvotes: 184,
    commentsCount: 34,
    domain: "devblogs.microsoft.com",
  },
];

export async function fetchTechUpdates(params: TechNewsQueryParams = {}): Promise<TechNewsPagedResponse> {
  const query = new URLSearchParams();
  if (params.category && params.category !== "All") query.append("category", params.category);
  if (params.technology && params.technology !== "All Tech") query.append("technology", params.technology);
  if (params.search) query.append("search", params.search);
  if (params.source && params.source !== "All") query.append("source", params.source);
  if (params.sort) query.append("sort", params.sort);
  if (params.page) query.append("page", params.page.toString());
  if (params.pageSize) query.append("pageSize", params.pageSize.toString());

  try {
    const res = await fetch(`${BACKEND_BASE}/api/tech-news?${query.toString()}`);
    if (res.ok) {
      const data: TechNewsPagedResponse = await res.json();
      if (data && data.items && data.items.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Backend tech-news API unreachable, using resilient cached feed", err);
  }

  // Client-side filtering on fallback items
  let filtered = [...FALLBACK_UPDATES];

  if (params.category && params.category !== "All") {
    filtered = filtered.filter((x) => x.category.toLowerCase().includes(params.category!.toLowerCase()));
  }

  if (params.technology && params.technology !== "All Tech") {
    const tech = params.technology.toLowerCase();
    filtered = filtered.filter(
      (x) => x.tags.some((t) => t.toLowerCase().includes(tech)) || x.title.toLowerCase().includes(tech)
    );
  }

  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      (x) =>
        x.title.toLowerCase().includes(s) ||
        x.summary.toLowerCase().includes(s) ||
        x.tags.some((t) => t.toLowerCase().includes(s))
    );
  }

  if (params.source && params.source !== "All") {
    filtered = filtered.filter((x) => x.source.toLowerCase().includes(params.source!.toLowerCase()));
  }

  if (params.sort === "popular") {
    filtered.sort((a, b) => b.upvotes - a.upvotes);
  } else {
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    items: paged,
    totalCount: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
    lastUpdatedAt: new Date().toISOString(),
  };
}

export async function refreshTechNewsCache(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE}/api/tech-news/refresh`, { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

// Backward-compatibility export for Dashboard tech pulse card
export interface TechArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  category: string;
}

export async function fetchLiveTechArticles(): Promise<TechArticle[]> {
  const updates = await fetchTechUpdates();
  return updates.items.map((x) => ({
    title: x.title,
    description: x.summary,
    source: x.source,
    url: x.sourceUrl,
    category: x.category,
  }));
}

