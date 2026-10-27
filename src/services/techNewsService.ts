// Service to fetch real-time technology news from Dev.to and HackerNews APIs
// and generate interactive comprehension questions for the Daily Tech Bytes feature.

export interface TechArticle {
  id: number | string;
  title: string;
  description: string;
  url: string;
  source: "Dev.to" | "HackerNews";
  tags: string[];
  readingTime?: number;
  publishedAt?: string;
  coverImage?: string;
  score?: number;
}

export interface TechQuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

// Fallback high-quality tech updates in case network/external feed is unreachable
const FALLBACK_TECH_ARTICLES: TechArticle[] = [
  {
    id: 101,
    title: "Understanding Frontier Multimodal AI Models & Reasoning Engines",
    description: "Modern artificial intelligence combines vision, audio, and language models with step-by-step reasoning tokens to dramatically reduce hallucinations and solve complex engineering tasks.",
    url: "https://dev.to/t/ai",
    source: "Dev.to",
    tags: ["AI", "Machine Learning", "LLMs"],
    readingTime: 3,
    publishedAt: "Today",
  },
  {
    id: 102,
    title: "Next-Gen Web Architecture: Edge Computing and Serverless Databases",
    description: "Developers are adopting distributed edge runtimes and globally replicated serverless Postgres to serve sub-millisecond database queries close to end users worldwide.",
    url: "https://dev.to/t/webdev",
    source: "Dev.to",
    tags: ["WebDev", "Architecture", "Cloud"],
    readingTime: 4,
    publishedAt: "Today",
  },
  {
    id: 103,
    title: "Zero-Trust Cybersecurity & Quantum-Resistant Cryptography",
    description: "Global security standards are shifting toward post-quantum encryption algorithms to protect sensitive data against future quantum computer decryption capabilities.",
    url: "https://dev.to/t/security",
    source: "Dev.to",
    tags: ["Cybersecurity", "Cryptography", "Tech"],
    readingTime: 3,
    publishedAt: "Today",
  },
];

export async function fetchLiveTechArticles(): Promise<TechArticle[]> {
  try {
    // 1. Try fetching top tech articles from Dev.to API
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://dev.to/api/articles?tag=tech&top=1&per_page=6", {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          title: item.title,
          description:
            item.description ||
            `Read the latest tech discussion on ${item.tag_list?.join(", ") || "technology"} and learn what developers are building today.`,
          url: item.url,
          source: "Dev.to" as const,
          tags: Array.isArray(item.tag_list) && item.tag_list.length > 0 ? item.tag_list.slice(0, 4) : ["Technology", "Software"],
          readingTime: item.reading_time_minutes || 3,
          publishedAt: item.readable_publish_date || "Today",
          coverImage: item.cover_image || item.social_image || undefined,
          score: item.positive_reactions_count || 10,
        }));
      }
    }
  } catch (err) {
    console.warn("Dev.to fetch failed, falling back to HackerNews / seeded news", err);
  }

  // 2. Fallback attempt to HackerNews Top Stories
  try {
    const hnRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    if (hnRes.ok) {
      const ids: number[] = await hnRes.json();
      const topIds = ids.slice(0, 4);
      const items = await Promise.all(
        topIds.map((id) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
            .then((r) => r.json())
            .catch(() => null)
        )
      );
      const valid = items.filter((x) => x && x.title && x.url);
      if (valid.length > 0) {
        return valid.map((item) => ({
          id: item.id,
          title: item.title,
          description: `Trending technology discussion on HackerNews with ${item.score || 0} community upvotes and ${item.descendants || 0} developer comments.`,
          url: item.url,
          source: "HackerNews" as const,
          tags: ["HackerNews", "TechNews", "Trends"],
          readingTime: 4,
          publishedAt: "Today",
          score: item.score,
        }));
      }
    }
  } catch (e) {
    console.warn("HackerNews fetch failed, using fallback articles", e);
  }

  return FALLBACK_TECH_ARTICLES;
}

// Generates dynamic comprehension questions based on the live tech articles read
export function generateTechQuiz(articles: TechArticle[]): TechQuizQuestion[] {
  if (!articles || articles.length === 0) {
    return [
      {
        id: 1,
        question: "What is the primary benefit of Edge Computing in modern web systems?",
        options: [
          "Running server queries closer to users to reduce latency",
          "Eliminating the need for internet access",
          "Replacing JavaScript with machine assembly code",
          "Preventing computers from heating up",
        ],
        correctOptionIndex: 0,
        explanation: "Edge computing places compute and cache storage close to users, drastically cutting round-trip latency.",
      },
      {
        id: 2,
        question: "Why are security researchers transitioning toward Post-Quantum Cryptography?",
        options: [
          "Current algorithms may be broken once quantum computers scale",
          "Quantum encryption makes code compile 10x faster",
          "It lowers the electricity consumption of mobile phone screens",
          "Quantum keys can only be sent through physical mail",
        ],
        correctOptionIndex: 0,
        explanation: "Post-quantum algorithms defend encryption against future quantum supercomputers capable of breaking RSA.",
      },
      {
        id: 3,
        question: "What role do 'reasoning tokens' play in frontier LLMs?",
        options: [
          "They let models verify logic and plan steps before outputting final answers",
          "They replace human software engineers entirely",
          "They reduce the size of computer monitors",
          "They make Python libraries free to download",
        ],
        correctOptionIndex: 0,
        explanation: "Reasoning models generate internal chain-of-thought tokens to plan, self-correct, and verify logic.",
      },
    ];
  }

  const primary = articles[0];
  const secondary = articles[1] || articles[0];
  const tertiary = articles[2] || articles[0];

  return [
    {
      id: 1,
      question: `According to today's tech highlight ("${primary.title}"), what is the central innovation or focus discussed?`,
      options: [
        `${primary.title.slice(0, 65)}...`,
        "Deprecation of all internet networking standards",
        "Replacing software programming with mechanical switches",
        "Discontinuation of cloud database storage",
      ],
      correctOptionIndex: 0,
      explanation: `Today's top headline revolves directly around ${primary.tags.join(" & ")}.`,
    },
    {
      id: 2,
      question: `In modern tech architecture, why is "${secondary.tags[0] || 'Software'}" receiving significant developer attention?`,
      options: [
        "It enhances developer velocity, application scalability, and user responsiveness",
        "It prohibits systems from running background tasks",
        "It restricts all code to run on single-core machines only",
        "It makes databases incapable of storing textual data",
      ],
      correctOptionIndex: 0,
      explanation: "Contemporary tech tools prioritize high availability, rapid deployment, and optimized developer workflows.",
    },
    {
      id: 3,
      question: `Based on the latest industry trends highlighted by "${tertiary.source}", what is best practice for building resilient software?`,
      options: [
        "Continuous testing, automated observability, and adopting modern secure standards",
        "Never updating dependencies or security patches",
        "Hardcoding user authentication tokens in public git repositories",
        "Ignoring errors and server monitoring alerts",
      ],
      correctOptionIndex: 0,
      explanation: "Industry leaders emphasize security vigilance, modular architecture, and automated validation.",
    },
  ];
}
