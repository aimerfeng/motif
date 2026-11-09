// SPDX-License-Identifier: MIT
// Copyright (c) 2023 onWidget
// Source: https://github.com/arthelokyo/astrowind/blob/14e1a69/src/pages/landing/lead-generation.astro
// Modified by Motif; see the item's provenance.
import type { CSSProperties } from 'react'
import { cn } from '@/lib/motif-runtime'
import { themeStyle } from './parts'
import { CallToAction, Contact, FAQs, Footer, Header, Hero, Note, Savings, Steps, Testimonials } from './sections'

/* @motif:defaults */
export const defaults = {
  brandName: 'Larkfield Solar',
  headline: 'A fixed-price solar quote for your roof in two minutes',
  accent: '#f59e0b',
  fontPairing: 'inter',
  radius: 8,
  dark: false,
  formSteps: 'wizard',
  electricityRate: 17,
  sunHours: 4.5,
}
/* @motif:end */

export type SolarQuoteLeadgenProps = Partial<typeof defaults> & { className?: string; style?: CSSProperties }

/**
 * 家用光伏安装商的获客落地页：首屏三步报价表单（地址、屋顶、电费）带进度、为什么划算、
 * 拖动滑块重画回本曲线的省钱估算、安装四步与服务范围图、评价、约电话表单、FAQ、收尾 CTA。
 * 顺序沿用上游 lead-generation.astro；布局用容器查询，放进任何宽度的容器都能正确响应。
 */
export function SolarQuoteLeadgen({ className, style, ...props }: SolarQuoteLeadgenProps) {
  const options = { ...defaults, ...props }
  return (
    <div className={cn('@container relative w-full overflow-x-clip antialiased', className)} style={{ ...themeStyle(options), ...style }}>
      <Header brand={options.brandName} />
      <main>
        <Hero headline={options.headline} brand={options.brandName} formSteps={options.formSteps} rate={options.electricityRate} sunHours={options.sunHours} />
        <Note />
        <Savings rate={options.electricityRate} sunHours={options.sunHours} />
        <Steps brand={options.brandName} />
        <Testimonials dark={options.dark} />
        <Contact brand={options.brandName} />
        <FAQs />
        <CallToAction dark={options.dark} />
      </main>
      <Footer brand={options.brandName} />
    </div>
  )
}
