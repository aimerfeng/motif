import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { ItemSource } from '@motif/schema'
import { getAddress, type Address, type Hex } from 'viem'
import { HASH_PATTERN } from './shared'

/*
 * 社区内容的站点侧存储（链上只存这些内容的 sha256）：
 * - sources/<hash>/<uploader>.json：投稿源码，按上传者分开存（同一份内容可能被不同的人上传，只认链上作者那一份）；
 * - builds/<hash>.json：编译好的预览模块；
 * - blobs/<hash>.txt：审核意见、创作者资料等小段文字。
 *
 * 目前是本地文件（.data/ 不进版本库）。生产环境换成对象存储时只需要替换这个文件，接口不变。
 */

const DATA_DIR = process.env.MOTIF_COMMUNITY_DATA
  ? path.resolve(/*turbopackIgnore: true*/ process.env.MOTIF_COMMUNITY_DATA)
  : path.resolve(/*turbopackIgnore: true*/ process.cwd(), '../..', '.data/community')

export interface StoredSource {
  item: ItemSource
  uploader: Address
  signature: Hex
  uploadedAt: string
}

export interface StoredBuild {
  js: string
  css: string
}

function assertHash(hash: string): asserts hash is Hex {
  if (!HASH_PATTERN.test(hash)) throw new Error(`not a content hash: ${hash}`)
}

/** 先写临时文件再改名，读的一方永远不会读到写了一半的文件。 */
async function writeAtomic(file: string, text: string) {
  await mkdir(path.dirname(file), { recursive: true })
  const temp = `${file}.${randomUUID()}.tmp`
  await writeFile(temp, text)
  await rename(temp, file)
}

async function readOptional(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

const sourceFile = (hash: Hex, uploader: Address) => path.join(/*turbopackIgnore: true*/ DATA_DIR, 'sources', hash, `${getAddress(uploader).toLowerCase()}.json`)

export async function saveSource(hash: Hex, source: StoredSource): Promise<void> {
  assertHash(hash)
  await writeAtomic(sourceFile(hash, source.uploader), JSON.stringify(source))
}

export async function readSource(hash: Hex, uploader: Address): Promise<StoredSource | null> {
  assertHash(hash)
  const text = await readOptional(sourceFile(hash, uploader))
  return text === null ? null : (JSON.parse(text) as StoredSource)
}

export async function saveBuild(hash: Hex, build: StoredBuild): Promise<void> {
  assertHash(hash)
  await writeAtomic(path.join(/*turbopackIgnore: true*/ DATA_DIR, 'builds', `${hash}.json`), JSON.stringify(build))
}

export async function readBuild(hash: Hex): Promise<StoredBuild | null> {
  assertHash(hash)
  const text = await readOptional(path.join(/*turbopackIgnore: true*/ DATA_DIR, 'builds', `${hash}.json`))
  return text === null ? null : (JSON.parse(text) as StoredBuild)
}

export async function saveBlob(hash: Hex, text: string): Promise<void> {
  assertHash(hash)
  await writeAtomic(path.join(/*turbopackIgnore: true*/ DATA_DIR, 'blobs', `${hash}.txt`), text)
}

export async function readBlob(hash: Hex): Promise<string | null> {
  assertHash(hash)
  return readOptional(path.join(/*turbopackIgnore: true*/ DATA_DIR, 'blobs', `${hash}.txt`))
}
