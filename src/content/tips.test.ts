import { describe, expect, it } from 'vitest';
import en from '@/locales/en/tips.json';
import vi from '@/locales/vi/tips.json';
import { MNEMONIC_GROUPS } from './tips';

describe('MNEMONIC_GROUPS', () => {
  it.each([
    ['vi', vi],
    ['en', en],
  ])('has one %s text per service', (_locale, messages) => {
    for (const group of MNEMONIC_GROUPS) {
      expect(messages.Mnemonics[group.id].items).toHaveLength(group.services.length);
    }
  });
});
