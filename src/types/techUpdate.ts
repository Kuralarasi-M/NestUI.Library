export interface TechUpdate {
  id: string;
  title: string;
  summary: string;
  source: string;
  sourceUrl: string;
  publishedAt: string;
  category: string; // Release, News, Tutorial, Updates, Announcement
  tags: string[];
  upvotes: number;
  commentsCount: number;
  author?: string;
  domain?: string;
}

export interface TechNewsQueryParams {
  category?: string;
  technology?: string;
  search?: string;
  source?: string;
  sort?: "latest" | "popular";
  page?: number;
  pageSize?: number;
}

export interface TechNewsPagedResponse {
  items: TechUpdate[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lastUpdatedAt: string;
}
