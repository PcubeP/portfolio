/**
 * PER-SECTION THEMES
 * ------------------
 * Each theme is a map of CSS custom properties. Applied to a section root via
 * inline style, it locally overrides the global design tokens (ink, surface,
 * fg, line, accent...) so every world can have a completely different skin
 * while reusing the same components. Descendant `bg-ink` / `text-accent` etc.
 * automatically resolve to the nearest themed ancestor.
 *
 * Colours are "r g b" triples to stay compatible with rgb(var(--x)/alpha).
 */
export type Theme = Record<string, string>

export const themes = {
  /** Swimming — deep pool water, turquoise, white lane markings. */
  pool: {
    '--ink': '4 30 52',
    '--surface': '7 45 74',
    '--raised': '11 60 92',
    '--line': '120 200 224',
    '--fg': '226 246 252',
    '--dim': '150 202 222',
    '--faint': '86 138 165',
    '--accent': '54 224 208',
    '--lane': '235 248 252',
  } satisfies Theme,

  /** Tennis — Roland-Garros clay, cream court lines, optic-yellow ball. */
  clay: {
    '--ink': '58 26 15',
    '--surface': '166 66 38',
    '--raised': '188 82 50',
    '--line': '245 238 224',
    '--fg': '252 242 232',
    '--dim': '238 206 186',
    '--faint': '196 138 110',
    '--accent': '245 240 228',
    '--ball': '208 255 60',
  } satisfies Theme,

  /** Football — FC Barcelona blaugrana + senyera gold. */
  barca: {
    '--ink': '8 16 40',
    '--surface': '0 66 130',
    '--raised': '0 82 150',
    '--line': '237 187 0',
    '--fg': '245 246 252',
    '--dim': '198 206 228',
    '--faint': '120 132 168',
    '--accent': '165 0 68',
    '--blau': '0 77 152',
    '--grana': '165 0 68',
    '--gold': '237 187 0',
  } satisfies Theme,

  /** Tech — terminal phosphor cyan on near-black. */
  terminal: {
    '--ink': '5 10 12',
    '--surface': '9 18 20',
    '--raised': '13 26 28',
    '--line': '40 70 72',
    '--fg': '218 244 240',
    '--dim': '120 180 172',
    '--faint': '70 110 106',
    '--accent': '56 232 208',
  } satisfies Theme,

  /** Journey — blueprint / schematic blues and amber. */
  blueprint: {
    '--ink': '6 14 26',
    '--surface': '10 22 40',
    '--raised': '14 30 52',
    '--line': '60 108 168',
    '--fg': '224 236 250',
    '--dim': '150 178 214',
    '--faint': '84 116 158',
    '--accent': '245 197 66',
  } satisfies Theme,

  /** Gaming — arcade CRT, deep violet-black with phosphor green. */
  arcade: {
    '--ink': '7 6 16',
    '--surface': '16 12 30',
    '--raised': '24 18 44',
    '--line': '70 54 110',
    '--fg': '232 238 245',
    '--dim': '168 158 210',
    '--faint': '104 92 150',
    '--accent': '150 240 90',
    '--magenta': '236 92 168',
  } satisfies Theme,

  /** Cinema — letterboxed near-black, warm projector amber. */
  cinema: {
    '--ink': '6 5 4',
    '--surface': '15 12 9',
    '--raised': '24 19 13',
    '--line': '70 58 44',
    '--fg': '236 228 214',
    '--dim': '176 160 138',
    '--faint': '108 96 78',
    '--accent': '240 182 104',
  } satisfies Theme,

  /** Music — loud half: aggressive garnet on black. */
  loud: {
    '--ink': '9 9 11',
    '--surface': '20 15 17',
    '--raised': '30 20 24',
    '--line': '84 42 48',
    '--fg': '242 236 236',
    '--dim': '184 146 150',
    '--faint': '116 76 82',
    '--accent': '214 44 58',
  } satisfies Theme,

  /** Music — calm half: warm lo-fi tape tones. */
  lofi: {
    '--ink': '30 25 21',
    '--surface': '45 37 31',
    '--raised': '58 48 40',
    '--line': '108 90 76',
    '--fg': '238 226 210',
    '--dim': '190 170 148',
    '--faint': '124 108 90',
    '--accent': '216 160 112',
  } satisfies Theme,

  /** Cyberpunk / Matrix — neon green phosphor on deep void black. */
  matrix: {
    '--ink': '0 4 2',
    '--surface': '2 12 6',
    '--raised': '4 22 11',
    '--line': '0 80 30',
    '--fg': '180 255 180',
    '--dim': '0 200 80',
    '--faint': '0 100 40',
    '--accent': '0 255 65',
    '--neon': '0 255 65',
  } satisfies Theme,

  /** Food — warm spice market: saffron, deep crimson, earthy ochre. */
  food: {
    '--ink': '18 8 4',
    '--surface': '36 14 6',
    '--raised': '55 22 9',
    '--line': '140 70 28',
    '--fg': '252 238 210',
    '--dim': '220 180 130',
    '--faint': '160 110 70',
    '--accent': '245 160 30',
    '--spice': '200 50 20',
  } satisfies Theme,

  /** Garage / Automobiles — carbon fibre black, electric cyan underlow, chrome. */
  garage: {
    '--ink': '4 6 8',
    '--surface': '8 12 16',
    '--raised': '14 20 26',
    '--line': '30 70 90',
    '--fg': '220 240 248',
    '--dim': '120 170 200',
    '--faint': '60 100 130',
    '--accent': '0 210 255',
    '--chrome': '200 220 230',
  } satisfies Theme,

  /** Street art — urban night, neon spray, vivid contrast. */
  street: {
    '--ink': '10 8 12',
    '--surface': '18 14 22',
    '--raised': '28 22 34',
    '--line': '80 60 100',
    '--fg': '250 240 255',
    '--dim': '200 170 220',
    '--faint': '130 100 150',
    '--accent': '255 60 200',
    '--spray': '80 255 120',
  } satisfies Theme,
}

/** Cast helper for spreading a theme into a style prop. */
export function themeStyle(theme: Theme): React.CSSProperties {
  return theme as React.CSSProperties
}
