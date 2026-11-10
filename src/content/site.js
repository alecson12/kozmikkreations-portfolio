// ─────────────────────────────────────────────────────────────────────────────
//  THE WORDS  ·  every piece of text on the site that is not a project lives here.
//  (Projects are in projects.js, next to this file.)
// ─────────────────────────────────────────────────────────────────────────────

export const SITE = {
  brand: 'Kozmik Kreations',
  tabTitle: 'Kozmik Kreations — Graphic Design Portfolio',

  // The names of the four pages, as shown in the navigation.
  nav: { home: 'Home', about: 'Behind Kozmik', universe: 'My Kreations', contact: 'Kontact Me' },

  home: {
    headline: 'Kreativity beyond the ordinary.',
    text: 'Welcome to my creative universe. This is where ideas take shape, creativity has no limits, and every kreation tells a story. Come explore the mind, craft, and work behind Kozmik.',
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
      document: 'Kreator Identification',
      experience: { label: 'Experience', value: '4', unit: 'yrs' },
      specs: [
        { label: 'Species', value: 'Human' },
        { label: 'Origin', value: 'Earth' },
        { label: 'Based in', value: 'Bulacan, Philippines' },
        { label: 'Classification', value: 'The Kreator' },
        { label: 'Alias', value: '‘Jr Tsubaki’' },
        { label: 'Occupations', value: 'Designer, Developer, Artist' },
        { label: 'Affiliation', value: 'Kozmik Kreations' },
      ],
      number: { label: 'Galactic ID No', value: 'KK-121200' },
      signature: { label: 'Signature', image: 'Alecson Signature' },
      issued: { label: 'Issued', value: 'June 25, 2026' },
      status: { label: 'Status' }, // shows the commissions label from the contact block below
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
    markTitle: 'Logo breakdown',
    // The logo icon versions shown one after another (files in AboutMe/LogoIcon), in this order.
    markStages: [
      { image: 'KozmikIcon_Sketch', label: 'Sketch' },
      { image: 'KozmikIcon_Illustrator', label: 'Illustrator' },
      { image: 'KozmikIcon_Halftone', label: 'Halftone' },
      { image: 'KozmikIcon_Crimson', label: 'Crimson' },
      { image: 'KozmikIcon_Bigbang', label: 'Big Bang' },
      { image: 'KozmikIcon_ArtChrome', label: 'Art Chrome' },
    ],
    markSeconds: 3.5, // how long each version stays
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
        // these words in the text become a link that opens the photo
        link: { phrase: 'Kosmaj Monument', photo: 'Kosmaj photo', caption: 'The Kosmaj Monument' },
        text: 'Inspired by the Kosmaj Monument, reflecting my belief that freedom lies at the heart of art and self-expression.',
      },
    ],
  },

  contact: {
    headline: 'Let’s Kreate something out of this world.',
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
