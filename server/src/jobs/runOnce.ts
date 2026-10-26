import mongoose from 'mongoose';
import { connectDb } from '../config/db';
import { runIngestion } from '../services/ingestion';

(async () => {
  await connectDb();
  const r = await runIngestion('cli');
  console.log(JSON.stringify(r, null, 2));
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
