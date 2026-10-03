import type { CSSProperties } from "react";

type P = { className?: string; style?: CSSProperties };

/* ---------------------------- character ---------------------------- */

export function Frog({ className, style }: P) {
  return (
    <svg viewBox="0 0 90 84" className={className} style={style}>
      <defs>
        <radialGradient id="frogBody" cx="38%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#a7ef70" />
          <stop offset="60%" stopColor="#6fd33f" />
          <stop offset="100%" stopColor="#3f9c25" />
        </radialGradient>
      </defs>
      {/* shadow */}
      <ellipse cx="45" cy="78" rx="26" ry="5" fill="rgba(0,0,0,0.22)" />
      {/* legs */}
      <ellipse cx="20" cy="70" rx="13" ry="7" fill="#4aa82c" />
      <ellipse cx="70" cy="70" rx="13" ry="7" fill="#4aa82c" />
      {/* body */}
      <ellipse cx="45" cy="54" rx="27" ry="23" fill="url(#frogBody)" />
      <ellipse cx="45" cy="62" rx="16" ry="11" fill="#dcf7bd" opacity="0.9" />
      {/* arms */}
      <ellipse cx="20" cy="52" rx="8" ry="6" fill="#5cba33" />
      <ellipse cx="70" cy="52" rx="8" ry="6" fill="#5cba33" />
      {/* eye bumps */}
      <circle cx="29" cy="30" r="13" fill="url(#frogBody)" />
      <circle cx="61" cy="30" r="13" fill="url(#frogBody)" />
      <circle cx="29" cy="29" r="8.5" fill="#fff" />
      <circle cx="61" cy="29" r="8.5" fill="#fff" />
      <circle cx="30" cy="30" r="4.2" fill="#26323a" />
      <circle cx="60" cy="30" r="4.2" fill="#26323a" />
      <circle cx="31.6" cy="28.2" r="1.5" fill="#fff" />
      <circle cx="61.6" cy="28.2" r="1.5" fill="#fff" />
      {/* smile + cheeks */}
      <path
        d="M35 46 Q45 54 55 46"
        stroke="#2f6d1c"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="26" cy="45" rx="5" ry="3.2" fill="#ff9aa8" opacity="0.65" />
      <ellipse cx="64" cy="45" rx="5" ry="3.2" fill="#ff9aa8" opacity="0.65" />
    </svg>
  );
}

/* ---------------------------- scenery ---------------------------- */

