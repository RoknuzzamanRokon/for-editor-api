'use client'
import { useMarketingTheme } from '@/config/marketingTheme'

const plans = [
  { name: 'Demo',       price: '$0',     sub: 'Perfect for testing and small personal projects.',  btn: 'Start Free',    featured: false, features: ['100 requests / month', 'Basic Converters', 'Community Support'] },
  { name: 'General',    price: '$19',    sub: 'Ideal for professional developers and startups.',   btn: 'Get Started',   featured: false, features: ['10k requests / month', 'All Converters', 'Email Support'] },
  { name: 'Admin',      price: '$49',    sub: 'Scale your business with high-volume access.',      btn: 'Get Started',   featured: true,  features: ['50k requests / month', 'Priority Access', '24/7 Priority Support', 'Advanced Analytics'] },
  { name: 'Enterprise', price: 'Custom', sub: 'Dedicated solutions for large organizations.',      btn: 'Contact Sales', featured: false, features: ['Unlimited requests', 'Custom Integrations', 'Dedicated Manager', 'SLA Guarantee'] },
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
            Simple, Transparent{" "}
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
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl p-6 transition-all hover:shadow-2xl sm:p-8 ${plan.featured ? "border-2" : "border"}`}
              style={{
                background: t.card,
                borderColor: plan.featured ? t.primary : t.border,
                boxShadow: plan.featured
                  ? t.elevatedCardShadow
                  : t.softCardShadow,
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
                className="w-full rounded-xl py-3 text-sm font-bold transition-all hover:opacity-90"
                style={
                  plan.featured
                    ? { background: t.buttonBg, color: t.buttonText }
                    : {
                        background: t.surface,
                        color: t.text,
                        border: `1px solid ${t.border}`,
                      }
                }
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
          ))}
        </div>
      </div>
    </main>
  );
}
