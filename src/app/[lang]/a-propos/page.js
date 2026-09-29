import Image from "next/image";
import Link from "next/link";
import { FiScissors, FiShoppingBag, FiBookOpen, FiTruck } from "react-icons/fi";
import { pageMetadata } from "@/lib/seo";
import { getDictionary, localePath } from "@/i18n";

const PILLAR_ICONS = [FiScissors, FiShoppingBag, FiBookOpen, FiTruck];
const PHOTOS = [
  "/images/boutique/boutique-interieur.webp",
  "/images/services/formation-eleves.webp",
  "/images/boutique/boutique-rayons.webp",
];

export function generateMetadata({ params }) {
  const t = getDictionary(params.lang);
  return pageMetadata({
    lang: params.lang,
    title: t.meta.aboutTitle,
    description: t.meta.aboutDescription,
    path: "/a-propos",
    image: "/images/boutique/boutique-interieur.webp",
  });
}

export default function AboutPage({ params }) {
  const { lang } = params;
  const t = getDictionary(lang);
  const a = t.about;

  return (
    <div className="pt-32 pb-28">
      <div className="container-x">
        <header className="grid lg:grid-cols-2 gap-12 items-end mb-20">
          <div>
            <p className="label mb-4">{a.label}</p>
            <h1 className="font-display text-5xl sm:text-7xl leading-[1]">
              {a.title[0]}
              <span className="italic gold-text">{a.title[1]}</span>
            </h1>
          </div>
          <p className="text-muted text-lg leading-relaxed">{a.intro}</p>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-24">
          {PHOTOS.map((src, i) => (
            <div
              key={src}
              className={`relative aspect-[4/5] overflow-hidden border border-gold/20 ${
                i === 2 ? "col-span-2 lg:col-span-1 aspect-[16/10] lg:aspect-[4/5]" : ""
              } ${i === 1 ? "lg:mt-12" : ""}`}
            >
              <Image src={src} alt={a.photoAlts[i]} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-20 mb-24">
          <h2 className="font-display text-4xl sm:text-5xl leading-[1.05]">
            {a.promise[0]}
            <span className="italic text-gold">{a.promise[1]}</span>
          </h2>
          <div className="space-y-5 text-muted leading-relaxed">
            <p>{a.p1}</p>
            <p>{a.p2}</p>
            <p>{a.p3}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {a.pillars.map(([title, text], i) => {
            const Icon = PILLAR_ICONS[i];
            return (
              <div key={title} className="bg-surface border border-gold/15 p-7">
                <Icon className="text-gold" size={24} />
                <h3 className="font-display text-2xl mt-5">{title}</h3>
                <p className="text-sm text-muted mt-3 leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-24">
          <Link href={localePath(lang, "/boutique")} className="btn-gold">
            {a.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