export function Buffalo({ className, style }: P) {
  return (
    <svg viewBox="0 0 120 92" className={className} style={style}>
      <ellipse cx="60" cy="88" rx="37" ry="4" fill="rgba(0,0,0,0.2)" />
      {/* wide curved horns */}
      <path d="M43 28 Q22 29 10 17 Q4 11 9 5 Q12 4 14 10 Q23 18 43 17 Z" fill="#f0e7d2" stroke="#292d3a" strokeWidth="2.5" />
      <path d="M77 28 Q98 29 110 17 Q116 11 111 5 Q108 4 106 10 Q97 18 77 17 Z" fill="#f0e7d2" stroke="#292d3a" strokeWidth="2.5" />
      <path d="M13 10 Q17 17 27 20" stroke="#c9c5b8" strokeWidth="2" fill="none" opacity="0.8" />
      <path d="M107 10 Q103 17 93 20" stroke="#c9c5b8" strokeWidth="2" fill="none" opacity="0.8" />
      {/* ears */}
      <path d="M31 31 Q17 25 14 34 Q14 43 31 43 Z" fill="#59606d" stroke="#292d3a" strokeWidth="2" />
      <path d="M89 31 Q103 25 106 34 Q106 43 89 43 Z" fill="#59606d" stroke="#292d3a" strokeWidth="2" />
      {/* short legs behind the head */}
      <path d="M38 69 L36 84 Q39 88 45 84 L47 69 Z" fill="#303442" stroke="#292d3a" strokeWidth="2" />
      <path d="M73 69 L75 84 Q81 88 84 84 L82 69 Z" fill="#303442" stroke="#292d3a" strokeWidth="2" />
      <path d="M35 82 Q40 86 46 82 L47 87 Q40 91 35 87 Z" fill="#20242f" />
      <path d="M74 82 Q80 86 85 82 L85 87 Q79 91 74 87 Z" fill="#20242f" />
      {/* rounded head/body */}
      <path d="M27 40 Q29 23 60 21 Q91 23 93 40 L91 62 Q85 78 60 79 Q35 78 29 62 Z" fill="#454957" stroke="#292d3a" strokeWidth="2.5" />
      <path d="M32 44 Q36 29 56 27 Q46 37 47 58 Q38 54 32 57 Z" fill="#626977" opacity="0.7" />
      <path d="M88 44 Q84 29 64 27 Q74 37 73 58 Q82 54 88 57 Z" fill="#353946" opacity="0.55" />
      {/* shaggy forelock */}
      <path d="M31 31 Q35 19 45 15 L47 25 L57 13 L60 24 L72 15 L71 27 Q82 20 87 31 Q75 27 60 29 Q44 27 31 31 Z" fill="#343844" stroke="#292d3a" strokeWidth="2" strokeLinejoin="round" />
      {/* friendly face */}
      <circle cx="45" cy="45" r="6" fill="#f8f5e9" />
      <circle cx="75" cy="45" r="6" fill="#f8f5e9" />
      <circle cx="45" cy="46" r="3" fill="#20242d" />
      <circle cx="75" cy="46" r="3" fill="#20242d" />
      <circle cx="46" cy="45" r="1" fill="#fff" />
      <circle cx="76" cy="45" r="1" fill="#fff" />
      <ellipse cx="60" cy="57" rx="14" ry="9" fill="#606675" />
      <circle cx="55" cy="56" r="1.8" fill="#292d3a" />
      <circle cx="65" cy="56" r="1.8" fill="#292d3a" />
      <path d="M52 62 Q60 69 68 62" stroke="#292d3a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Duck({ className, style }: P) {
  return (
    <svg viewBox="0 0 80 70" className={className} style={style}>
      <ellipse cx="40" cy="64" rx="30" ry="4" fill="rgba(0,0,0,0.18)" />
      {/* water ripples */}
      <path d="M8 60 q8 -4 16 0 t16 0 t16 0" stroke="#9adcf7" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round" />
      {/* tail */}
      <path d="M62 38 q14 -6 12 6 q-8 2 -12 -6" fill="#f7f2e4" stroke="#292d3a" strokeWidth="2" />
      {/* body */}
      <path d="M18 44 Q16 28 40 26 Q64 28 63 44 Q63 54 40 56 Q17 54 18 44 Z" fill="#f7f2e4" stroke="#292d3a" strokeWidth="2.5" />
      {/* wing */}
      <path d="M32 40 Q45 34 56 42 Q48 50 34 48 Z" fill="#e8e0c8" stroke="#292d3a" strokeWidth="1.8" />
      {/* head */}
      <circle cx="24" cy="18" r="14" fill="#f7f2e4" stroke="#292d3a" strokeWidth="2.5" />
      {/* beak */}
      <path d="M10 16 Q0 15 2 20 Q4 24 13 23 Z" fill="#f8a63a" stroke="#292d3a" strokeWidth="2" />
      {/* eye */}
      <circle cx="23" cy="15" r="4" fill="#f8f5e9" stroke="#292d3a" strokeWidth="1.4" />
      <circle cx="23" cy="16" r="1.8" fill="#20242d" />
    </svg>
  );
}

export function Carp({ className, style }: P) {
  return (
    <svg viewBox="0 0 100 60" className={className} style={style}>
      <ellipse cx="50" cy="54" rx="36" ry="4" fill="rgba(0,0,0,0.15)" />
      {/* tail */}
      <path d="M78 30 L98 18 L96 34 L100 46 L80 36 Z" fill="#f39c3d" stroke="#292d3a" strokeWidth="2" strokeLinejoin="round" />
      {/* body */}
      <path d="M14 30 Q12 10 48 10 Q86 10 84 30 Q86 50 48 50 Q12 50 14 30 Z" fill="#ffb64d" stroke="#292d3a" strokeWidth="2.5" />
      {/* belly */}
      <path d="M22 32 Q48 46 76 32 Q48 40 22 32 Z" fill="#ffd98a" />
      {/* top fin */}
      <path d="M38 11 Q45 2 55 11 Z" fill="#f39c3d" stroke="#292d3a" strokeWidth="2" />
      {/* side fin */}
      <path d="M40 34 q-12 2 -8 10 q12 -2 10 -8" fill="#f39c3d" stroke="#292d3a" strokeWidth="2" />
      {/* scale arcs */}
      <path d="M30 24 q6 -5 12 0 M50 22 q6 -5 12 0 M64 26 q5 -4 10 0" stroke="#e08b1f" strokeWidth="2" fill="none" opacity="0.8" />
      {/* eye */}
      <circle cx="20" cy="22" r="6" fill="#f8f5e9" stroke="#292d3a" strokeWidth="2" />
      <circle cx="20" cy="23" r="2.6" fill="#20242d" />
      <circle cx="21" cy="22" r="0.9" fill="#fff" />
      {/* mouth */}
      <path d="M12 32 q4 4 8 3" stroke="#292d3a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Stork({ className, style }: P) {
  return (
    <svg viewBox="0 0 80 110" className={className} style={style}>
      <ellipse cx="42" cy="105" rx="30" ry="4" fill="rgba(0,0,0,0.18)" />
      {/* legs */}
      <path d="M34 66 L30 101 M34 82 L40 101 M50 68 L46 101" stroke="#e8954a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* body */}
      <path d="M18 70 Q20 48 44 46 Q68 50 66 70 Q66 84 42 86 Q18 84 18 70 Z" fill="#f7f2e4" stroke="#292d3a" strokeWidth="2.5" />
      {/* wing */}
      <path d="M30 58 Q52 52 62 66 Q54 76 34 74 Z" fill="#e8e0c8" stroke="#292d3a" strokeWidth="2" />
      <path d="M52 54 Q66 50 70 58 Q62 62 54 60 Z" fill="#454957" stroke="#292d3a" strokeWidth="2" />
      {/* neck */}
      <path d="M56 52 Q64 40 60 28 Q58 18 50 16 Q44 20 48 30 Q52 40 46 48 Z" fill="#f7f2e4" stroke="#292d3a" strokeWidth="2.5" />
      {/* head */}
      <circle cx="48" cy="15" r="9" fill="#f7f2e4" stroke="#292d3a" strokeWidth="2.5" />
      {/* beak */}
      <path d="M40 12 L24 16 L40 19 Z" fill="#f8a63a" stroke="#292d3a" strokeWidth="2" strokeLinejoin="round" />
      {/* eye */}
      <circle cx="47" cy="13" r="2.6" fill="#20242d" />
      <circle cx="48" cy="12" r="0.9" fill="#fff" />
    </svg>
  );
}

export function Crab({ className, style }: P) {
  return (
    <svg viewBox="0 0 80 60" className={className} style={style}>
      <ellipse cx="40" cy="54" rx="30" ry="4" fill="rgba(0,0,0,0.15)" />
      {/* legs */}
      {[
        "M14 26 L2 18 M14 30 L2 30 M14 34 L2 42",
        "M66 26 L78 18 M66 30 L78 30 M66 34 L78 42",
      ].map((d, i) => (
        <path key={i} d={d} stroke="#d64f3f" strokeWidth="3" strokeLinecap="round" fill="none" />
      ))}
      {/* claws */}
      <path d="M10 14 q-10 -6 -8 -16 q10 0 10 8" fill="#e2604f" stroke="#292d3a" strokeWidth="2" />
      <path d="M70 14 q10 -6 8 -16 q-10 0 -10 8" fill="#e2604f" stroke="#292d3a" strokeWidth="2" />
      <path d="M0 -4 q6 8 12 8" stroke="#292d3a" strokeWidth="2" fill="none" />
      <path d="M80 -4 q-6 8 -12 8" stroke="#292d3a" strokeWidth="2" fill="none" />
      {/* body */}
      <path d="M14 26 Q14 8 40 8 Q66 8 66 26 Q66 46 40 46 Q14 46 14 26 Z" fill="#e2604f" stroke="#292d3a" strokeWidth="2.5" />
      {/* shell marks */}
      <path d="M28 20 q4 -4 8 0 M46 18 q4 -4 8 0" stroke="#c14132" strokeWidth="2" fill="none" />
      {/* eye stalks */}
      <path d="M28 12 L26 4 M52 12 L54 4" stroke="#292d3a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="26" cy="3" r="5" fill="#f8f5e9" stroke="#292d3a" strokeWidth="2" />
      <circle cx="54" cy="3" r="5" fill="#f8f5e9" stroke="#292d3a" strokeWidth="2" />
      <circle cx="26" cy="3.5" r="2" fill="#20242d" />
      <circle cx="54" cy="3.5" r="2" fill="#20242d" />
      {/* smile */}
      <path d="M34 36 Q40 42 46 36" stroke="#292d3a" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Turtle({ className, style }: P) {
  return (
    <svg viewBox="0 0 90 70" className={className} style={style}>
      <ellipse cx="45" cy="64" rx="34" ry="4" fill="rgba(0,0,0,0.15)" />
      {/* legs */}
      <path d="M16 48 L10 60 M20 52 L14 62 M74 48 L80 60 M70 52 L76 62" stroke="#3f9c46" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* tail */}
      <path d="M84 40 q10 0 6 8 q-8 2 -8 -6" fill="#4aad4d" stroke="#292d3a" strokeWidth="2" />
      {/* head */}
      <circle cx="10" cy="36" r="11" fill="#54b45a" stroke="#292d3a" strokeWidth="2.5" />
      <circle cx="6" cy="35" r="3" fill="#20242d" />
      <circle cx="7" cy="34" r="1" fill="#fff" />
      <path d="M1 42 q4 4 9 3" stroke="#292d3a" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* shell */}
      <path d="M16 44 Q16 14 46 12 Q78 14 78 44 Q78 60 46 62 Q16 60 16 44 Z" fill="#4aad4d" stroke="#292d3a" strokeWidth="2.5" />
      <path d="M22 38 Q46 20 72 38 Q46 30 22 38 Z" fill="#79cd7d" />
      {/* shell pattern */}
      <path d="M47 16 L40 32 M47 16 L54 32 M40 32 L47 48 M54 32 L47 48 M22 38 L40 32 M72 38 L54 32" stroke="#2f8a3a" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function Boat({ className, style }: P) {
  return (
    <svg viewBox="0 0 130 80" className={className} style={style}>
      <ellipse cx="65" cy="76" rx="46" ry="4" fill="rgba(0,0,0,0.15)" />
      <path
        d="M8 34 Q65 16 122 34 L104 62 Q65 72 26 62 Z"
        fill="#a9713d"
        stroke="#7d4f27"
        strokeWidth="2.5"
      />
      <path d="M18 38 Q65 24 112 38 L98 56 Q65 63 32 56 Z" fill="#c88f52" />
      <path d="M30 44 h68" stroke="#9a6534" strokeWidth="2" />
      <path d="M26 51 h76" stroke="#9a6534" strokeWidth="2" />
      <path
        d="M14 33 q-8 -10 4 -14 q2 8 -4 14"
        fill="#c88f52"
        stroke="#7d4f27"
        strokeWidth="1.5"
      />
      <path
        d="M112 36 q34 6 12 22"
        stroke="#c9a670"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeDasharray="4 5"
      />
    </svg>
  );
}

export function Pagoda({ className, style }: P) {
  return (
    <svg viewBox="0 0 90 110" className={className} style={style}>
      <rect x="30" y="88" width="30" height="18" fill="#9c6b45" />
      <rect x="24" y="80" width="42" height="10" rx="3" fill="#b58055" />
      <path d="M10 78 Q45 66 80 78 L72 66 Q45 58 18 66 Z" fill="#c0392b" />
      <path d="M18 66 Q45 58 72 66 L66 56 Q45 50 24 56 Z" fill="#e05a45" />
      <rect x="34" y="58" width="22" height="14" fill="#f3d9a4" />
      <path d="M18 54 Q45 42 72 54 L64 42 Q45 34 26 42 Z" fill="#c0392b" />
      <rect x="36" y="34" width="18" height="12" fill="#f3d9a4" />
      <path d="M26 32 Q45 20 64 32 L56 22 Q45 14 34 22 Z" fill="#e05a45" />
      <path d="M45 16 v-12" stroke="#e0b552" strokeWidth="3" />
      <circle cx="45" cy="3" r="4" fill="#f2c14e" />
    </svg>
  );
}

export function Tree({ className, style }: P) {
  return (
    <svg viewBox="0 0 90 110" className={className} style={style}>
      {/* ground shadow */}
      <ellipse cx="45" cy="106" rx="27" ry="5" fill="rgba(0,0,0,0.15)" />
      {/* trunk */}
      <path d="M45 68 q-8 22 -6 38 l7 2 q8 -22 6 -40 l-7 0 Z" fill="#8a5a33" />
      <path d="M45 68 q8 22 6 38 l-7 2 q-8 -22 -6 -40 Z" fill="#9c6b45" />
      <rect x="44" y="72" width="2.6" height="26" rx="1.3" fill="#6f4422" opacity="0.5" />
      {/* branch */}
      <path d="M45 74 q-13 -5 -17 -18" stroke="#8a5a33" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* canopy layers */}
      <circle cx="45" cy="52" r="30" fill="#2f8a3a" />
      <circle cx="25" cy="57" r="21" fill="#3f9c46" />
      <circle cx="65" cy="58" r="20" fill="#35853b" />
      <circle cx="45" cy="35" r="23" fill="#4aad4d" />
      <circle cx="31" cy="41" r="15" fill="#54b45a" />
      <circle cx="60" cy="43" r="13" fill="#5cc05f" />
      {/* highlights */}
      <circle cx="37" cy="29" r="7" fill="#79cd7d" opacity="0.9" />
      <circle cx="56" cy="33" r="5" fill="#8fda8a" opacity="0.8" />
      <circle cx="27" cy="46" r="5" fill="#6fce70" opacity="0.7" />
      {/* fruits */}
      <circle cx="20" cy="63" r="4" fill="#ffb23e" stroke="#e08b1f" strokeWidth="1" />
      <circle cx="71" cy="64" r="4" fill="#ff9e3d" stroke="#e08b1f" strokeWidth="1" />
      <circle cx="47" cy="17" r="4" fill="#ffb23e" stroke="#e08b1f" strokeWidth="1" />
    </svg>
  );
}

export function Lotus({ className, style }: P) {
  return (
    <svg viewBox="0 0 70 60" className={className} style={style}>
      {/* leaf pad */}
      <ellipse cx="35" cy="48" rx="28" ry="9" fill="#2f8f3e" />
      <path d="M7 48 q14 -6 28 0 t28 0" stroke="#4aa82c" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* back petals */}
      <path d="M35 41 q-19 -11 -16 -25 q16 9 16 25 Z" fill="#f486b4" stroke="#e05f96" strokeWidth="1" />
      <path d="M35 41 q19 -11 16 -25 q-16 9 -16 25 Z" fill="#f796c0" stroke="#e05f96" strokeWidth="1" />
      {/* front petals */}
      <path d="M35 41 q-13 -2 -12 -16 q12 4 12 16 Z" fill="#ff9ec4" stroke="#e8739f" strokeWidth="1.2" />
      <path d="M35 41 q13 -2 12 -16 q-12 4 -12 16 Z" fill="#ffb3d1" stroke="#e8739f" strokeWidth="1.2" />
      {/* center bud */}
      <path d="M35 41 q-6 -13 0 -20 q6 7 0 20 Z" fill="#ffd0e2" stroke="#f486b4" strokeWidth="0.8" />
      <circle cx="35" cy="40" r="2.6" fill="#ffe6a1" />
      {/* petal veins */}
      <path d="M35 41 q-10 -9 -12 -18" stroke="#ffffff" strokeWidth="0.9" fill="none" opacity="0.55" strokeLinecap="round" />
      <path d="M35 41 q10 -9 12 -18" stroke="#ffffff" strokeWidth="0.9" fill="none" opacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

export function Reed({ className, style }: P) {
  return (
    <svg viewBox="0 0 60 100" className={className} style={style}>
      <path
        d="M18 98 q-6 -40 6 -70"
        stroke="#3f9c46"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M32 98 q4 -44 -6 -78"
        stroke="#54b45a"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse cx="26" cy="22" rx="5" ry="13" fill="#8a5a33" />
      <ellipse cx="12" cy="34" rx="4" ry="11" fill="#9c6b45" />
      <path
        d="M46 98 q10 -34 2 -58"
        stroke="#35853b"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Rock({ className, style }: P) {
  return (
    <svg viewBox="0 0 80 56" className={className} style={style}>
      <ellipse cx="40" cy="52" rx="30" ry="4" fill="rgba(0,0,0,0.14)" />
      <path
        d="M8 48 q-4 -22 16 -28 q14 -14 32 -4 q18 4 16 22 q2 10 -10 10 Z"
        fill="#9aa7b1"
      />
      <path d="M24 20 q14 -14 32 -4 q-12 2 -18 10 q-8 -6 -14 -6 Z" fill="#c3ced6" />
    </svg>
  );
}

export function Lantern({ className, style }: P) {
  return (
    <svg viewBox="0 0 60 90" className={className} style={style}>
      <path d="M30 2 q-10 8 0 16 q10 -8 0 -16" fill="#e0b552" />
      <rect x="16" y="18" width="28" height="8" rx="3" fill="#c0392b" />
      <path
        d="M16 24 q-10 16 0 32 q14 8 28 0 q10 -16 0 -32 q-14 -6 -28 0"
        fill="#f4842f"
      />
      <ellipse cx="30" cy="42" rx="10" ry="16" fill="#ffd166" opacity="0.85" />
      <rect x="20" y="56" width="20" height="7" rx="3" fill="#c0392b" />
      <path d="M24 63 l-3 12 M36 63 l3 12 M30 63 v13" stroke="#e0b552" strokeWidth="2.5" />
    </svg>
  );
}

export function LilyClump({ className, style }: P) {
  return (
    <svg viewBox="0 0 90 50" className={className} style={style}>
      <ellipse cx="20" cy="28" rx="17" ry="10" fill="#3f9c46" />
      <ellipse cx="20" cy="26" rx="13" ry="7" fill="#54b45a" />
      <ellipse cx="58" cy="34" rx="20" ry="11" fill="#35853b" />
      <ellipse cx="58" cy="32" rx="15" ry="8" fill="#49a54f" />
      <ellipse cx="42" cy="16" rx="13" ry="8" fill="#3f9c46" />
      <ellipse cx="42" cy="15" rx="9" ry="5" fill="#5cba63" />
    </svg>
  );
}

/** Chùa Cầu – Japanese covered bridge (Hội An). */
export function Bridge({ className, style }: P) {
  return (
    <svg viewBox="0 0 300 190" className={className} style={style}>
      {/* water shadow */}
      <ellipse cx="150" cy="178" rx="128" ry="10" fill="rgba(0,0,0,0.18)" />
      {/* stone piers */}
      <rect x="116" y="84" width="68" height="96" rx="10" fill="#c2bba4" stroke="#7d7867" strokeWidth="3" />
      <path d="M122 92 h56 M122 106 h56 M122 120 h56" stroke="#9a9480" strokeWidth="2" />
      {/* deck */}
      <rect x="4" y="94" width="292" height="16" rx="8" fill="#a9713d" stroke="#7d4f27" strokeWidth="3" />
      <path d="M4 110 H296" stroke="#8a5a33" strokeWidth="2" />
      {/* ramps */}
      <path d="M6 112 L86 82 L100 82 L42 112 Z" fill="#c88f52" stroke="#7d4f27" strokeWidth="2.5" />
      <path d="M294 112 L214 82 L200 82 L258 112 Z" fill="#c88f52" stroke="#7d4f27" strokeWidth="2.5" />
      <path d="M14 104 L74 88 M286 104 L226 88" stroke="#9a6534" strokeWidth="2" />
      {/* ramp railings */}
      <path d="M10 108 L84 80 M82 82 L88 80 M290 108 L216 80 M212 82 L218 80" stroke="#6f4a26" strokeWidth="3" fill="none" />
      {[16, 32, 48, 64].map((px) => (
        <rect key={`l${px}`} x={px} y={100 - (px - 8) * 0.26} width="3.4" height="15" fill="#6f4a26" />
      ))}
      {[284, 268, 252, 236].map((px) => (
        <rect key={`r${px}`} x={px} y={100 - (292 - px) * 0.26} width="3.4" height="15" fill="#6f4a26" />
      ))}
      {/* covered hall */}
      <rect x="96" y="30" width="108" height="58" fill="#8a5a33" stroke="#5f3d1f" strokeWidth="3" />
      <rect x="96" y="30" width="108" height="16" fill="#9c6b45" />
      <path d="M96 38 h108 M96 46 h108" stroke="#5f3d1f" strokeWidth="1.6" />
      {/* windows */}
      <rect x="104" y="52" width="20" height="18" rx="9" fill="#f3d9a4" stroke="#5f3d1f" strokeWidth="2" />
      <rect x="132" y="52" width="36" height="24" rx="4" fill="#f3d9a4" stroke="#5f3d1f" strokeWidth="2" />
      <rect x="176" y="52" width="20" height="18" rx="9" fill="#f3d9a4" stroke="#5f3d1f" strokeWidth="2" />
      {/* tiled roof with curved ends */}
      <path d="M72 40 Q80 14 114 20 Q150 6 186 20 Q220 14 228 40 Q216 26 150 26 Q84 26 72 40 Z" fill="#c85b34" stroke="#8a3a20" strokeWidth="3" />
      <path d="M88 32 Q150 20 212 32" stroke="#8a3a20" strokeWidth="2" fill="none" />
      <path d="M100 25 Q150 13 200 25" stroke="#8a3a20" strokeWidth="2" fill="none" />
      {/* small shrine on top */}
      <rect x="138" y="4" width="24" height="12" fill="#e05a45" stroke="#8a3a20" strokeWidth="2" />
      <path d="M130 8 Q150 -8 170 8 L168 4 Q150 -10 132 4 Z" fill="#8a3a20" />
      <rect x="146" y="6" width="8" height="10" rx="3" fill="#f3d9a4" />
      {/* hall posts down to deck */}
      <rect x="102" y="88" width="8" height="22" fill="#6f4a26" />
      <rect x="190" y="88" width="8" height="22" fill="#6f4a26" />
      {/* hanging lanterns */}
      {[112, 150, 188].map((lx, i) => (
        <g key={i} transform={`translate(${lx} 48)`}>
          <circle r="7" fill="#ffb84d" opacity="0.25" />
          <rect x="-3" y="0" width="6" height="4" rx="1.5" fill="#b8322c" />
          <ellipse cy="7" rx="4" ry="5.4" fill="#f4842f" />
          <path d="M0 12.4 v5" stroke="#e0b552" strokeWidth="1.5" />
        </g>
      ))}
      {/* plants at pier top */}
      <circle cx="128" cy="68" r="7" fill="#3f9c46" />
      <circle cx="172" cy="68" r="7" fill="#4aac53" />
    </svg>
  );
}

/** Cầu Thê Húc – red wooden arch bridge (Hà Nội). */
export function RedBridge({ className, style }: P) {
  return (
    <svg viewBox="0 0 260 150" className={className} style={style}>
      <ellipse cx="130" cy="142" rx="112" ry="7" fill="rgba(0,0,0,0.16)" />
      {/* stone supports */}
      <rect x="16" y="116" width="10" height="26" rx="3" fill="#9aa7b1" />
      <rect x="234" y="116" width="10" height="26" rx="3" fill="#9aa7b1" />
      {/* deck */}
      <path d="M8 126 Q130 30 252 126" stroke="#a5271d" strokeWidth="11" fill="none" />
      <path d="M8 126 Q130 30 252 126" stroke="#d94f3f" strokeWidth="5" fill="none" />
      <path d="M8 126 Q130 30 252 126" stroke="#f2c14e" strokeWidth="1.6" fill="none" strokeDasharray="8 10" />
      {/* railing posts + handrail */}
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const x = 8 + 244 * t;
        const y = 126 - 192 * t + 192 * t * t;
        return (
          <g key={i}>
            <rect x={x - 2} y={y - 12} width="4" height="18" rx="2" fill="#a5271d" />
            <rect x={x - 2.6} y={y - 14} width="5.2" height="5" rx="2.4" fill="#c0392b" />
          </g>
        );
      })}
      <path d="M8 114 Q130 18 252 114" stroke="#a5271d" strokeWidth="3" fill="none" />
      <path d="M8 114 Q130 18 252 114" stroke="#e05a45" strokeWidth="1.4" fill="none" />
      {/* lantern at the apex */}
      <g transform="translate(130 42)">
        <circle r="8" fill="#ffb84d" opacity="0.3" />
        <rect x="-3" y="-6" width="6" height="4" rx="1.5" fill="#b8322c" />
        <ellipse cy="1" rx="4.2" ry="5.6" fill="#f4842f" />
        <path d="M0 6.6 v5" stroke="#e0b552" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/* ---------------------------- ui bits ---------------------------- */

export function StarIcon({ className, style }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <path
        d="M12 2.6l2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45-4.7-4.6 6.5-.95z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Padlock({ className, style }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <path
        d="M7 10V7.5a5 5 0 0110 0V10"
        stroke="currentColor"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="4.5" y="9.5" width="15" height="12" rx="3.5" fill="currentColor" />
      <circle cx="12" cy="15" r="2" fill="#5b7a8c" />
    </svg>
  );
}

export function Crown({ className, style }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <path
        d="M3 18l-1-11 5.5 4L12 4l4.5 7L22 7l-1 11z"
        fill="currentColor"
      />
      <circle cx="12" cy="15" r="1.6" fill="#ffe08a" />
    </svg>
  );
}

export function Chest({ className, style }: P) {
  return (
    <svg viewBox="0 0 80 70" className={className} style={style}>
      <ellipse cx="40" cy="66" rx="30" ry="4" fill="rgba(0,0,0,0.18)" />
      <path d="M10 34 Q40 10 70 34 v28 H10 Z" fill="#a9713d" />
      <path d="M10 34 Q40 12 70 34 v8 H10 Z" fill="#c88f52" />
      <rect x="10" y="42" width="60" height="20" fill="#8a5a33" />
      <rect x="35" y="32" width="10" height="30" rx="3" fill="#f2c14e" />
      <circle cx="40" cy="48" r="4" fill="#7d4f27" />
      <path d="M12 42 h56" stroke="#6d4523" strokeWidth="2" />
      <circle cx="18" cy="24" r="3" fill="#ffe08a" />
      <circle cx="62" cy="24" r="3" fill="#ffe08a" />
    </svg>
  );
}

export function HeartIcon({ className, style }: P) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      <path
        d="M12 21s-8.4-4.9-8.4-11A4.6 4.6 0 0112 7.4 4.6 4.6 0 0120.4 10c0 6.1-8.4 11-8.4 11z"
        fill="currentColor"
      />
    </svg>
  );
}
