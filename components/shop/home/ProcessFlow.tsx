import Image from "next/image";
import { processFlowTheme } from "@/lib/theme";

const { steps: baseSteps, hexagonClip: HEXAGON_CLIP } = processFlowTheme;

interface StepText { title?: string; description?: string }

interface ProcessFlowProps {
  images?: (string | null)[];
  heading?: string;
  stepTexts?: StepText[];
}

export function ProcessFlow({ images = [], heading, stepTexts = [] }: ProcessFlowProps) {
  const resolvedHeading = heading || processFlowTheme.heading;
  const steps = baseSteps.map((s, i) => ({
    ...s,
    image: images[i] ?? s.image,
    title: stepTexts[i]?.title || s.title,
    description: stepTexts[i]?.description || s.description,
  }));
  return (
    <section className="py-16 bg-honey-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-14">
          {resolvedHeading}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">

              {/* Adımlar arası bağlantı çizgisi (masaüstü) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-honey-medium/40 z-0 -translate-x-1/2" />
              )}

              <div className="relative z-10 flex flex-col items-center text-center gap-4">

                {/* ── Bal peteği step number ────────────────────────────── */}
                <div
                  className="flex items-center justify-center bg-honey-dark text-white font-black text-base flex-shrink-0 select-none"
                  style={{
                    width:    56,
                    height:   56,
                    clipPath: HEXAGON_CLIP,
                  }}
                >
                  {step.number}
                </div>

                {/* ── İnfografik görsel ─────────────────────────────────── */}
                <div className="relative w-36 h-36 md:w-44 md:h-44">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain drop-shadow-sm"
                    sizes="(max-width: 768px) 144px, 176px"
                  />
                </div>

                {/* ── Metin ─────────────────────────────────────────────── */}
                <div>
                  <h3 className="text-sm font-bold text-honey-dark mb-2 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
