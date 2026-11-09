/*
 * 事务所的内容：项目、奖项、合伙人、办公室。全部虚构（业主、街道地址都是编的）；城市与经纬度是真实地名的近似值。
 * 改成你自己的作品时只改这里和 drawings.ts 里对应编号的平面、剖面。
 */

export const TYPOLOGIES = [
  { id: 'civic', label: 'Civic' },
  { id: 'housing', label: 'Housing' },
  { id: 'education', label: 'Education' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'interior', label: 'Interior' },
] as const

export type Typology = (typeof TYPOLOGIES)[number]['id']

export interface Project {
  id: '064' | '061' | '058' | '055' | '052' | '049' | '046' | '043' | '040' | '037' | '034' | '031'
  name: string
  place: string
  coords: [number, number]
  year: number
  span: string
  typology: Typology
  status: string
  onSite?: boolean
  area: string
  client: string
  programme: string
  team: string
  planLabel: string
  summary: string
  text: [string, string]
}

export const PROJECTS: Project[] = [
  {
    id: '064',
    name: 'Vliet Library and Archive',
    place: 'Leiden, NL',
    coords: [52.1601, 4.497],
    year: 2025,
    span: '2021–2025',
    typology: 'civic',
    status: 'On site',
    onSite: true,
    area: '4,820 m²',
    client: 'Stichting Vlietbibliotheek',
    programme: 'Public library, city archive, reading court',
    team: 'Ilse Arden, Bram Hoekstra, Noor El Idrissi',
    planLabel: 'Ground floor',
    summary: 'A public library and city archive around a planted reading court, with the archive stacks on the quiet north and east sides.',
    text: [
      'The library sits on the old rope-walk site along the Vliet. Reading rooms face a court of four lime trees; the archive, which needs no daylight, wraps the north and east edges and shields the court from the ring road.',
      'The structure is a 5.6 m timber grid on a concrete plinth. Brick piers carry the facade, so the archive wing can be taken down later without touching the reading rooms.',
    ],
  },
  {
    id: '061',
    name: 'Kade Zuid Housing',
    place: 'Rotterdam, NL',
    coords: [51.9046, 4.4879],
    year: 2024,
    span: '2019–2024',
    typology: 'housing',
    status: 'Completed',
    area: '9,300 m²',
    client: 'Havenstad Wonen',
    programme: '84 social rent homes, bike hall, roof garden',
    team: 'Tomás Vos, Lieke de Graaf',
    planLabel: 'Typical floor',
    summary: 'Eighty-four social rent homes along a quay, reached from open galleries that double as front porches.',
    text: [
      'Every home is dual-aspect: gallery on the quay side, a deep loggia on the garden side. The gallery widens to 2.4 m in front of each door, enough for a bench and a pot of herbs.',
      'The slab is a repeated 7.2 m bay of prefabricated concrete walls, clad in hand-laid brick that changes bond at every floor.',
    ],
  },
  {
    id: '058',
    name: 'Escola do Bonfim',
    place: 'Porto, PT',
    coords: [41.1486, -8.5972],
    year: 2024,
    span: '2020–2024',
    typology: 'education',
    status: 'Completed',
    area: '3,150 m²',
    client: 'Fundação Escolas do Bonfim',
    programme: 'Primary school for 350 pupils, sports hall, kitchen garden',
    team: 'Mirela Kostić, Rui Antunes',
    planLabel: 'Ground floor',
    summary: 'A primary school of three classroom wings, each with its own garden court, strung along one top-lit corridor.',
    text: [
      'Each pair of classrooms opens onto a court the children plant themselves. The corridor is wide enough to work in and takes its light from a run of rooflights.',
      'Walls are rendered blockwork with a 1.2 m band of glazed tile that takes the knocks. The sports hall is shared with the neighbourhood after 18:00.',
    ],
  },
  {
    id: '055',
    name: 'Riverside Bathhouse',
    place: 'Ghent, BE',
    coords: [51.0543, 3.7174],
    year: 2023,
    span: '2019–2023',
    typology: 'civic',
    status: 'Completed',
    area: '2,640 m²',
    client: 'Stadsbaden Leie vzw',
    programme: '25 m pool, learner pool, sauna, river terrace',
    team: 'Ilse Arden, Jonas Peeters',
    planLabel: 'Ground floor',
    summary: 'A public bathhouse under five brick vaults, with a terrace that steps down to the river.',
    text: [
      'Each vault spans 9.6 m and keeps the steam high, away from the swimmers. The pool hall opens fully to the terrace in summer; in winter warm air is drawn back through the vault crowns.',
      'Backwash water is filtered on site and used for the planting along the river edge.',
    ],
  },
  {
    id: '052',
    name: 'Hofje van Noord',
    place: 'Haarlem, NL',
    coords: [52.3874, 4.6462],
    year: 2023,
    span: '2020–2023',
    typology: 'housing',
    status: 'Completed',
    area: '1,780 m²',
    client: 'Stichting Noorderhof',
    programme: '22 homes for older residents, shared garden, common room',
    team: 'Tomás Vos, Femke Mulder',
    planLabel: 'Ground floor',
    summary: 'Twenty-two small homes for older residents around a shared garden, entered through a single gate.',
    text: [
      'The hofje is an old Haarlem type: almshouses facing a walled garden. Ours keeps the gate, the garden and the low eaves, and adds a common room beside the gate where a porter once lived.',
      'Every front door is set back under a timber porch deep enough for two chairs.',
    ],
  },
  {
    id: '049',
    name: 'Quinta das Águas',
    place: 'Sintra, PT',
    coords: [38.8029, -9.3817],
    year: 2022,
    span: '2018–2022',
    typology: 'landscape',
    status: 'Completed',
    area: '2.4 ha',
    client: 'Private',
    programme: 'Terraced garden, water rill, pergola, tool house',
    team: 'Joost van Rijn, Ana Carvalho',
    planLabel: 'Garden plan',
    summary: 'Restoring a terraced estate garden around a 40 m stone rill fed by the original spring.',
    text: [
      'We rebuilt five dry-stone terraces and reopened the rill that carries spring water from the upper basin to the orchard. The planting is mostly what we found: cork oak, citrus and myrtle.',
      'The only new building is a tool house with a pergola, built from chestnut felled on the estate.',
    ],
  },
  {
    id: '046',
    name: 'Tidal Park Pavilion',
    place: 'Vlissingen, NL',
    coords: [51.4427, 3.5731],
    year: 2021,
    span: '2019–2021',
    typology: 'landscape',
    status: 'Completed',
    area: '1.1 ha',
    client: 'Waterschap Scheldekust',
    programme: 'Salt-marsh walk, dike shelter, bird hide',
    team: 'Joost van Rijn, Sem Bakker',
    planLabel: 'Site plan',
    summary: 'A salt-marsh walk and shelter on the outer dike, built to go under water twice a day.',
    text: [
      'The boardwalk follows the mean high-water line and dips under at spring tides; the shelter stands on piles above storm level. Visitors read the tide from marks cut into the piles.',
      'All timber is untreated oak, left to turn silver.',
    ],
  },
  {
    id: '043',
    name: 'Printworks Offices',
    place: 'Antwerp, BE',
    coords: [51.2194, 4.4025],
    year: 2021,
    span: '2020–2021',
    typology: 'interior',
    status: 'Completed',
    area: '1,240 m²',
    client: 'Verhulst Notarissen',
    programme: 'Offices for 90 people in a 1928 printworks',
    team: 'Mirela Kostić, Pieter Claes',
    planLabel: 'Floor plan',
    summary: 'Offices for ninety people inside a 1928 printworks, with meeting rooms built as freestanding timber boxes.',
    text: [
      'We kept the sawtooth roof, the concrete columns and the ink stains on the floor. New rooms are timber boxes that stop short of the columns, so the old hall still reads as one space.',
      'Desks, shelving and the long table were made by one joiner from 14 m³ of ash.',
    ],
  },
  {
    id: '040',
    name: 'Music School Kralingen',
    place: 'Rotterdam, NL',
    coords: [51.9262, 4.5093],
    year: 2020,
    span: '2016–2020',
    typology: 'education',
    status: 'Completed',
    area: '2,960 m²',
    client: 'Stichting Muziek Oost',
    programme: '240-seat hall, 12 practice rooms, band room',
    team: 'Ilse Arden, Bram Hoekstra',
    planLabel: 'Ground floor',
    summary: 'A neighbourhood music school with a 240-seat hall at its centre and practice rooms on either side.',
    text: [
      'Practice rooms are boxes on rubber bearings inside a heavy brick shell. The hall has no fly tower; its curved timber ceiling does the acoustic work.',
      'The foyer runs the length of the street, so passers-by hear rehearsals through the open doors in summer.',
    ],
  },
  {
    id: '037',
    name: 'Lindenhof Townhouses',
    place: 'Utrecht, NL',
    coords: [52.0907, 5.1214],
    year: 2019,
    span: '2016–2019',
    typology: 'housing',
    status: 'Completed',
    area: '1,340 m²',
    client: 'Bouwgroep Lindenhof',
    programme: 'Eight townhouses for a self-build group',
    team: 'Tomás Vos, Lieke de Graaf',
    planLabel: 'Ground floor',
    summary: 'Eight townhouses for a residents’ group, each 5.4 m wide, sharing one garden wall and a row of limes.',
    text: [
      'The group bought the plot together and agreed on one structure and one brick; everything behind the front door was theirs to decide. Two families moved the stair, one built a workshop.',
      'The shared rear wall has niches for benches and bike sheds.',
    ],
  },
  {
    id: '034',
    name: 'Fire Station Oost',
    place: 'Delft, NL',
    coords: [52.0116, 4.3571],
    year: 2018,
    span: '2015–2018',
    typology: 'civic',
    status: 'Completed',
    area: '2,180 m²',
    client: 'Regional Fire Service',
    programme: 'Four vehicle bays, crew quarters, training tower',
    team: 'Ilse Arden, Jonas Peeters',
    planLabel: 'Ground floor',
    summary: 'Four vehicle bays, crew quarters and a 22 m training tower on a tight corner plot.',
    text: [
      'Engines leave in under sixty seconds, so the plan was drawn backwards from the bay doors: lockers, then the pole, then the rest rooms above. The tower doubles as a hose-drying shaft.',
      'The bays are spanned by 24 m glulam beams and clad in glazed red brick.',
    ],
  },
  {
    id: '031',
    name: 'Atelier for a Ceramicist',
    place: 'Évora, PT',
    coords: [38.5714, -7.9087],
    year: 2017,
    span: '2015–2017',
    typology: 'interior',
    status: 'Completed',
    area: '210 m²',
    client: 'Private',
    programme: 'Studio, kiln room, small house',
    team: 'Mirela Kostić, Ana Carvalho',
    planLabel: 'Ground floor',
    summary: 'A studio and kiln room for a ceramicist, built of rammed earth around a shaded patio.',
    text: [
      'The walls are 50 cm of rammed earth dug on site, which keeps the studio cool in August and the heat in the kiln room. The patio is the only window most rooms have.',
      'A single fig tree, already there, set the position of everything else.',
    ],
  },
]

