import { Check } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { FaqAccordion } from "@/components/faq-accordion";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";

const openSourceFeatures = [
  "Full access to all 50+ tools",
  "Self-host on your infrastructure",
  "Community support via GitHub",
  "Modify and distribute under AGPL-3.0",
  "Access to all updates",
];

const commercialFeatures = [
  "Everything in Open Source",
  "No AGPL obligations",
  "Proprietary use allowed",
  "Unlimited users and devices",
  "Priority email support",
  "Lifetime updates included",
  "Use in commercial products",
  "Flexible deployment terms",
];

const useCases = [
  { useCase: "Personal projects", license: "Free (AGPL-3.0)" },
  { useCase: "Open source projects", license: "Free (AGPL-3.0)" },
  {
    useCase: "Internal company use (source code shared)",
    license: "Free (AGPL-3.0)",
  },
  { useCase: "Education and research", license: "Free (AGPL-3.0)" },
  {
    useCase: "SaaS product (code not shared publicly)",
    license: "Commercial",
  },
  { useCase: "Proprietary software distribution", license: "Commercial" },
  {
    useCase: "OEM / embedding in commercial products",
    license: "Commercial",
  },
  {
    useCase: "Removing AGPL attribution requirements",
    license: "Commercial",
  },
];

const faqItems = [
  {
    question: "What is AGPL-3.0?",
    answer:
      "AGPL-3.0 is an open-source license that requires anyone who modifies or uses the software over a network to make their source code available under the same license. It ensures the software remains free and open.",
  },
  {
    question: "Can I use SnapOtter for free in my company?",
    answer:
      "Yes, as long as you comply with AGPL-3.0 requirements. This means making your source code available if you modify SnapOtter or use it as part of a network service.",
  },
  {
    question: "What does the commercial license include?",
    answer:
      "The commercial license removes all AGPL obligations. You can use SnapOtter in proprietary products, embed it in commercial software, and deploy it without sharing your source code.",
  },
  {
    question: "Is the commercial license a subscription?",
    answer: "No. It is a one-time payment that includes lifetime updates. No recurring fees.",
  },
  {
    question: "Can I try SnapOtter before purchasing?",
    answer:
      "Yes. SnapOtter is fully functional under the AGPL-3.0 license. You can evaluate all features before deciding if you need a commercial license.",
  },
  {
    question: "Do I need a license key?",
    answer:
      "No. There are no license keys or activation required. The commercial license is a legal agreement, not a technical restriction.",
  },
];

export default function LicensingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        {/* Hero */}
        <section className="px-6 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn>
              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                Simple, transparent licensing
              </h1>
              <p className="mt-6 text-lg text-muted md:text-xl">
                SnapOtter is open source under AGPL-3.0. Use it freely or get a commercial license
                for proprietary use.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-6 pb-24">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {/* Open Source Card */}
            <FadeIn>
              <div className="flex h-full flex-col rounded-2xl border border-border p-8">
                <div className="mb-4">
                  <span className="inline-block rounded-full border border-border px-3 py-1 text-xs font-medium text-muted">
                    AGPL-3.0
                  </span>
                </div>
                <h2 className="text-2xl font-bold">Open Source</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Free</span>
                </div>
                <p className="mt-2 text-sm text-muted">
                  For personal use, open source projects, and evaluation
                </p>

                <ul className="mt-8 flex-1 space-y-3">
                  {openSourceFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="https://github.com/ashim-hq/ashim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 block rounded-lg border border-border py-3 text-center text-sm font-medium transition-colors hover:bg-background-alt"
                >
                  View on GitHub
                </a>
              </div>
            </FadeIn>

            {/* Commercial Card */}
            <FadeIn delay={0.1}>
              <div className="relative flex h-full flex-col rounded-2xl border-2 border-accent/40 p-8 shadow-[0_0_40px_-12px] shadow-accent/20">
                <div className="mb-4">
                  <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                    RECOMMENDED
                  </span>
                </div>
                <h2 className="text-2xl font-bold">Commercial License</h2>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$149</span>
                </div>
                <p className="mt-2 text-sm text-muted">one-time payment</p>
                <p className="mt-1 text-sm text-muted">For businesses and proprietary use</p>

                <ul className="mt-8 flex-1 space-y-3">
                  {commercialFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="mailto:contact@snapotter.com?subject=Commercial%20License"
                  className="mt-8 block rounded-lg bg-accent py-3 text-center text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                  Get License
                </a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Use Cases Table */}
        <section className="bg-background-alt px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                Do I need a commercial license?
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-12 overflow-hidden rounded-xl border border-border bg-background">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background-alt">
                      <th className="px-6 py-4 text-left text-sm font-semibold">Use Case</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold">License Needed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {useCases.map((row) => (
                      <tr key={row.useCase} className="border-b border-border last:border-0">
                        <td className="px-6 py-4 text-sm">{row.useCase}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={
                              row.license === "Commercial"
                                ? "inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent-hover"
                                : "inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700"
                            }
                          >
                            {row.license}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl">
                Frequently asked questions
              </h2>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="mt-12">
                <FaqAccordion items={faqItems} />
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-background-alt px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <FadeIn>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Need a custom agreement or have questions?
              </h2>
              <p className="mt-4 text-lg text-muted">
                Contact us at{" "}
                <a
                  href="mailto:contact@snapotter.com"
                  className="text-accent underline underline-offset-4 hover:text-accent-hover"
                >
                  contact@snapotter.com
                </a>
              </p>
              <a
                href="mailto:contact@snapotter.com?subject=Commercial%20License%20Inquiry"
                className="mt-8 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-bold text-accent-foreground transition-colors hover:bg-accent-hover"
              >
                Contact Sales
              </a>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
