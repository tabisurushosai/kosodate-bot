import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  showText?: boolean;
};

export function BrandLogo({ className, showText = true }: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/20">
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          fill="none"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.5 17.25c0-4.15 3.35-7.5 7.5-7.5s7.5 3.35 7.5 7.5v4.25H8.5v-4.25Z"
            fill="currentColor"
            opacity="0.22"
          />
          <path
            d="M10.25 20.5v-3.25A5.75 5.75 0 0 1 16 11.5a5.75 5.75 0 0 1 5.75 5.75v3.25"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M7.75 21.25h16.5M12.25 15.75h.01M19.75 15.75h.01"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
          <path
            d="M13.5 20.75c.62.7 1.45 1.05 2.5 1.05s1.88-.35 2.5-1.05"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="2"
          />
        </svg>
      </span>
      {showText && (
        <span>
          <span className="block text-base font-bold leading-5 text-slate-950">
            Kosodate Bot
          </span>
          <span className="block text-xs leading-5 text-slate-500">
            保護者向けAI相談
          </span>
        </span>
      )}
    </div>
  );
}
