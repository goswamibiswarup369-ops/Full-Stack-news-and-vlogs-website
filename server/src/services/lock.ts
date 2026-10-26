import { JobLock } from '../models/IngestionLog';

/** Distributed lock backed by MongoDB: safe across restarts and multiple instances. */
export async function acquireLock(name: string, ttlSeconds: number): Promise<boolean> {
  const now = new Date();
  try {
    const doc = await JobLock.findOneAndUpdate(
      { _id: name, lockedUntil: { $lt: now } },
      { $set: { lockedUntil: new Date(now.getTime() + ttlSeconds * 1000) } },
      { upsert: true, new: true }
    );
    return !!doc;
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return false;
    throw e;
  }
}

export async function releaseLock(name: string): Promise<void> {
  await JobLock.updateOne({ _id: name }, { $set: { lockedUntil: new Date(0) } });
}
