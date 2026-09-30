import { SuccessCheck, type SuccessCheckProps } from './success-check'

export function Demo(props: SuccessCheckProps) {
  return (
    <div className="grid h-full w-full place-items-center bg-background p-8">
      <div className="w-full max-w-xs rounded-2xl border bg-card p-6 text-center shadow-2xl shadow-black/40">
        <div className="flex justify-center">
          <SuccessCheck {...props} label="Payment successful" />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight text-card-foreground">Payment successful</h3>
        <p className="mt-1 text-sm text-muted-foreground">$48.00 paid to Northwind Ltd.</p>
        <dl className="mt-5 space-y-2.5 border-t pt-4 text-left text-xs">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Transaction</dt>
            <dd className="font-mono text-card-foreground">TX-20418-77A</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Method</dt>
            <dd className="text-card-foreground">Visa ending 4242</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-card-foreground">Sep 29, 2026</dd>
          </div>
        </dl>
        <button type="button" className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
          View receipt
        </button>
      </div>
    </div>
  )
}
