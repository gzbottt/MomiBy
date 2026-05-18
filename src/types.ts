export type Page = 
  | 'home' 
  | 'growth' 
  | 'recipes' 
  | 'doctors' 
  | 'schedule' 
  | 'articles' 
  | 'food-ai' 
  | 'chat-ai' 
  | 'emergency' 
  | 'pharmacy'
  | 'marketplace'
  | 'settings';

export interface BabyProfile {
  name: string;
  birthDate: string;
  photo?: string;
  gender: 'male' | 'female';
}

export interface GrowthEntry {
  date: string;
  weight: number; // kg
  height: number; // cm
  headCirc: number; // cm
  whoWeight: number; // WHO average weight
}

export interface MPASIRecipe {
  id: string;
  title: string;
  ageRange: string;
  ingredients: string[];
  steps: string[];
  photo: string;
  isDoctorRecommended: boolean;
  category: 'Bubur' | 'Sering' | 'Finger Food' | 'Snack';
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  isOnline: boolean;
  photo: string;
  schedule: string[];
}

export interface FeedingEvent {
  id: string;
  time: string;
  type: 'ASI' | 'Formula' | 'MPASI' | 'Camilan';
  amount?: string;
  calories?: number;
}

export interface Booking {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface Article {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  readTime: string;
  content: string;
}

export interface PharmacyItem {
  id: string;
  name: string;
  price: number;
  description: string;
  photo: string;
  category: 'Obat' | 'Vaksin' | 'Alat Kesehatan';
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  vitamins?: string[];
}
