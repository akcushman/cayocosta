import { useId } from "react";
import styles from "./AKLogo.module.css";

// The set's maker badge: "AK" inside a round crest, like a kamon stamped
// in matte silver on a 90s Japanese set.
export default function AKLogo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  const silver = `silver-${id}`;

  return (
    <svg className={`${styles.logo} ${className ?? ""}`} viewBox="0 0 56 56" role="img" aria-label="AK">
      <defs>
        {/* Brushed, not mirrored: a soft top-to-bottom falloff. */}
        <linearGradient id={silver} x1="0" y1="4" x2="0" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#eceef1" />
          <stop offset="0.55" stopColor="#b9bdc4" />
          <stop offset="1" stopColor="#8e939b" />
        </linearGradient>
      </defs>

      <circle cx="28" cy="28" r="26" fill="none" stroke={`url(#${silver})`} strokeWidth="2" />
      <circle cx="28" cy="28" r="22.4" fill="none" stroke={`url(#${silver})`} strokeWidth="0.7" opacity="0.8" />
      <text x="28" y="35.2" textAnchor="middle" className={styles.letters} fill={`url(#${silver})`}>
        AK
      </text>
    </svg>
  );
}
