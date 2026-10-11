import path from 'node:path'
import { ITEMS_DIR, loadItemSource } from '@motif/registry'
import { describe, expect, it } from 'vitest'
import { customPrice, fromUnits, itemPrice, priceOf, pricingFromEnv, toUnits } from '../src/lib/store/pricing'
import { searchListings, type Listing } from '../src/lib/store/search'

describe('store pricing', () => {
  const config = { customUsdc: '2.5', motifPerUsdc: '100', motifDiscount: 0.2 }

  it('keeps USDC amounts exact to six decimals', () => {
    expect(toUnits('2.5')).toBe(2_500_000n)
    expect(fromUnits(toUnits('0.000001'))).toBe('0.000001')
    expect(fromUnits(toUnits('12'))).toBe('12')
    expect(() => toUnits('-1')).toThrow()
    expect(() => toUnits('1.0000001')).toThrow()
    expect(() => toUnits('1e3')).toThrow()
  })

  it('converts to MOTIF at the configured rate and applies the discount', () => {
    expect(priceOf('2.5', config)).toEqual({ usdc: '2.5', motif: '200', free: false })
    expect(customPrice(config)).toEqual({ usdc: '2.5', motif: '200', free: false })
    expect(itemPrice(config)).toEqual({ usdc: '0', motif: '0', free: true })
  })

  it('reads its configuration from the environment with safe defaults', () => {
    expect(pricingFromEnv({})).toEqual({ customUsdc: '0', motifPerUsdc: '100', motifDiscount: 0.2 })
    expect(pricingFromEnv({ MOTIF_STORE_CUSTOM_PRICE_USDC: '5', MOTIF_STORE_MOTIF_DISCOUNT: '2' })).toEqual({ customUsdc: '5', motifPerUsdc: '100', motifDiscount: 0.2 })
  })
})

describe('store search', () => {
  const load = async (slugs: string[]): Promise<Listing[]> =>
    Promise.all(slugs.map(async (slug) => ({ manifest: (await loadItemSource(path.join(ITEMS_DIR, slug))).manifest, source: 'catalog' as const, author: null })))

  it('ranks title and tag matches first and requires every term', async () => {
    const listings = await load(['border-beam', 'loader-dots', 'loader-orbits', 'pricing-three-tier', 'mesh-gradient'])
    expect(searchListings(listings, { query: 'loading dots', limit: 5 }).map((listing) => listing.manifest.slug)[0]).toBe('loader-dots')
    expect(searchListings(listings, { query: 'pricing', limit: 5 }).map((listing) => listing.manifest.slug)).toContain('pricing-three-tier')
    expect(searchListings(listings, { query: 'loader zebra', limit: 5 })).toEqual([])
  })

  it('filters by level and category, and honours the limit', async () => {
    const listings = await load(['border-beam', 'loader-dots', 'loader-orbits', 'pricing-three-tier', 'mesh-gradient'])
    expect(searchListings(listings, { kind: 'section', limit: 5 }).every((listing) => listing.manifest.kind === 'section')).toBe(true)
    expect(searchListings(listings, { category: 'loader', limit: 5 }).map((listing) => listing.manifest.slug).sort()).toEqual(['loader-dots', 'loader-orbits'])
    expect(searchListings(listings, { limit: 2 })).toHaveLength(2)
  })
})
