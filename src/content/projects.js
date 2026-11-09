// ─────────────────────────────────────────────────────────────────────────────
//  THE PROJECTS  ·  this is the one file to edit when work is added or changed.
//
//  HOW TO ADD A PROJECT
//    1. Put its images / videos in a folder inside  Projects/
//    2. Copy one of the blocks below and fill it in:
//         folder  – path of that folder inside Projects/
//         slides  – the files, in the exact order they should be shown
//                   (leave `slides` out to use every file in name order)
//         layout  – 'carousel'  one slide at a time, swipe / arrows (carousel posts)
//                   'gallery'   every piece on one page (poster sets, single prints)
//    3. Run  npm run media   (makes the web-sized copies in public/media)
//
//  Nothing here is cropped or redrawn: the site only shows the files listed.
//  This file must stay plain data (no imports) because the media script reads it.
// ─────────────────────────────────────────────────────────────────────────────

// The planetary systems, left to right in the universe. A project joins a system
// through its `system` field. The labels are the names of the folders in Projects/.
export const SYSTEMS = [
  { id: 'logos', label: 'Logo Projects' },
  { id: 'shirts', label: 'Shirt Designs' },
  { id: 'invitation', label: 'Invitation' },
  { id: 'prints', label: 'Prints' },
  { id: 'pubmats', label: 'Pubmats' },
]

