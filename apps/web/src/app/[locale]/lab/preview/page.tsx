import { use } from 'react'
import { resolveRouteLocale } from '@/i18n/locale'
import { PreviewLab } from './preview-lab'

export default function PreviewLabPage({ params }: PageProps<'/[locale]/lab/preview'>) {
  resolveRouteLocale(use(params).locale)
  return <PreviewLab />
}