export const AWARDS = [
  { year: 2025, award: 'Dutch Library Prize', project: 'Vliet Library and Archive', result: 'Shortlist' },
  { year: 2024, award: 'Rotterdam Housing Award', project: 'Kade Zuid Housing', result: 'Winner' },
  { year: 2024, award: 'Iberian School Building Prize', project: 'Escola do Bonfim', result: 'Honourable mention' },
  { year: 2023, award: 'Flanders Public Building Award', project: 'Riverside Bathhouse', result: 'Winner' },
  { year: 2022, award: 'Garden Restoration Medal', project: 'Quinta das Águas', result: 'Winner' },
  { year: 2019, award: 'Lowlands Young Practice Prize', project: 'The practice', result: 'Winner' },
]

export const PARTNERS = [
  { name: 'Ilse Arden', role: 'Founding partner, Rotterdam' },
  { name: 'Tomás Vos', role: 'Founding partner, Porto' },
  { name: 'Mirela Kostić', role: 'Partner, interiors' },
  { name: 'Joost van Rijn', role: 'Partner, landscape' },
]

export const OFFICES = [
  {
    city: 'Rotterdam',
    note: 'Studio and model workshop',
    address: ['Touwslagerskade 14', '3071 TK Rotterdam', 'Netherlands'],
    people: 24,
    coords: [51.9031, 4.4886] as [number, number],
    mailbox: 'rotterdam',
  },
  {
    city: 'Porto',
    note: 'Studio and competition team',
    address: ['Travessa dos Riscadores 41', '4000-417 Porto', 'Portugal'],
    people: 14,
    coords: [41.1432, -8.6131] as [number, number],
    mailbox: 'porto',
  },
]

/** 52.1601° N, 4.4970° E */
export function formatCoords([lat, lon]: [number, number]): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lon).toFixed(4)}° ${ew}`
}

export function typologyLabel(id: Typology): string {
  return TYPOLOGIES.find((t) => t.id === id)?.label ?? id
}
