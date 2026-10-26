import cron from 'node-cron';
import { env } from '../config/env';
import { runIngestion, Trigger } from '../services/ingestion';

function safeRun(trigger: Trigger) {
  return () => runIngestion(trigger).catch((e) => console.error(`[scheduler] ${trigger} run failed:`, e));
}

export function startScheduler(): void {
  if (env.ENABLE_SCHEDULER !== 'true') { console.log('[scheduler] disabled'); return; }
  const opts = { timezone: env.TIMEZONE };
  if (!cron.validate(env.DAILY_CRON)) throw new Error(`Invalid DAILY_CRON: ${env.DAILY_CRON}`);
  cron.schedule(env.DAILY_CRON, safeRun('daily'), opts);
  console.log(`[scheduler] daily ingestion: "${env.DAILY_CRON}" (${env.TIMEZONE})`);
  if (env.ENABLE_BREAKING_REFRESH === 'true') {
    if (!cron.validate(env.BREAKING_CRON)) throw new Error(`Invalid BREAKING_CRON: ${env.BREAKING_CRON}`);
    cron.schedule(env.BREAKING_CRON, safeRun('breaking'), opts);
    console.log(`[scheduler] breaking refresh: "${env.BREAKING_CRON}"`);
  }
  // Catch-up run on boot, useful on hosts that sleep (the lock prevents overlap)
  setTimeout(safeRun('manual'), 5_000);
}
