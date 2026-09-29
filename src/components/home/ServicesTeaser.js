import Link from "next/link";
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import { SERVICES } from "@/config/site";
import { getDictionary, localePath, localizeService } from "@/i18n";

export default function ServicesTeaser({ lang }) {
  const t = getDictionary(lang);

  return (
    <section className="py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeading label={t.home.servLabel} title={t.home.servTitle}>
            {t.home.servText}
          </SectionHeading>
          <Link href={localePath(lang, "/services")} className="btn-ghost self-start sm:self-auto">
            {t.home.servAll}
          </Link>
        </div>

        <div className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 pb-2">
          {SERVICES.map((raw) => {
            const s = localizeService(raw, t);
            return (
              <Link
                key={s.slug}
                href={localePath(lang, `/services#${s.slug}`)}
                className="group snap-start shrink-0 w-[68%] sm:w-[40%] lg:w-auto"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface2">
                  <Image
                    src={s.images[0]}
                    alt={s.name}
                    fill
                    sizes="(min-width: 1024px) 20vw, (min-width: 640px) 40vw, 68vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </div>
                <h3 className="font-display text-xl mt-4 group-hover:text-gold transition-colors">{s.name}</h3>
                <p className="text-sm text-muted mt-1.5 line-clamp-2">{s.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
