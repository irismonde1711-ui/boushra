import Link from "next/link";
import Image from "next/image";
import { getDictionary, localePath } from "@/i18n";

export default function BrandStory({ lang }) {
  const t = getDictionary(lang);
  const [before, em, after] = t.home.storyTitle;

  return (
    <section className="py-24 sm:py-32 bg-surface border-y border-gold/10 overflow-hidden">
      <div className="container-x grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative grid grid-cols-2 gap-4">
          <div className="relative aspect-[4/5] overflow-hidden border border-gold/25">
            <Image
              src="/images/boutique/boutique-rayons.webp"
              alt={t.home.storyAlts[0]}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="relative aspect-[4/5] overflow-hidden border border-gold/25 mt-14">
            <Image
              src="/images/boutique/boutique-accueil.webp"
              alt={t.home.storyAlts[1]}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <p className="label mb-4">{t.home.storyLabel}</p>
          <h2 className="font-display text-4xl sm:text-5xl leading-[1.05]">
            {before}
            <span className="italic gold-text">{em}</span>
            {after}
          </h2>
          <p className="text-muted leading-relaxed mt-6">{t.home.storyP1}</p>
          <p className="text-muted leading-relaxed mt-4">{t.home.storyP2}</p>
          <Link href={localePath(lang, "/a-propos")} className="btn-gold mt-10">
            {t.home.storyCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
