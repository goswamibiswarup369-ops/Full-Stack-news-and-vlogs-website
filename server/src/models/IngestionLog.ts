import { Schema, model } from 'mongoose';

const logSchema = new Schema(
  {
    trigger: { type: String, enum: ['daily', 'breaking', 'manual', 'cli'], required: true },
    status: { type: String, enum: ['running', 'success', 'partial', 'failed'], required: true },
    startedAt: { type: Date, required: true },
    finishedAt: { type: Date },
    fetched: { type: Number, default: 0 },
    inserted: { type: Number, default: 0 },
    duplicates: { type: Number, default: 0 },
    errors: [{ provider: String, message: String }],
  },
  { timestamps: true }
);
logSchema.index({ startedAt: -1 });
logSchema.index({ status: 1, finishedAt: -1 });

export const IngestionLog = model('IngestionLog', logSchema);

const lockSchema = new Schema({ _id: String, lockedUntil: { type: Date, required: true } });
export const JobLock = model('JobLock', lockSchema);
