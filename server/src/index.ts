import { env } from './config/env';
import { connectDb } from './config/db';
import { createApp } from './app';
import { startScheduler } from './jobs/scheduler';

(async () => {
  await connectDb();
  createApp().listen(env.PORT, () => console.log(`[server] http://localhost:${env.PORT}`));
  startScheduler();
})().catch((e) => { console.error(e); process.exit(1); });
