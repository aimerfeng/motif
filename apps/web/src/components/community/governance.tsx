'use client'

import { motifCurationAbi, motifGovernorAbi, motifIdentityAbi, motifRegistryAbi, motifTokenAbi, ROLES, spdxToBytes32 } from '@motif/contracts'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { encodeFunctionData, formatUnits, isAddress, keccak256, parseEther, toHex, type Address, type Hex } from 'viem'
import { formatMotif } from '@/lib/community/shared'
import { ConnectGate } from './connect-gate'
import { useWriter, type WritePhase } from './use-writer'
import { useCommunity } from './wallet'

function phaseKey(phase: WritePhase) {
  return phase as 'signing' | 'pending' | 'syncing'
}

const primary = 'rounded-full bg-ink px-4 py-1.5 text-[13.5px] font-medium text-canvas transition-opacity duration-150 hover:opacity-90 disabled:opacity-40'
const secondary = 'rounded-full border border-line-strong px-4 py-1.5 text-[13.5px] text-ink transition-colors duration-150 hover:border-ink disabled:opacity-40'

/** 投票权需要委托后才生效（ERC20Votes 的设计：不委托就不记检查点，转账更省 gas）。 */
export function DelegationCard({ threshold }: { threshold: string }) {
  const t = useTranslations('community.governance.delegation')
  return (
    <div className="rounded-[var(--radius-card)] border border-line p-5 text-[13.5px]">
      <h2 className="text-[15px] font-medium">{t('title')}</h2>
      <div className="mt-4">
        <ConnectGate compact>
          <Delegation threshold={threshold} />
        </ConnectGate>
      </div>
    </div>
  )
}

