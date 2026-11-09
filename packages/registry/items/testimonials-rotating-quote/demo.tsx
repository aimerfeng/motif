import { TestimonialsRotatingQuote, type TestimonialsRotatingQuoteProps } from './testimonials-rotating-quote'

export function Demo(props: TestimonialsRotatingQuoteProps) {
  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="flex min-h-full flex-col justify-center pt-12">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Trusted by 4,000+ product teams</p>
        <TestimonialsRotatingQuote {...props} />
      </div>
    </div>
  )
}
