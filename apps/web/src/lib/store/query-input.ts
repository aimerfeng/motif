/*
 * 只读工具可以用 GET 调：参数写在查询串里。查询串里全是字符串，这里按工具输入的 JSON Schema
 * 把它们还原成数字、布尔、数组、对象，再交给同一份 zod 定义校验——还原不了的原样留着，由 zod 报出清楚的错误。
 */

interface PropertySchema {
  type?: string
  items?: { type?: string }
}

function scalar(raw: string, type: string | undefined): unknown {
  if (type === 'number' || type === 'integer') return raw.trim() !== '' && Number.isFinite(Number(raw)) ? Number(raw) : raw
  if (type === 'boolean') return raw === 'true' || raw === '1' ? true : raw === 'false' || raw === '0' ? false : raw
  return raw
}

function parseJson(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return raw
  }
}

export function inputFromQuery(query: URLSearchParams, schema: { properties?: Record<string, unknown> }): Record<string, unknown> {
  const properties = (schema.properties ?? {}) as Record<string, PropertySchema>
  const input: Record<string, unknown> = {}
  for (const key of new Set(query.keys())) {
    const all = query.getAll(key)
    const property = properties[key]
    if (property?.type === 'array') {
      // 三种写法都认：times=0.8&times=2.5、times=0.8,2.5、times=[0.8,2.5]。
      const first = all[0]!
      input[key] = all.length === 1 && first.trim().startsWith('[') ? parseJson(first) : all.flatMap((part) => part.split(',')).map((part) => scalar(part, property.items?.type))
    } else if (property?.type === 'object') {
      input[key] = parseJson(all[0]!)
    } else {
      input[key] = scalar(all[0]!, property?.type)
    }
  }
  return input
}
