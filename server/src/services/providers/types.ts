export interface RawArticle {
  providerId?: string;
  provider: string;
  sourceName: string;
  title: string;
  url: string;
  snippet?: string;
  imageUrl?: string;
  publishedAt: Date;
  categoryHint?: string;
  language?: string;
}

export interface NewsProvider {
  name: string;
  isConfigured(): boolean;
  fetch(): Promise<RawArticle[]>;
}
