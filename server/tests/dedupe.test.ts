import { describe, it, expect } from 'vitest';
import { canonicalizeUrl, isSimilarTitle } from '../src/utils/dedupe';
import { classify } from '../src/config/categories';
import { startOfIstDay } from '../src/utils/dates';
import { parseFeedConfig } from '../src/utils/feeds';

describe('canonicalizeUrl', () => {
  it('strips tracking params, www, hash and trailing slash', () => {
    expect(canonicalizeUrl('https://www.Example.com/a/?utm_source=x&id=2#top')).toBe('https://example.com/a?id=2');
  });
  it('treats equivalent URLs as equal', () => {
    expect(canonicalizeUrl('https://example.com/a?b=1&a=2')).toBe(canonicalizeUrl('https://example.com/a?a=2&b=1&fbclid=z'));
  });
});

describe('isSimilarTitle', () => {
  it('detects near-duplicate headlines', () => {
    expect(isSimilarTitle('RBI keeps repo rate unchanged at 6.5%', 'RBI keeps the repo rate unchanged at 6.5')).toBe(true);
  });
  it('keeps different stories apart', () => {
    expect(isSimilarTitle('RBI keeps repo rate unchanged', 'ISRO launches new weather satellite')).toBe(false);
  });
});

describe('classify', () => {
  it('maps keywords to categories and falls back to the hint', () => {
    expect(classify('ISRO launches satellite from Sriharikota')).toBe('space-isro');
    expect(classify('Nothing recognisable here', 'sports')).toBe('sports');
  });
});

describe('dates', () => {
  it('computes IST midnight', () => {
    // 2026-10-15 20:00 UTC = 2026-10-16 01:30 IST -> IST day starts 2026-10-15 18:30 UTC
    expect(startOfIstDay(new Date('2026-10-15T20:00:00Z')).toISOString()).toBe('2026-10-15T18:30:00.000Z');
  });
});

describe('parseFeedConfig', () => {
  it('parses name|url|category entries and drops invalid ones', () => {
    const f = parseFeedConfig('A|https://a.com/rss|sports,bad|notaurl|x');
    expect(f).toEqual([{ name: 'A', url: 'https://a.com/rss', category: 'sports' }]);
  });
});
