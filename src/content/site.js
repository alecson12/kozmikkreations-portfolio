// ─────────────────────────────────────────────────────────────────────────────
//  THE WORDS  ·  every piece of text on the site that is not a project lives here.
//  (Projects are in projects.js, next to this file.)
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  brand: 'Kozmik Kreations',
  tabTitle: 'Kozmik Kreations — Graphic Design Portfolio',

  home: {
    headline: 'Creativity beyond the ordinary.',
    text: 'Exploring ideas, crafting visuals, and bringing creative visions to life.',
    cta: 'Explore Projects',
  },

  // Taken word for word from the “Behind Kozmik”, “Logo Breakdown” and “Services”
  // slides of the Shaping Kozmik Kreations project. Nothing here is invented.
  about: {
    eyebrow: 'Behind Kozmik',
    name: 'Alecson Gantica',
    // The "galactic ID" card, as on the Behind Kozmik slide. Pictures are files in AboutMe/.
    portrait: 'goinKozmik_Blue',
    id: {
      experience: { label: 'Experience', value: '4', unit: 'yrs' },
      specs: [
        { label: 'Species', value: 'Human' },
        { label: 'Origin', value: 'Earth' },
        { label: 'Classification', value: 'The Kreator' },
        { label: 'Alias', value: '‘Crimzon’ & ‘Jr Tsubaki’' },
        { label: 'Occupations', value: 'Designer, Developer, Artist' },
      ],
      number: { label: 'Galactic ID No', value: 'KK-121200' },
      valid: { label: 'Valid until', value: '∞' },
    },
    bioTitle: 'About the Kreator',
    bio: [
      'The mind behind Kozmik Kreations, Alecson Gantica, is deeply passionate about the act of creating. As both a dance artist and game developer, he blends creativity and logic to craft unique designs inspired by purpose, self-expression, and the cosmos.',
      'Through Kozmik Kreations, he aims to create visual identities that not only stand out, but genuinely connect and leave a lasting impression.',
    ],
    servicesTitle: 'Services',
    services: [
      'Logo & Brand Identity',
      'Social Media Graphics',
      'Posters & Marketing Materials',
      'Print Design',
      'Custom Graphics & Merchandise',
      'Photo Retouching & Enhancement',
    ],
    softwareTitle: 'Softwares',
    software: [
      { name: 'Photoshop', icon: 'PS Icon' },
      { name: 'Illustrator', icon: 'AI Icon' },
      { name: 'Canva', icon: 'Canva Icon' },
    ],
    contactsTitle: 'Contacts',
    markTitle: 'Logo breakdown',
    markVideo: 'ShapingKozmik_pg1', // the final logo animation
    mark: [
      {
        title: 'The Kozmik',
        image: 'The Kozmik',
        text: 'The explosive outward form represents cosmic energy. Creativity expanding like a Big Bang from a single point.',
      },
      {
        title: 'The Kreation',
        image: 'The Kreation',
        text: 'The center collision marks the moment ideas are born. Where imagination and energy become something new.',
      },
      {
        title: 'The Kharacter',
        image: 'The Kharacters',
        text: 'Two mirrored letter K represent Kozmik Kreations. Symbolizing balance, and the bond between creator and creation.',
      },
      {
        title: 'The Kosmaj',
        image: 'The Kosmaj',
        photo: 'Kosmaj photo',
        text: 'Inspired by the Kosmaj Monument, reflecting my belief that freedom lies at the heart of art and self-expression.',
      },
    ],
  },

  contact: {
    headline: 'Let’s create something out of this world.',
    // Set open to false to show the closed label instead.
    commissions: { open: true, openLabel: 'Open for commissions', closedLabel: 'Commissions closed' },
    email: 'kozmikkreations.design@gmail.com',
    cta: 'Start a project',
    emailSubject: 'Project inquiry — Kozmik Kreations',
    links: [
      { label: 'Behance', href: 'https://www.behance.net/KozmikKreations' },
      { label: 'Facebook', href: 'https://www.facebook.com/KozmikKreations' },
    ],
  },

  // Small link at the bottom of the Contact page, back to the main landing site.
  mainSite: { label: 'Alecson Gantica', href: 'https://alecson12.github.io/' },
}
