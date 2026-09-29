/** E2E 用独立端口，不和本地开发（3000 / 4100）冲突。 */
export const E2E = {
  webPort: 3100,
  previewPort: 4110,
  get webUrl() {
    return `http://localhost:${this.webPort}`
  },
  get previewUrl() {
    return `http://127.0.0.1:${this.previewPort}`
  },
}
