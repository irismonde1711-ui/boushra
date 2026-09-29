import { getDictionary } from "@/i18n";

export default function PillarsMarquee({ lang }) {
  const words = getDictionary(lang).home.marquee;
  const row = [...words, ...words];
  return (
    <div className="border-y border-gold/20 bg-surface overflow-hidden py-5" aria-hidden>
      <div className="flex w-max animate-marquee">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0">
            {row.map((w, i) => (
              <span key={`${copy}-${i}`} className="flex items-center font-display italic text-2xl sm:text-3xl text-fg/90 px-6">
                {w}
                <span className="ml-12 text-gold text-base not-italic">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
