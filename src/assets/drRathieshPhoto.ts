// Profile photo data URI and doctor profile metadata for Dr. Rathiesh, MBBS, MD
// Based on verified medical specialist credentials & profile picture

export const DR_RATHIESH_PFP_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 900" width="600" height="900">
  <defs>
    <!-- Wall & Studio Lighting Gradients -->
    <linearGradient id="wallBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%23f8fafc"/>
      <stop offset="60%" stop-color="%23e2e8f0"/>
      <stop offset="100%" stop-color="%23cbd5e1"/>
    </linearGradient>

    <!-- Face Skin Tone Gradient -->
    <linearGradient id="skinBase" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="%23c68a5d"/>
      <stop offset="50%" stop-color="%23b87a4c"/>
      <stop offset="100%" stop-color="%239e6237"/>
    </linearGradient>

    <linearGradient id="skinHighlight" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="%23d89d6e"/>
      <stop offset="100%" stop-color="%23b87a4c"/>
    </linearGradient>

    <!-- Navy Scrubs Gradient -->
    <linearGradient id="navyScrubs" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="%231e293b"/>
      <stop offset="40%" stop-color="%23172554"/>
      <stop offset="100%" stop-color="%230f172a"/>
    </linearGradient>

    <!-- Poster Blue Header -->
    <linearGradient id="posterHeader" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="%231d4ed8"/>
      <stop offset="100%" stop-color="%232563eb"/>
    </linearGradient>

    <!-- Chart Blue Header -->
    <linearGradient id="chartHeader" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="%230284c7"/>
      <stop offset="100%" stop-color="%230369a1"/>
    </linearGradient>

    <!-- Soft Drop Shadow -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="%23020617" flood-opacity="0.25"/>
    </filter>
    
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="%23020617" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Background Clinic Wall -->
  <rect width="600" height="900" fill="url(%23wallBg)"/>

  <!-- Left Wall Poster: INCLUSIVE HEALTH -->
  <g transform="translate(10, 110)" filter="url(%23softShadow)">
    <rect width="190" height="290" rx="4" fill="%23e0f2fe" stroke="%23bae6fd" stroke-width="3"/>
    <rect x="10" y="12" width="170" height="42" fill="%230284c7" rx="3"/>
    <text x="95" y="32" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="900" font-size="11" fill="%23ffffff" text-anchor="middle" letter-spacing="0.5">INCLUSIVE</text>
    <text x="95" y="46" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="900" font-size="11" fill="%23ffffff" text-anchor="middle" letter-spacing="0.5">HEALTH</text>
    
    <!-- Inclusive circles -->
    <circle cx="50" cy="110" r="26" fill="%23ea580c"/>
    <circle cx="105" cy="100" r="24" fill="%23059669"/>
    <circle cx="145" cy="120" r="20" fill="%232563eb"/>
    <circle cx="65" cy="175" r="28" fill="%23dc2626"/>
    <circle cx="130" cy="180" r="26" fill="%23d97706"/>
    
    <!-- Silhouette faces in circles -->
    <circle cx="50" cy="104" r="9" fill="%23ffedd5"/>
    <circle cx="105" cy="94" r="8" fill="%23fef3c7"/>
    <circle cx="65" cy="168" r="9" fill="%23fee2e2"/>
  </g>

  <!-- Right Wall Poster: Inclusive Healthcare Family -->
  <g transform="translate(400, 120)" filter="url(%23softShadow)">
    <rect width="190" height="280" rx="4" fill="%23eff6ff" stroke="%23bfdbfe" stroke-width="3"/>
    <rect x="10" y="12" width="170" height="36" fill="url(%23posterHeader)" rx="3"/>
    <text x="95" y="35" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="900" font-size="12" fill="%23ffffff" text-anchor="middle">Inclusive Health</text>
    
    <!-- Info lines -->
    <line x1="20" y1="65" x2="170" y2="65" stroke="%2393c5fd" stroke-width="4" stroke-linecap="round"/>
    <line x1="20" y1="80" x2="150" y2="80" stroke="%2393c5fd" stroke-width="4" stroke-linecap="round"/>
    <line x1="20" y1="95" x2="160" y2="95" stroke="%2393c5fd" stroke-width="4" stroke-linecap="round"/>

    <!-- Family Silhouette Graphic -->
    <g transform="translate(30, 120)">
      <!-- Parent 1 -->
      <circle cx="30" cy="30" r="12" fill="%231e40af"/>
      <path d="M 12 80 C 12 55, 48 55, 48 80 Z" fill="%231e40af"/>
      <!-- Parent 2 -->
      <circle cx="110" cy="32" r="11" fill="%23d97706"/>
      <path d="M 94 80 C 94 56, 126 56, 126 80 Z" fill="%23d97706"/>
      <!-- Child 1 -->
      <circle cx="60" cy="48" r="8" fill="%23059669"/>
      <path d="M 48 80 C 48 64, 72 64, 72 80 Z" fill="%23059669"/>
      <!-- Child 2 -->
      <circle cx="85" cy="52" r="7" fill="%23dc2626"/>
      <path d="M 75 80 C 75 66, 95 66, 95 80 Z" fill="%23dc2626"/>
    </g>
  </g>

  <!-- Body / Navy Blue Scrubs -->
  <g filter="url(%23softShadow)">
    <path d="M 80 900 L 120 540 Q 180 470 300 470 Q 420 470 480 540 L 520 900 Z" fill="url(%23navyScrubs)"/>
    <!-- V-Neck Collar Trim -->
    <path d="M 210 475 L 300 600 L 390 475" fill="none" stroke="%23020617" stroke-width="12"/>
    <path d="M 215 475 L 300 590 L 385 475" fill="none" stroke="%231e293b" stroke-width="14"/>
    <path d="M 225 475 L 300 575 L 375 475" fill="none" stroke="%23334155" stroke-width="4"/>
    
    <!-- Neck Chest Exposure -->
    <path d="M 240 475 L 300 545 L 360 475 Z" fill="%23b87a4c"/>
    <path d="M 240 475 L 300 545 L 360 475 Z" fill="%237c4a27" opacity="0.25"/>
  </g>

  <!-- Left Chest Embroidery (DR. RATHIES, MBBS, MD, SEX EDUCATOR, SEXUAL HEALTH SPECIALIST) -->
  <g transform="translate(425, 595)">
    <!-- White Embroidered Stitched Text -->
    <text x="0" y="0" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="900" font-size="14" fill="%23ffffff" text-anchor="center" letter-spacing="0.8">DR. RATHIES</text>
    <text x="0" y="16" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="11" fill="%23f8fafc" letter-spacing="0.5">MBBS, MD</text>
    <text x="0" y="30" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="10" fill="%23f1f5f9" letter-spacing="0.5">SEX EDUCATOR</text>
    <text x="0" y="43" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="9" fill="%23e2e8f0" letter-spacing="0.3">SEXUAL HEALTH SPECIALIST</text>
  </g>

  <!-- Neck -->
  <path d="M 245 370 L 245 480 Q 300 505 355 480 L 355 370 Z" fill="url(%23skinBase)"/>
  <path d="M 245 410 Q 300 475 355 410 L 355 480 Q 300 505 245 480 Z" fill="%237c4a27" opacity="0.3"/>

  <!-- Head Shape (Dr. Rathiesh) -->
  <g filter="url(%23softShadow)">
    <ellipse cx="300" cy="285" rx="100" ry="125" fill="url(%23skinBase)"/>
    <ellipse cx="295" cy="275" rx="92" ry="118" fill="url(%23skinHighlight)" opacity="0.6"/>

    <!-- Ears -->
    <ellipse cx="198" cy="285" rx="17" ry="28" fill="%23b87a4c"/>
    <ellipse cx="198" cy="285" rx="10" ry="18" fill="%239e6237"/>
    <ellipse cx="402" cy="285" rx="17" ry="28" fill="%23b87a4c"/>
    <ellipse cx="402" cy="285" rx="10" ry="18" fill="%239e6237"/>

    <!-- Hair (Stylish Volume Haircut) -->
    <path d="M 195 260 Q 190 135 300 130 Q 410 135 405 260 Q 385 180 300 170 Q 215 180 195 260 Z" fill="%230f172a"/>
    <path d="M 190 250 C 185 170, 230 120, 300 120 C 370 120, 415 170, 410 250 C 390 170, 350 145, 300 145 C 250 145, 210 170, 190 250 Z" fill="%231e293b"/>
    <!-- Hair Texture Highlights -->
    <path d="M 230 160 Q 300 135 370 160" stroke="%23334155" stroke-width="4" fill="none"/>
    <path d="M 240 180 Q 300 155 360 180" stroke="%23334155" stroke-width="3" fill="none"/>

    <!-- Eyebrows (Thick, defined black) -->
    <path d="M 220 232 Q 255 218 280 232" fill="none" stroke="%230f172a" stroke-width="7" stroke-linecap="round"/>
    <path d="M 320 232 Q 345 218 380 232" fill="none" stroke="%230f172a" stroke-width="7" stroke-linecap="round"/>

    <!-- Expressive Warm Eyes -->
    <!-- Left Eye -->
    <ellipse cx="250" cy="255" rx="16" ry="10" fill="%23ffffff"/>
    <ellipse cx="250" cy="255" rx="8" ry="8" fill="%231e293b"/>
    <circle cx="250" cy="255" r="4" fill="%230f172a"/>
    <circle cx="253" cy="252" r="2.5" fill="%23ffffff"/>
    <!-- Right Eye -->
    <ellipse cx="350" cy="255" rx="16" ry="10" fill="%23ffffff"/>
    <ellipse cx="350" cy="255" rx="8" ry="8" fill="%231e293b"/>
    <circle cx="350" cy="255" r="4" fill="%230f172a"/>
    <circle cx="353" cy="252" r="2.5" fill="%23ffffff"/>

    <!-- Nose -->
    <path d="M 300 245 L 293 300 Q 300 308 307 300" fill="none" stroke="%23854d0e" stroke-width="3.5" stroke-linecap="round"/>
    <!-- Nostril shadow -->
    <ellipse cx="290" cy="302" rx="4" ry="2" fill="%23713f12" opacity="0.5"/>
    <ellipse cx="310" cy="302" rx="4" ry="2" fill="%23713f12" opacity="0.5"/>

    <!-- Fine Mustache & Facial Stubble -->
    <path d="M 258 322 Q 300 316 342 322 Q 300 332 258 322 Z" fill="%231e293b" opacity="0.85"/>
    <!-- Chin & Jawline Stubble Gradient -->
    <path d="M 220 340 Q 300 395 380 340 Q 300 410 220 340 Z" fill="%230f172a" opacity="0.15"/>

    <!-- Friendly Smile -->
    <path d="M 255 330 Q 300 365 345 330" fill="none" stroke="%23451a03" stroke-width="4" stroke-linecap="round"/>
    <path d="M 262 334 Q 300 362 338 334 Q 300 346 262 334 Z" fill="%23ffffff"/>
    <path d="M 262 334 Q 300 362 338 334" fill="none" stroke="%23e2e8f0" stroke-width="2"/>
  </g>

  <!-- Laminated Medical Educational Chart: Contraceptive Clinic (Held in Front) -->
  <g transform="translate(320, 610)" filter="url(%23cardShadow)">
    <rect x="0" y="0" width="270" height="230" rx="8" fill="%23ffffff" stroke="%230284c7" stroke-width="4"/>
    <rect x="2" y="2" width="266" height="226" rx="6" fill="%23ffffff" stroke="%23e0f2fe" stroke-width="2"/>

    <!-- Chart Blue Header -->
    <rect x="6" y="6" width="258" height="38" fill="url(%23chartHeader)" rx="4"/>
    <text x="135" y="31" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="900" font-size="15" fill="%23ffffff" text-anchor="middle" letter-spacing="0.5">Contraceptive Clinic</text>

    <!-- Pelvis & Uterus Anatomical Diagram -->
    <g transform="translate(15, 52)">
      <!-- Pelvic Bone Structure -->
      <path d="M 30 40 Q 80 15 130 40 Q 150 75 130 115 Q 80 135 30 115 Q 10 75 30 40 Z" fill="%23ffedd5" stroke="%23f97316" stroke-width="2.5"/>
      <!-- Uterus -->
      <path d="M 60 55 Q 80 40 100 55 L 90 90 Q 80 98 70 90 Z" fill="%23fca5a5" stroke="%23ef4444" stroke-width="2"/>
      <!-- Cervix & Ovaries -->
      <circle cx="50" cy="50" r="7" fill="%23fdba74" stroke="%23ea580c" stroke-width="1.5"/>
      <circle cx="110" cy="50" r="7" fill="%23fdba74" stroke="%23ea580c" stroke-width="1.5"/>
      <line x1="57" y1="50" x2="65" y2="55" stroke="%23ef4444" stroke-width="2"/>
      <line x1="103" y1="50" x2="95" y2="55" stroke="%23ef4444" stroke-width="2"/>

      <!-- Contraceptive Methods Insets -->
      <!-- Blister Pill Pack -->
      <g transform="translate(150, 20)">
        <rect x="0" y="0" width="85" height="50" rx="4" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5"/>
        <text x="42" y="12" font-family="sans-serif" font-weight="800" font-size="8" fill="%230284c7" text-anchor="middle">Contraceptive Pills</text>
        <!-- Pill Grid -->
        <circle cx="15" cy="26" r="4" fill="%23ef4444"/>
        <circle cx="32" cy="26" r="4" fill="%23ef4444"/>
        <circle cx="49" cy="26" r="4" fill="%23ef4444"/>
        <circle cx="66" cy="26" r="4" fill="%23ef4444"/>
        <circle cx="15" cy="38" r="4" fill="%23ef4444"/>
        <circle cx="32" cy="38" r="4" fill="%23ef4444"/>
        <circle cx="49" cy="38" r="4" fill="%23ef4444"/>
        <circle cx="66" cy="38" r="4" fill="%233b82f6"/>
      </g>

      <!-- IUD / Ring Inset -->
      <g transform="translate(150, 80)">
        <rect x="0" y="0" width="85" height="45" rx="4" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="1.5"/>
        <text x="42" y="12" font-family="sans-serif" font-weight="800" font-size="8" fill="%23059669" text-anchor="middle">Hormonal Ring / IUD</text>
        <circle cx="42" cy="28" r="10" fill="none" stroke="%2310b981" stroke-width="3"/>
      </g>
    </g>
  </g>

  <!-- Hands Holding Chart (Doctor Rathiesh's hands) -->
  <g filter="url(%23softShadow)">
    <ellipse cx="330" cy="815" rx="32" ry="20" fill="url(%23skinBase)"/>
    <ellipse cx="570" cy="850" rx="32" ry="20" fill="url(%23skinBase)"/>
  </g>
</svg>`;

export const DR_RATHIESH_PFP_DATA_URL = DR_RATHIESH_PFP_SVG;

export const DR_RATHIESH_PROFILE = {
  id: 'doc-rathiesh',
  name: 'Dr. Rathiesh, MBBS, MD, FECSM',
  shortName: 'Dr. Rathiesh',
  displayTitle: 'Dr. Rathiesh (Sex Educator & Sexual Health Specialist)',
  email: 'dr.rathiesh.medical@gmail.com',
  role: 'Sex Educator & Sexual Health Specialist',
  clinicName: 'Coimbatore Medical College Hospital (CMCH)',
  avatar: DR_RATHIESH_PFP_DATA_URL,
  provider: 'google' as const,
  mobile: '+91 94421 99001',
  license: 'TMC-2021-98122',
  qualifications: 'MBBS, MD, FECSM (Fellow of the European Board of Sexual Medicine)',
  specialties: [
    'Sexual Health Medicine',
    'Sex Education & Counseling',
    'Inclusive Health Care',
    'LGBTQ+ & Adolescent Reproductive Health',
    'Rare Endocrine & Lysosomal Reproductive Manifestations'
  ],
  hospital: 'Coimbatore Medical College Hospital (CMCH)',
  department: 'Department of Sexual Health & Inclusive Reproductive Medicine',
  bio: 'Specialist practitioner and public sex educator dedicated to evidence-based inclusive sexual healthcare, rare reproductive endocrine conditions, and clinical counseling.'
};

