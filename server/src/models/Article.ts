import { Schema, model, InferSchemaType } from 'mongoose';

const articleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    url: { type: String, required: true },
    canonicalUrl: { type: String, required: true, unique: true },
    providerId: { type: String },
    provider: { type: String, required: true },
    sourceName: { type: String, required: true },
    category: { type: String, required: true, index: true },
    sourceSnippet: { type: String, maxlength: 1000 },
    summary: { type: String },
    imageUrl: { type: String },
    language: { type: String, default: 'en' },
    publishedAt: { type: Date, required: true },
    firstSeenAt: { type: Date, required: true },
    lastCheckedAt: { type: Date, required: true },
    titleKey: { type: String, required: true },
    verificationStatus: { type: String, enum: ['unverified', 'source-verified', 'rejected'], default: 'unverified' },
    aiStatus: { type: String, enum: ['pending', 'done', 'failed', 'skipped'], default: 'pending' },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

articleSchema.index({ publishedAt: -1 });
articleSchema.index({ category: 1, publishedAt: -1 });
articleSchema.index({ provider: 1, providerId: 1 }, { unique: true, partialFilterExpression: { providerId: { $type: 'string' } } });
articleSchema.index({ title: 'text', summary: 'text', sourceSnippet: 'text' });

export type ArticleDoc = InferSchemaType<typeof articleSchema>;
export const Article = model('Article', articleSchema);
