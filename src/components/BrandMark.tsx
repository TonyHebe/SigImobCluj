import Image from "next/image";

type Props = {
  /** Render size in px (both width and height). Defaults to 36px (Tailwind `size-9`). */
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandMark({ size = 36, className, priority }: Props) {
  return (
    <Image
      src="/brand/sig-imob-cluj.svg"
      alt="Sig Imobiliare Cluj"
      width={size}
      height={size}
      priority={priority}
      unoptimized
      className={[
        "rounded-xl bg-slate-900/5 shadow-sm ring-1 ring-slate-200 object-cover",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