function Delegation({ threshold }: { threshold: string }) {
  const t = useTranslations('community.governance.delegation')
  const { account, address, config } = useCommunity()
  const writer = useWriter()
  if (!account || !address) return null
  const selfDelegated = account.delegate === address
  const delegate = () => writer.run(({ write }) => write({ address: config!.contracts.token, abi: motifTokenAbi, functionName: 'delegate', args: [address] }).then(() => {}))
  return (
    <div className="space-y-3">
      <dl className="grid grid-cols-[1fr_auto] gap-y-2">
        <dt className="text-ink-faint">{t('balance')}</dt>
        <dd className="tabular-nums">{formatMotif(account.balance)} MOTIF</dd>
        <dt className="text-ink-faint">{t('votes')}</dt>
        <dd className="tabular-nums" data-testid="voting-power">
          {formatMotif(account.votes)}
        </dd>
      </dl>
      <p className="text-[12.5px] leading-relaxed text-ink-faint">{t('threshold', { threshold })}</p>
      {!selfDelegated && (
        <>
          <p className="text-ink-muted">{t('lead')}</p>
          <button type="button" onClick={() => void delegate()} disabled={writer.busy} className={secondary} data-testid="delegate-button">
            {writer.busy ? t(`phase.${phaseKey(writer.phase)}`) : t('self')}
          </button>
        </>
      )}
      {writer.error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}

export interface ProposalCall {
  id: string
  targets: Address[]
  values: string[]
  calldatas: Hex[]
  description: string
  state: string
  voters: Address[]
  executable: boolean
}

/** 提案上的操作：投票中可以投票；通过后任何人都可以排队；时间锁到期后任何人都可以执行。 */
export function ProposalActions({ proposal }: { proposal: ProposalCall }) {
  const t = useTranslations('community.governance.actions')
  const { address, config, status } = useCommunity()
  const writer = useWriter()
  if (status !== 'connected' || !config) return null
  const governor = config.contracts.governor
  const args = [proposal.targets, proposal.values.map(BigInt), proposal.calldatas, keccak256(toHex(proposal.description))] as const

  const vote = (support: 0 | 1 | 2) =>
    writer.run(({ write }) => write({ address: governor, abi: motifGovernorAbi, functionName: 'castVote', args: [BigInt(proposal.id), support] }).then(() => {}))
  const queue = () => writer.run(({ write }) => write({ address: governor, abi: motifGovernorAbi, functionName: 'queue', args }).then(() => {}))
  const execute = () => writer.run(({ write }) => write({ address: governor, abi: motifGovernorAbi, functionName: 'execute', args }).then(() => {}))

  let body: React.ReactNode = null
  if (proposal.state === 'active') {
    body =
      address && proposal.voters.includes(address) ? (
        <p className="text-success">{t('voted')}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => void vote(1)} disabled={writer.busy} className={primary} data-testid="vote-for">
            {t('for')}
          </button>
          <button type="button" onClick={() => void vote(0)} disabled={writer.busy} className={secondary}>
            {t('against')}
          </button>
          <button type="button" onClick={() => void vote(2)} disabled={writer.busy} className={secondary}>
            {t('abstain')}
          </button>
        </div>
      )
  } else if (proposal.state === 'succeeded') {
    body = (
      <button type="button" onClick={() => void queue()} disabled={writer.busy} className={primary} data-testid="queue-button">
        {t('queue')}
      </button>
    )
  } else if (proposal.state === 'queued' && proposal.executable) {
    body = (
      <button type="button" onClick={() => void execute()} disabled={writer.busy} className={primary} data-testid="execute-button">
        {t('execute')}
      </button>
    )
  }
  if (!body) return null
  return (
    <div className="mt-4 space-y-2 border-t border-line pt-4 text-[13.5px]">
      {body}
      {writer.busy && <p className="text-[12.5px] text-ink-faint">{t(`phase.${phaseKey(writer.phase)}`)}</p>}
      {writer.error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}

export interface CurrentParams {
  bond: string
  quorum: number
  reviewPeriod: number
  publishReward: string
  remixReward: string
  publishReputation: string
  remixReputation: string
  curatorReputation: string
  violationPenalty: string
}

type Template = 'appointCurator' | 'removeCurator' | 'appointModerator' | 'removeModerator' | 'fundRewards' | 'curationParams' | 'allowLicense'
const TEMPLATES: Template[] = ['appointCurator', 'removeCurator', 'appointModerator', 'removeModerator', 'fundRewards', 'curationParams', 'allowLicense']

/** 发起提案：常见的治理动作做成模板，填几个值就能生成正确的调用。 */
export function ProposalComposer({ params }: { params: CurrentParams | null }) {
  const t = useTranslations('community.governance.composer')
  return (
    <div className="rounded-[var(--radius-card)] border border-line p-5 text-[13.5px]">
      <h2 className="text-[15px] font-medium">{t('title')}</h2>
      <p className="mt-2 leading-relaxed text-ink-faint">{t('lead')}</p>
      <div className="mt-4">
        <ConnectGate compact>
          {/* 链上参数变了（例如提案刚执行），表单初值跟着重来。 */}
          <Composer key={JSON.stringify(params)} params={params} />
        </ConnectGate>
      </div>
    </div>
  )
}

function Composer({ params }: { params: CurrentParams | null }) {
  const t = useTranslations('community.governance.composer')
  const { config } = useCommunity()
  const writer = useWriter()
  const [template, setTemplate] = useState<Template>('appointCurator')
  const [target, setTarget] = useState('')
  const [amount, setAmount] = useState('')
  const [spdx, setSpdx] = useState('')
  const [quorum, setQuorum] = useState(String(params?.quorum ?? 2))
  const [bond, setBond] = useState(params ? formatPlain(params.bond) : '')
  const [publishReward, setPublishReward] = useState(params ? formatPlain(params.publishReward) : '')
  const [remixReward, setRemixReward] = useState(params ? formatPlain(params.remixReward) : '')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  if (!config) return null
  const { curation, registry, identity, token } = config.contracts

  const build = (): { targets: Address[]; calldatas: Hex[] } | null => {
    const addr = target as Address
    try {
      switch (template) {
        case 'appointCurator':
        case 'removeCurator': {
          if (!isAddress(target)) return null
          const fn = template === 'appointCurator' ? 'grantRole' : 'revokeRole'
          return { targets: [curation], calldatas: [encodeFunctionData({ abi: motifCurationAbi, functionName: fn, args: [ROLES.curator, addr] })] }
        }
        case 'appointModerator':
        case 'removeModerator': {
          if (!isAddress(target)) return null
          const fn = template === 'appointModerator' ? 'grantRole' : 'revokeRole'
          return {
            targets: [registry, identity, curation],
            calldatas: [
              encodeFunctionData({ abi: motifRegistryAbi, functionName: fn, args: [ROLES.moderator, addr] }),
              encodeFunctionData({ abi: motifIdentityAbi, functionName: fn, args: [ROLES.moderator, addr] }),
              encodeFunctionData({ abi: motifCurationAbi, functionName: fn, args: [ROLES.moderator, addr] }),
            ],
          }
        }
        case 'fundRewards': {
          const value = parseEther(amount)
          if (value <= 0n) return null
          return { targets: [token], calldatas: [encodeFunctionData({ abi: motifTokenAbi, functionName: 'transfer', args: [curation, value] })] }
        }
        case 'curationParams': {
          if (!params) return null
          const next = {
            bond: parseEther(bond),
            quorum: Number(quorum),
            reviewPeriod: params.reviewPeriod,
            publishReward: parseEther(publishReward),
            remixReward: parseEther(remixReward),
            publishReputation: BigInt(params.publishReputation),
            remixReputation: BigInt(params.remixReputation),
            curatorReputation: BigInt(params.curatorReputation),
            violationPenalty: BigInt(params.violationPenalty),
          }
          if (!Number.isInteger(next.quorum) || next.quorum < 1 || next.quorum > 255) return null
          return { targets: [curation], calldatas: [encodeFunctionData({ abi: motifCurationAbi, functionName: 'setParams', args: [next] })] }
        }
        case 'allowLicense':
          if (!spdx.trim()) return null
          return { targets: [registry], calldatas: [encodeFunctionData({ abi: motifRegistryAbi, functionName: 'setLicenseAllowed', args: [spdxToBytes32(spdx.trim()), true] })] }
      }
    } catch {
      return null
    }
  }

  const calls = build()
  const description = `# ${title.trim()}\n\n${body.trim()}`.trim()
  const ready = calls !== null && title.trim() !== ''
  const propose = () =>
    writer.run(async ({ write }) => {
      if (!calls) return
      await write({
        address: config.contracts.governor,
        abi: motifGovernorAbi,
        functionName: 'propose',
        args: [calls.targets, calls.targets.map(() => 0n), calls.calldatas, description],
      })
      setTitle('')
      setBody('')
    })

  const field = 'w-full rounded-lg border border-line bg-sunken px-3 py-2 placeholder:text-ink-faint focus:border-line-strong focus:outline-none'
  return (
    <div className="space-y-4">
      <label className="block">
        <span className="text-ink-faint">{t('template')}</span>
        <select value={template} onChange={(event) => setTemplate(event.target.value as Template)} className={`mt-1.5 ${field}`} data-testid="proposal-template">
          {TEMPLATES.map((key) => (
            <option key={key} value={key}>
              {t(`templates.${key}`)}
            </option>
          ))}
        </select>
      </label>
      {(template === 'appointCurator' || template === 'removeCurator' || template === 'appointModerator' || template === 'removeModerator') && (
        <label className="block">
          <span className="text-ink-faint">{t('address')}</span>
          <input value={target} onChange={(event) => setTarget(event.target.value.trim())} placeholder="0x…" spellCheck={false} className={`mt-1.5 font-mono text-[12.5px] ${field}`} data-testid="proposal-address" />
        </label>
      )}
      {template === 'fundRewards' && (
        <label className="block">
          <span className="text-ink-faint">{t('amount')}</span>
          <input value={amount} onChange={(event) => setAmount(event.target.value.trim())} inputMode="decimal" placeholder="50000" className={`mt-1.5 tabular-nums ${field}`} />
        </label>
      )}
      {template === 'allowLicense' && (
        <label className="block">
          <span className="text-ink-faint">{t('spdx')}</span>
          <input value={spdx} onChange={(event) => setSpdx(event.target.value)} placeholder="MPL-2.0" className={`mt-1.5 font-mono text-[12.5px] ${field}`} />
          <span className="mt-1.5 block text-[12px] text-ink-faint">{t('spdxHint')}</span>
        </label>
      )}
      {template === 'curationParams' && (
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ['quorum', quorum, setQuorum],
              ['bond', bond, setBond],
              ['publishReward', publishReward, setPublishReward],
              ['remixReward', remixReward, setRemixReward],
            ] as const
          ).map(([key, value, set]) => (
            <label key={key} className="block">
              <span className="text-ink-faint">{t(`params.${key}`)}</span>
              <input value={value} onChange={(event) => set(event.target.value.trim())} inputMode="decimal" className={`mt-1.5 tabular-nums ${field}`} />
            </label>
          ))}
        </div>
      )}
      <label className="block">
        <span className="text-ink-faint">{t('titleLabel')}</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} className={`mt-1.5 ${field}`} data-testid="proposal-title" />
      </label>
      <label className="block">
        <span className="text-ink-faint">{t('body')}</span>
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={4} placeholder={t('bodyPlaceholder')} className={`mt-1.5 resize-y leading-relaxed ${field}`} />
      </label>
      <button type="button" onClick={() => void propose()} disabled={!ready || writer.busy} className={`w-full ${primary} py-2`} data-testid="propose-button">
        {writer.busy ? t(`phase.${phaseKey(writer.phase)}`) : t('submit')}
      </button>
      {writer.phase === 'done' && <p className="text-[12.5px] text-success">{t('done')}</p>}
      {writer.error && (
        <p role="alert" className="text-[12.5px] text-danger">
          {writer.error}
        </p>
      )}
    </div>
  )
}

/** 18 位小数的整数字符串 → 精确的十进制，给输入框做初值（不能四舍五入，否则提案会悄悄改掉参数）。 */
function formatPlain(raw: string): string {
  return formatUnits(BigInt(raw), 18)
}