// planet.type: 'chrome' | 'gas' | 'rock' | 'terra' | 'lava' | 'ice'
// planet.colors: three colours taken from the project's own artwork
// planet.size: 1 is average · planet.ring / planet.moons are optional
export const PROJECTS = [
  // ── Logo Projects ─────────────────────────────────────────────────────────
  {
    id: 'dna-collectives',
    title: 'DNA Collectives',
    kind: 'Logo Project',
    system: 'logos',
    folder: 'Logo Projects/DNA Collectives',
    layout: 'carousel',
    slides: [
      'DNA_Page1.png',
      'DNA_Page2.png',
      'DNA_Page3.png',
      'DNA_Page4.png',
      'DNA_Page5.png',
      'DNA_Page6.png',
      'DNA_Page7.png',
    ],
    planet: {
      type: 'ice',
      size: 0.95,
      colors: ['#111114', '#8f9096', '#f2f2f4'],
      atmosphere: '#d94848',
    },
  },
  {
    id: 'mk-dwin',
    title: 'MK Dwin',
    kind: 'Logo Project',
    system: 'logos',
    folder: 'Logo Projects/Mk Dwin',
    layout: 'carousel',
    slides: [
      'MKDWIN_Page1.png',
      'MKDWIN_Page2.png',
      'MKDWIN_Page3.png',
      'MKDWIN_Page4.png',
      'MKDWIN_Page5.png',
      'MKDWIN_Page6.png',
      'MKDWIN_Page7.png',
    ],
    planet: {
      type: 'gas',
      size: 1.15,
      colors: ['#0c2a3f', '#2f6184', '#e3a236'],
      atmosphere: '#6fb0e0',
      moons: 2,
    },
  },
  {
    id: 'the-rocketeerz',
    title: 'The Rocketeerz',
    kind: 'Logo Project',
    system: 'logos',
    folder: 'Logo Projects/Rocketeerz',
    layout: 'carousel',
    slides: [
      'RocketeerzLogoShowcase_1.png',
      'RocketeerzLogoShowcase_2.png',
      'RocketeerzLogoShowcase_3.png',
      'RocketeerzLogoShowcase_4.png',
      'RocketeerzDPSticker.png',
      'RocketeerzLaptopSticker.png',
      'RocketeerzSweatshirt.png',
      'RocketeerzSocks.png',
    ],
    planet: {
      type: 'rock',
      size: 0.85,
      colors: ['#2a0c0b', '#9c2f2a', '#e2b9a8'],
      atmosphere: '#ff7a66',
    },
  },

  // ── Shirt Designs ─────────────────────────────────────────────────────────
  {
    id: 'the-clan-crew-shirt',
    title: 'The Clan Crew Shirt',
    kind: 'Crew Shirt',
    system: 'shirts',
    folder: 'Shirt Designs/The Clan (Crew Shirt)',
    layout: 'carousel',
    slides: [
      'TheClanShirt_Showcase_01.png',
      'TheClanShirt_Showcase_02.png',
      'TheClanShirt_Showcase_03.png',
      'TheClanShirt_Showcase_04.png',
      'TheClanShirt_Showcase_05.png',
    ],
    planet: {
      type: 'gas',
      size: 1.05,
      colors: ['#2a0906', '#8c1a12', '#dcae4a'],
      atmosphere: '#f0c25c',
      moons: 1,
    },
  },
  {
    id: 'dna-x-the-clan-jersey',
    title: 'DNA Collectives × The Clan',
    kind: 'Jersey Shirt',
    system: 'shirts',
    folder: 'Shirt Designs/DNA Collectives X The Clan',
    layout: 'carousel',
    slides: [
      'DNAxTheClan_JerseyShirt-(Carousel)_01.png',
      'DNAxTheClan_JerseyShirt-(Carousel)_02.png',
      'DNAxTheClan_JerseyShirt-(Carousel)_03.png',
      'DNAxTheClan_JerseyShirt-(Carousel)_04.png',
    ],
    planet: {
      type: 'rock',
      size: 0.9,
      colors: ['#0d0a16', '#3a2763', '#9a86d6'],
      atmosphere: '#8f72ff',
    },
  },

  // ── Invitation ────────────────────────────────────────────────────────────
  {
    id: 'beni-den-wedding',
    title: 'Beni + Den Wedding',
    kind: 'Wedding Invitation',
    system: 'invitation',
    folder: 'Invitation/BENI + DEN WEDDING',
    layout: 'carousel',
    slides: [
      'Beni&DenIGShowcase1.png',
      'BeniDen_IGShowcase.mp4',
      'Beni&DenIGShowcase2.png',
      'OffWedPicsIG1.png',
      'OffWedPicsIG2.png',
    ],
    planet: {
      type: 'gas',
      size: 1.1,
      colors: ['#6b4136', '#c79a86', '#f3e2d6'],
      atmosphere: '#ffd9c7',
      ring: { inner: 1.4, outer: 2.05, color: '#f1dccb', tilt: 0.26, roll: 0.24 },
    },
  },

  // ── Prints ────────────────────────────────────────────────────────────────
  {
    id: 'aa-garage-sticker',
    title: 'AA Garage Sticker',
    kind: 'Sticker',
    system: 'prints',
    folder: 'Prints/AA Sticker',
    layout: 'gallery',
    slides: ['AAGarage_Sticker (NoStroke).png', 'AAGarage_MockUpSticker.png', 'Sticks.jpg'],
    planet: {
      type: 'gas',
      size: 0.8,
      colors: ['#2b0d0b', '#96211c', '#d2b02c'],
      atmosphere: '#f3d266',
    },
  },
  {
    id: 'birthday-standee',
    title: 'Birthday Standee',
    kind: 'Standee',
    system: 'prints',
    folder: 'Prints/Birthday Standee',
    layout: 'gallery',
    slides: ['Khalil_Spiderboy.png'],
    planet: {
      type: 'terra',
      size: 0.9,
      colors: ['#0f2f78', '#2e6fd0', '#b5352c'],
      atmosphere: '#7fb4ff',
      moons: 1,
    },
  },
  {
    id: 'bootleg-standee',
    title: 'Bootleg Standee',
    kind: 'Standee',
    system: 'prints',
    folder: 'Prints/Bootleg Standee',
    layout: 'gallery',
    slides: ['JobertBootleg-Final.png', 'joba[[.jpg'],
    planet: {
      type: 'lava',
      size: 0.75,
      colors: ['#0b080a', '#3a1018', '#ff4a5e'],
      atmosphere: '#ff6a7a',
    },
  },
  {
    id: 'chucky-mirror-sticker',
    title: 'Chucky-Inspired Mirror Sticker',
    kind: 'Mirror Sticker',
    system: 'prints',
    folder: 'Prints/Chucky Mirror Stickers',
    layout: 'carousel',
    slides: [
      'ChuckyMirror_pg1.png',
      'ChuckyMirror_pg2.png',
      'ChuckyMirror_pg3.png',
      'ChuckyMirror_pg4.mp4',
      'ChuckyMirror_pg5.png',
    ],
    planet: {
      type: 'rock',
      size: 1.05,
      colors: ['#3d2f0c', '#b8962a', '#ecd65a'],
      atmosphere: '#5f8fe6',
    },
  },

  // ── Pubmats ───────────────────────────────────────────────────────────────
  {
    id: 'balagbagan-sa-bulacan',
    title: 'Balagbagan sa Bulacan',
    kind: 'Event Pubmats',
    system: 'pubmats',
    folder: 'Pubmats/BalagbaganSaBulacan',
    layout: 'carousel',
    slides: ['blgbgnsablcn_Showcase1.png', 'pg2Showcase.mp4', 'blgbgnsablcn_Showcase3.png'],
    planet: {
      type: 'rock',
      size: 1.0,
      colors: ['#0e0e10', '#4a4a50', '#b9b4ac'],
      atmosphere: '#d0202c',
    },
  },
  {
    id: 'ran-celestial',
    title: 'Ran Celestial',
    kind: 'Game Pubmats',
    system: 'pubmats',
    folder: 'Pubmats/RanOnlinePosters/Ran Celestial',
    layout: 'gallery',
    slides: [
      'RanCelestial_ServerDetailsFinal.png',
      'RanCelestial_BTTW.png',
      'RanCelestial_Discord.png',
      'RanCelestial_WelcomeFD.png',
      'RanCelestial_WelcomeH20.png',
    ],
    planet: {
      type: 'gas',
      size: 1.2,
      colors: ['#1f1440', '#6a4bb8', '#d8c9ff'],
      atmosphere: '#b79cff',
      ring: { inner: 1.5, outer: 2.3, color: '#cbb8ff', tilt: 0.3, roll: -0.18 },
    },
  },
  {
    id: 'ran-online-havoc',
    title: 'Ran Online PH: Havoc Server',
    kind: 'Game Pubmats',
    system: 'pubmats',
    folder: 'Pubmats/RanOnlinePosters/RanOnlinePH (Havoc Server)',
    layout: 'gallery',
    slides: [
      'HavocServer.png',
      'Havoc_OngoingBT.png',
      'Havoc_OffUpTom.png',
      'Havoc_OfficiallyUp.png',
      'Havoc_RaceTo+9.png',
      'Havoc_DryRun.png',
      'Havoc_TW.png',
    ],
    planet: {
      type: 'lava',
      size: 1.1,
      colors: ['#1c0902', '#6e2606', '#ff8f24'],
      atmosphere: '#ff9a3c',
      moons: 1,
    },
  },
  {
    id: 'ran-online-ep4',
    title: 'Ran Online PH: Episode 4',
    kind: 'Game Pubmats',
    system: 'pubmats',
    folder: 'Pubmats/RanOnlinePosters/RanOnlinePH Ep4',
    layout: 'gallery',
    slides: [
      'EP4_Countdown2days.png',
      'EP4_BetaTestOngoing.png',
      'ROPH4_BetaRewards.png',
      'EP4_MiniTW.png',
      'RanPHEp3_BetaPoster.png',
      'RanPHEp3_CoverPhoto.png',
    ],
    planet: {
      type: 'rock',
      size: 0.85,
      colors: ['#1e120a', '#7a4a26', '#d7a05a'],
      atmosphere: '#e8b070',
    },
  },
  {
    id: 'ran-ph-level-up',
    title: 'Ran PH: Level Up',
    kind: 'Game Pubmats',
    system: 'pubmats',
    folder: 'Pubmats/RanOnlinePosters/RanPH Level Up',
    layout: 'gallery',
    slides: [
      'AnoServer.png',
      'ROPLU_BetaRewards.png',
      'ROPLU_WelcomeXnar.png',
      'RanCelestial_TopUpPromo.png',
      'ROPLU_LF.png',
    ],
    planet: {
      type: 'gas',
      size: 0.95,
      colors: ['#2e170d', '#b4582a', '#f0c8a0'],
      atmosphere: '#ffb27a',
    },
  },
]
