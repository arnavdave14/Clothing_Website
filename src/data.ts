export type ColorOption = {
  name: string
  hex: string
}

export type Product = {
  id: string
  index: string
  name: string
  price: number
  category: string
  image: string
  alt: string
  colors: ColorOption[]
}

export type CartItem = {
  key: string
  productId: string
  name: string
  price: number
  image: string
  color: string
  size: string
  qty: number
}

export type Look = {
  id: string
  image: string
  alt: string
  caption: string
  location: string
}

export const products: Product[] = [
  {
    id: 'atelier-coat',
    index: '01',
    name: 'Atelier Coat',
    price: 420,
    category: 'Outerwear',
    image: '/images/product-coat.webp',
    alt: 'Model in a bone-colored oversized wool coat with hands in pockets',
    colors: [
      { name: 'Bone', hex: '#d9d2c3' },
      { name: 'Charcoal', hex: '#2b2a27' },
    ],
  },
  {
    id: 'column-dress',
    index: '02',
    name: 'Column Dress',
    price: 260,
    category: 'Dresses',
    image: '/images/product-dress.webp',
    alt: 'Model in a floor-length ink-black column dress against a warm grey wall',
    colors: [
      { name: 'Ink', hex: '#232220' },
      { name: 'Oat', hex: '#cdbfa6' },
    ],
  },
  {
    id: 'pleat-trouser',
    index: '03',
    name: 'Pleat Trouser',
    price: 210,
    category: 'Tailoring',
    image: '/images/product-trouser.webp',
    alt: 'Pleated ash-grey wool trousers worn mid-stride with leather loafers',
    colors: [
      { name: 'Ash', hex: '#8a8378' },
      { name: 'Ink', hex: '#232220' },
    ],
  },
  {
    id: 'field-shirt',
    index: '04',
    name: 'Field Shirt',
    price: 180,
    category: 'Shirting',
    image: '/images/product-shirt.webp',
    alt: 'Model in an oversized burnt-clay linen field shirt tucked into ivory trousers',
    colors: [
      { name: 'Clay', hex: '#a74e32' },
      { name: 'Bone', hex: '#d9d2c3' },
    ],
  },
]

export const featured = {
  id: 'atelier-coat',
  name: 'The Atelier Coat',
  price: 420,
  image: '/images/featured.webp',
  alt: 'Back view of a model in a charcoal double-faced wool coat inside a Lisbon atelier',
  colors: [
    { name: 'Charcoal', hex: '#2b2a27' },
    { name: 'Bone', hex: '#d9d2c3' },
    { name: 'Clay', hex: '#a74e32' },
  ],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  details: [
    'Double-faced Italian wool, hand-finished seams',
    'Dropped shoulder, wrap closure, deep welt pockets',
    'Unlined and reversible in spirit — falls softly either way',
    'Cut and sewn in our Lisbon atelier, in a run of 60',
  ],
  accordions: [
    {
      title: 'Materials',
      body: '80% deadstock wool, 20% recycled cashmere from a mill outside Biella. Brushed by hand for a soft, dry surface that holds its shape with wear.',
    },
    {
      title: 'Fit & care',
      body: 'Oversized through the body with an adjustable waist tie. Dry clean sparingly; air between wears, brush with a soft clothes brush, and we will repair it for free, always.',
    },
    {
      title: 'Delivery',
      body: 'Made to order in 5–7 working days. Complimentary carbon-neutral shipping within the EU, and returns are open for 30 days.',
    },
  ],
}

export const looks: Look[] = [
  {
    id: 'stillness',
    image: '/images/look-1.webp',
    alt: 'Two models in charcoal and bone tailoring inside a sunlit gallery',
    caption: 'Stillness, in motion',
    location: 'Gallery — Lisbon',
  },
  {
    id: 'air',
    image: '/images/look-2.webp',
    alt: 'Ivory silk dress caught mid-movement with soft motion blur',
    caption: 'Weight of air',
    location: 'Studio — 35mm',
  },
  {
    id: 'craft',
    image: '/images/look-3.webp',
    alt: 'Close-up of hands adjusting a charcoal wool coat cuff',
    caption: 'The finished hand',
    location: 'Atelier — Detail',
  },
]

export const navLinks = [
  { label: 'Collection', href: '#collection', meta: 'Six pieces, one season', image: '/images/look-1.webp' },
  { label: 'Film', href: '#film', meta: 'A study in motion', image: '/images/look-2.webp' },
  { label: 'Lookbook', href: '#lookbook', meta: 'AW26 — shot in Lisbon', image: '/images/look-3.webp' },
  { label: 'Atelier', href: '#atelier', meta: 'Fewer pieces, better made', image: '/images/featured.webp' },
  { label: 'Contact', href: '#footer', meta: 'Write to the studio', image: '/images/look-1.webp' },
]

export const tickerItems = [
  'New season — Studio 01',
  'Cut in Lisbon',
  'Deadstock wool',
  'Small batch',
  'Free repairs, always',
  'Made to be kept',
]
