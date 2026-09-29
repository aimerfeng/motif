import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** 合并 className，后面的 Tailwind 工具类覆盖前面冲突的（与 shadcn 的 cn 相同）。 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
