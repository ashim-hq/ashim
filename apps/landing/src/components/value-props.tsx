import { Brain, Layers, Shield } from "lucide-react";
import { FadeIn } from "./fade-in";

const props = [
  {
    number: "01",
    title: "100% Air-Gapped",
    description:
      "No cloud. No uploads. No telemetry. Deploy behind your firewall and process images in complete isolation.",
    icon: Shield,
  },
  {
    number: "02",
    title: "AI That Stays Local",
    description:
      "Background removal, upscaling, OCR, face detection — 14 AI models running entirely on your hardware.",
    icon: Brain,
  },
  {
    number: "03",
    title: "50+ Tools, One Platform",
    description:
      "Resize, crop, compress, watermark, convert, compose — everything your team needs in a single self-hosted suite.",
    icon: Layers,
  },
];

export function ValueProps() {
  return (
    <section className="bg-background-alt px-6 py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3 md:gap-16">
        {props.map((prop, i) => (
          <FadeIn key={prop.number} delay={i * 0.1}>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-accent">{prop.number}</span>
                <prop.icon size={20} className="text-accent" />
              </div>
              <h3 className="mt-3 text-xl font-bold tracking-tight md:text-2xl">{prop.title}</h3>
              <p className="mt-3 leading-relaxed text-muted">{prop.description}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
