export default function OrangeRibbon() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 1920 1080"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="orangeRibbon" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFB75E" />
          <stop offset="30%" stopColor="#FFA046" />
          <stop offset="70%" stopColor="#FF8420" />
          <stop offset="100%" stopColor="#FF7000" />
        </linearGradient>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="15"
            stdDeviation="20"
            floodColor="#ff7a00"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      {/* Main Ribbon */}
      <path
        filter="url(#shadow)"
        fill="url(#orangeRibbon)"
        d="
        M1700 -120

        C1880 90
        1510 280
        1605 500

        C1700 700
        1510 880
        1290 1080

        L1920 1080
        L1920 -120
        Z
        "
      />

      {/* White Highlight */}
      <path
        fill="white"
        opacity=".08"
        d="
        M1660 -120

        C1815 90
        1540 290
        1590 500

        C1650 690
        1505 860
        1335 1080

        L1375 1080

        C1535 860
        1685 690
        1625 500

        C1565 290
        1825 90
        1695 -120

        Z
        "
      />
    </svg>
  );
}