export default function SectionHeading({ label, title, children, align = "left", as: Tag = "h2" }) {
  const centered = align === "center";
  return (
    <div className={centered ? "text-center mx-auto max-w-2xl" : "max-w-2xl"}>
      {label && <p className="label mb-4">{label}</p>}
      <Tag className="font-display text-4xl sm:text-5xl leading-[1.05] text-fg">{title}</Tag>
      {children && <p className="text-muted mt-5 leading-relaxed">{children}</p>}
    </div>
  );
}
