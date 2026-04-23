'use client'
import { useMarketingTheme } from '@/config/marketingTheme'

const plans = [
  { name: 'Demo',       price: '$0',     sub: 'Perfect for testing and small personal projects.',  btn: 'Start Free',    featured: false, features: ['20 requests / one week', 'Basic 3 Converters', 'Community Support'] },
  { name: 'General',    price: '$5',    sub: 'Ideal for professional developers and startups.',   btn: 'Get Started',   featured: false, features: ['500 requests / month', 'All Converters', 'Email Support'] },
  { name: 'Admin',      price: '$49',    sub: 'Scale your business with high-volume access.',      btn: 'Get Started',   featured: true,  features: ['50k requests / month', 'Priority Access', '24/7 Priority Support', 'Advanced Analytics'] },
  { name: 'Enterprise', price: 'Custom', sub: 'Dedicated solutions for large organizations.',      btn: 'Contact Sales', featured: false, features: ['Unlimited requests', 'Custom Integrations', 'Dedicated Manager', 'ALL Support'] },
]

export default function Page() {
  const { theme: t } = useMarketingTheme()

  return (
    <main
      className="transparent"
      style={{ background: t.card, boxShadow: t.panelShadow }}
    >
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-20">
        {/* ── Header ── */}
        <section className="relative mb-16 flex flex-col items-center text-center lg:mb-20">
          <div
            className="absolute -top-24 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full blur-[120px]"
            style={{ background: `${t.primary}18` }}
          />
          <div
            className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium mb-6"
            style={{ background: `${t.primary}18`, color: t.primary }}
          >
            <span className="mr-2">✨</span> New: Enterprise-grade
            infrastructure
          </div>
          <h1
            className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: t.heading }}
          >
            Choose your plan {" "}
            <span style={{ color: t.primary }}>Pricing</span>
          </h1>
          <p
            className="mt-6 max-w-2xl text-base leading-7 sm:text-lg sm:leading-relaxed"
            style={{ color: t.text }}
          >
            Choose the plan that fits your integration needs. Scale as you grow
            with our powerful API.
          </p>
        </section>

        {/* ── Plans ── */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {plans.map((plan) => {
            return (
              <div
                key={plan.name}
                className="group relative flex flex-col rounded-xl border p-6 transition-all duration-200 hover:-translate-y-1 sm:p-8"
                style={{
                  background: t.card,
                  borderColor: t.border,
                  boxShadow: t.softCardShadow,
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.borderColor = t.primary
                  event.currentTarget.style.boxShadow = t.elevatedCardShadow
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.borderColor = t.border
                  event.currentTarget.style.boxShadow = t.softCardShadow
                }}
              >
                {plan.featured && (
                  <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-black uppercase tracking-wider"
                    style={{ background: t.primary, color: t.buttonText }}
                  >
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold" style={{ color: t.heading }}>
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline">
                    <span
                      className="text-4xl font-black"
                      style={{ color: t.heading }}
                    >
                      {plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="ml-1" style={{ color: t.textMuted }}>
                        /mo
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs" style={{ color: t.textMuted }}>
                    {plan.sub}
                  </p>
                </div>
                <button
                  className="w-full rounded-xl border py-3 text-sm font-bold transition-all hover:opacity-90"
                  style={{
                    background: t.surface,
                    color: t.text,
                    borderColor: t.border,
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.background = t.buttonBg
                    event.currentTarget.style.color = t.buttonText
                    event.currentTarget.style.borderColor = t.buttonBg
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = t.surface
                    event.currentTarget.style.color = t.text
                    event.currentTarget.style.borderColor = t.border
                  }}
                >
                  {plan.btn}
                </button>
                <div className="mt-8 flex flex-col gap-4">
                  {plan.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-3 text-sm"
                      style={{ color: t.text }}
                    >
                      <span
                        className="material-symbols-outlined text-xl"
                        style={{ color: t.primary }}
                      >
                        check_circle
                      </span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  );
}
