/*
 * 站点主题：暗色（本色）或浅色。默认暗色——站点的样子、条目的海报和预览大多按暗底设计；
 * 用户切到浅色就记在 localStorage。<html data-theme> 由 layout 里的 THEME_SCRIPT 在首帧之前写好，
 * 选了浅色的人不会先看到一闪暗色。
 */

export type Theme = 'dark' | 'light'
export const THEME_KEY = 'motif-theme'

/** 在 <head> 里同步执行的脚本（字符串，不经过打包）：读偏好，写到 <html> 上。 */
export const THEME_SCRIPT = `(function(){var t='dark';try{if(localStorage.getItem('${THEME_KEY}')==='light')t='light'}catch(e){}document.documentElement.dataset.theme=t})()`

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** 用户主动切换：写上并记住。 */
export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem(THEME_KEY, theme)
  } catch {
    // 存不了就只在这一页生效。
  }
}
