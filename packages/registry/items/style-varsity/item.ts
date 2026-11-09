import { defineItem } from '@motif/schema'

const option = (value: string, zh: string, en: string) => ({ value, label: { 'zh-CN': zh, en } })

export default defineItem({
  schemaVersion: 1,
  slug: 'style-varsity',
  status: 'published',
  title: { 'zh-CN': '校园运动', en: 'Varsity' },
  summary: {
    'zh-CN': '校队运动衫的图形语言：带双层描边的粗体块字像毛巾绣臂章，球衣号码、三角锦旗和盾形队徽，缝线虚线边，两种队色铺在奶油色底上。适合运动社团、周边商品、校园活动和年轻品牌。',
    en: 'The graphic vocabulary of a college team: block letters with a double outline like chenille patches, jersey numbers, pennants and shield crests, stitched dashed borders and two team colours on cream. For sports clubs, merch, campus events and youth brands.',
  },
  kind: 'style',
  category: 'playful',
  tags: ['varsity', 'collegiate', 'athletic', 'sports', 'chenille', 'jersey', 'pennant', 'letterman', 'campus', 'merch', 'design system'],
  runtime: ['react', 'css', 'svg'],
  entry: { file: 'style-varsity.tsx', export: 'Varsity' },
  demo: { file: 'demo.tsx', export: 'Demo', theme: 'light' },
  files: [
    { path: 'style-varsity.tsx', role: 'component' },
    { path: 'demo.tsx', role: 'demo' },
  ],
  params: [
    {
      key: 'primary',
      type: 'color',
      group: 'colours',
      label: { 'zh-CN': '主队色', en: 'Home colour' },
      hint: { 'zh-CN': '块字、主按钮和主场球衣；上面的文字按明暗自动选深浅', en: 'Block letters, primary buttons and the home jersey; text on it picks light or dark ink' },
      default: '#a3192e',
    },
    {
      key: 'secondary',
      type: 'color',
      group: 'colours',
      label: { 'zh-CN': '副队色', en: 'Trim colour' },
      hint: { 'zh-CN': '外描边、袖口条纹、锦旗的旗杆布和缝线', en: 'Outer outlines, sleeve stripes, pennant hoists and stitching' },
      default: '#f2b33d',
    },
    {
      key: 'ground',
      type: 'select',
      group: 'colours',
      label: { 'zh-CN': '底色', en: 'Ground' },
      default: 'cream',
      options: [option('cream', '奶油', 'Cream'), option('heather', '麻灰卫衣', 'Heather grey'), option('chalk', '粉笔白', 'Chalk'), option('night', '夜场', 'Night game')],
    },
    {
      key: 'outlineStyle',
      type: 'select',
      group: 'lettering',
      label: { 'zh-CN': '描边', en: 'Outline' },
      hint: { 'zh-CN': '块字、号码、臂章和按钮一起换', en: 'Applies to block letters, numbers, patches and buttons together' },
      default: 'chenille',
      options: [option('chenille', '毛巾绣双描边', 'Chenille double'), option('tackle', '贴布单描边', 'Tackle twill single'), option('drop', '错位投影', 'Drop shadow')],
    },
    {
      key: 'displayFont',
      type: 'select',
      group: 'lettering',
      label: { 'zh-CN': '标题字体', en: 'Display face' },
      default: 'block',
      options: [
        option('block', '方块黑体 Archivo Black', 'Block, Archivo Black'),
        option('serif', '学院衬线 Fraunces', 'Collegiate serif, Fraunces'),
        option('heritage', '老牌校徽 Playfair', 'Heritage, Playfair Display'),
        option('wide', '宽体运动 Syne', 'Athletic wide, Syne'),
      ],
    },
    {
      key: 'stitching',
      type: 'select',
      group: 'detail',
      label: { 'zh-CN': '缝线', en: 'Stitching' },
      hint: { 'zh-CN': '卡片、按钮、徽章和锦旗边上的虚线缝线', en: 'The dashed seam inside cards, buttons, badges and pennants' },
      default: 'running',
      options: [option('running', '单道缝线', 'Running stitch'), option('double', '双道缝线', 'Double row'), option('off', '不缝线', 'None')],
    },
    { key: 'radius', type: 'number', group: 'detail', label: { 'zh-CN': '圆角', en: 'Corner radius' }, hint: { 'zh-CN': '控件用它的 70%', en: 'Controls use 70% of it' }, default: 10, min: 0, max: 22, step: 1, unit: 'px', safe: [4, 16] },
  ],
  presets: [
    {
      id: 'homecoming',
      name: { 'zh-CN': '返校日', en: 'Homecoming' },
      values: { primary: '#a3192e', secondary: '#f2b33d', ground: 'cream', outlineStyle: 'chenille', displayFont: 'block', stitching: 'running', radius: 10 },
    },
    {
      id: 'old-quad',
      name: { 'zh-CN': '老方庭', en: 'Old quad' },
      values: { primary: '#1d4a39', secondary: '#c99a3c', ground: 'chalk', outlineStyle: 'tackle', displayFont: 'heritage', stitching: 'double', radius: 4 },
    },
    {
      id: 'night-game',
      name: { 'zh-CN': '周五夜场', en: 'Night game' },
      values: { primary: '#2350c8', secondary: '#ff7a1a', ground: 'night', outlineStyle: 'drop', displayFont: 'wide', stitching: 'running', radius: 14 },
    },
    {
      id: 'pep-rally',
      name: { 'zh-CN': '啦啦队', en: 'Pep rally' },
      values: { primary: '#5b2b8c', secondary: '#ffcf3a', ground: 'heather', outlineStyle: 'chenille', displayFont: 'serif', stitching: 'running', radius: 18 },
    },
  ],
  dependencies: ['@motif/runtime'],
  fonts: ['Archivo Black', 'Fraunces Variable', 'Playfair Display Variable', 'Syne Variable', 'Outfit Variable'],
  guidance: {
    use: [
      'Use for school and college athletics, sports clubs and leagues, team merch and kit shops, campus events (homecoming, orientation, alumni weekends), summer camps and youth brands that want team spirit and a hand-made, stitched warmth.',
      'Avoid for enterprise software, finance, healthcare or anything that must feel neutral; the lettering and two loud team colours dominate every screen.',
    ],
    rules: [
      'Palette is exactly two team colours plus neutrals: the home colour (letter fill, primary buttons, home jersey), the trim colour (outer outlines, sleeve stripes, pennant hoists, stitching on home-colour surfaces), a felt cream (#fbf5e6) for the inner outline ring, and one ground (cream, heather grey, chalk or a navy night). Ratio: about 60% ground and felt surfaces, 25% home colour, 10% trim, 5% ink. Never add a third hue; status colours reuse the two team colours.',
      'Lettering is the signature. Display type is set in caps in a heavy face (Archivo Black, Fraunces or Playfair at 900, Syne at 800) with tight tracking (0 to 0.01em for the sans faces, 0.02 to 0.03em for the serifs so outlined letters never touch) and line height near 0.95. Large letters always carry an outline built from stacked copies of the text with -webkit-text-stroke: chenille is fill, a felt ring of 0.05em, then a trim ring of 0.055em; tackle twill is fill plus one trim ring of 0.07em; drop shadow is fill, a thin felt ring and a trim-coloured copy offset 0.08em down and right. A felt-coloured letter drops the felt ring and shows fill then trim. Only the top copy is readable to assistive tech; the others are aria-hidden. Wide faces are scaled down to match the width of the others, but never below about 1.5rem.',
      'Body copy is Outfit at 400 to 500, 16 to 18px, sentence case. Labels, buttons, badges and table headers are Outfit 800 in caps with 0.12 to 0.16em tracking. Numbers (scores, dates, prices, jersey numbers) use the display face or tabular figures.',
      'Text on a team colour picks dark ink or felt cream by contrast. Team colours used as text on the ground are darkened (or lightened on night) until they reach 3.4:1; outlines fall back to ink when neither the fill nor the trim separates from the ground, and to felt or ink when the two team colours are too close to tell apart (two navies, maroon and red). Never set small text in the trim colour on a light ground.',
      'Surfaces are felt panels: one corner radius, a 2px ink border at 14% and a dashed running stitch inset 7px (a second row 5px further in for double stitching). On home-colour panels the stitch is the trim colour. In drop-shadow mode cards and buttons get a hard 4 to 6px offset shadow in the trim colour; otherwise shadows are a 2px ledge, never blurred. A home-colour panel that sits too close to the ground gets an ink keyline.',
      'Graphic devices: sleeve stripes (home, felt, trim, felt, home) as dividers and tab rails; pennants with a trim hoist and two ties; shield crests with a monogram; round or rounded-square letter patches; a skewed felt banner under the main word; jersey illustrations with the name arched over the number. Use one or two devices per section.',
      'Components: buttons are felt patches in caps with an inset stitch, ringed felt then trim (chenille), a trim ring (tackle) or a hard offset (drop). Inputs are sunken felt wells with a 2px border that turns home colour on focus with a soft trim halo. Choice chips and sizes are square patches; the selected one fills with the home colour. Switches have a felt knob that slides onto a home-colour track.',
      'Motion is brisk and physical: 140ms presses that lift 1px on hover and sink on press, switches and tabs that snap. No floating, parallax or fades on scroll. Respect prefers-reduced-motion by dropping transitions and ambient tickers.',
      'Forbidden: gradients other than hard-stop stripes, glass and blur, soft drop shadows, thin 1px hairlines as structure, more than two team colours, real team names, mascots or league marks; invent the school, crest and mascot.',
    ],
  },
  perf: { webgl: false, maxDpr: 2 },
  a11y: { reducedMotion: 'static' },
  capture: { scroll: true, posterTime: 0.5, loop: 8 },
  provenance: {
    kind: 'original',
    modifications: [
      'Original Motif design. The stacked text-stroke outlines, felt stitching, jersey, pennant and crest drawings are written from scratch with CSS and inline SVG; no upstream code is included.',
    ],
    assets: [],
  },
})
