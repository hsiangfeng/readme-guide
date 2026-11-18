import { PROJECT_TYPES } from '#shared/utils/projectTypes'
import { readSample, samplePath } from '../data/samples'
import type { ParsedSample } from '../types'
import { parseSample } from '../utils/parseSample'

/**
 * 四種類型的樣本 README（目前語言），產生靜態頁時讀好、拆好，頁面只帶拆好的結果。
 */
export function useAnatomySamples() {
  const { locale } = useI18n()
  return useAsyncData(`anatomy-samples-${locale.value}`, async () => {
    const samples = await Promise.all(PROJECT_TYPES.map(async (type): Promise<ParsedSample> => ({
      type: type.id,
      path: samplePath(type.id, locale.value),
      rows: parseSample(await readSample(type.id, locale.value)),
    })))
    return Object.fromEntries(samples.map((sample) => [sample.type, sample])) as Record<string, ParsedSample>
  })
}
