import { MPASIRecipe, Doctor, Article, PharmacyItem } from './types';

export const MOCK_RECIPES: MPASIRecipe[] = [
  {
    id: '1',
    title: 'Bubur Ayam Wortel Brokoli',
    ageRange: '6-9 Bulan',
    ingredients: ['50g Beras', '30g Dada Ayam', '20g Wortel', '10g Brokoli'],
    steps: ['Masak beras dengan air hingga lunak', 'Masukkan ayam dan sayuran', 'Masak hingga matang dan saring'],
    photo: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=400',
    isDoctorRecommended: true,
    category: 'Bubur'
  },
  {
    id: '2',
    title: 'Finger Food Labu Kuning',
    ageRange: '9-12 Bulan',
    ingredients: ['100g Labu Kuning', 'Sedikit minyak zaitun'],
    steps: ['Potong memanjang labu', 'Panggang atau kukus hingga empuk', 'Sajikan hangat'],
    photo: 'https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&q=80&w=400',
    isDoctorRecommended: true,
    category: 'Finger Food'
  }
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Anita Permata, Sp.A',
    specialty: 'Spesialis Anak',
    hospital: 'RSIA Kasih Bunda',
    isOnline: true,
    photo: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&q=80&w=400',
    schedule: ['Senin - Jumat: 08:00 - 12:00']
  },
  {
    id: '2',
    name: 'Dr. Budi Santoso, Sp.A',
    specialty: 'Tumbuh Kembang Anak',
    hospital: 'RSUP Sejahtera',
    isOnline: false,
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    schedule: ['Selasa - Sabtu: 13:00 - 17:00']
  }
];

export const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Cara Mengatasi Ruam Popok pada Bayi',
    category: 'Kesehatan Dasar',
    thumbnail: 'https://images.unsplash.com/photo-1544126592-807daf21565c?auto=format&fit=crop&q=80&w=400',
    readTime: '3 Menit',
    content: 'Ruam popok adalah masalah umum...'
  },
  {
    id: '2',
    title: 'Stimulasi Bayi 3 Bulan untuk Motorik Kasar',
    category: 'Tumbuh Kembang',
    thumbnail: 'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&q=80&w=400',
    readTime: '5 Menit',
    content: 'Pada usia 3 bulan, bayi mulai...'
  }
];

export const MOCK_PHARMACY: PharmacyItem[] = [
  {
    id: '1',
    name: 'Paracetamol Drops',
    price: 35000,
    description: 'Pereda demam dan nyeri untuk anak.',
    photo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
    category: 'Obat'
  },
  {
    id: '2',
    name: 'Vaksin PCV (Pneumokokal)',
    price: 850000,
    description: 'Mencegah infeksi bakteri pneumococcus.',
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400',
    category: 'Vaksin'
  }
];

export const MOCK_MARKETPLACE = {
  products: [
    { id: 'p1', name: 'Stroller Premium', price: 2500000, image: 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?auto=format&fit=crop&q=80&w=300', description: 'Stroller lipat otomatis, ringan dan kuat.' },
    { id: 'p2', name: 'Baby Carrier Ergo', price: 850000, image: 'https://images.unsplash.com/photo-1602052577122-f73b9710adba?auto=format&fit=crop&q=80&w=300', description: 'Gendongan ergonomis untuk kenyamanan punggung Momi.' }
  ],
  food: [
    { id: 'f1', name: 'Bubur Salmon Bayi', price: 35000, image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?auto=format&fit=crop&q=80&w=300', description: 'Salmon segar dengan sayuran organik.' },
    { id: 'f2', name: 'Puree Buah Campur', price: 25000, image: 'https://images.unsplash.com/photo-1528667853886-6c7886423982?auto=format&fit=crop&q=80&w=300', description: 'Manis alami tanpa tambahan gula.' }
  ],
  used: [
    { id: 'u1', name: 'Bouncer Preloved', price: 300000, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&q=80&w=300', description: 'Kondisi 95% masih berfungsi sangat baik.' }
  ]
};
