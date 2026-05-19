/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, LineChart, Utensils, Stethoscope, Clock, BookOpen, 
  Camera, MessageCircle, AlertCircle, ShoppingBag, Settings,
  AlertTriangle, Phone, Activity, Heart, Menu, X, ChevronRight,
  Plus, Search, Filter, Star, Info,
  Store,
  ArrowLeft,
  Send,
  MoreVertical,
  MinusCircle,
  LucideIcon
} from 'lucide-react';
import { 
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { 
  Page, BabyProfile, GrowthEntry, MPASIRecipe, 
  Doctor, FeedingEvent, Article, PharmacyItem, NutritionInfo 
} from './types';
import { 
  MOCK_RECIPES, MOCK_DOCTORS, MOCK_ARTICLES, MOCK_PHARMACY, MOCK_MARKETPLACE 
} from './constants';
import { chatWithAI, generateArticle } from './lib/gemini';

// --- Sub-components ---

const FeatureCard = ({ 
  icon: Icon, title, description, onClick, color = 'bg-white' 
}: { 
  icon: LucideIcon, title: string, description: string, onClick: () => void, color?: string 
}) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "p-6 rounded-[2.5rem] text-left transition-all hover:shadow-xl flex flex-col gap-3 h-full border-none",
      color
    )}
  >
    <div className="p-4 bg-white rounded-2xl w-fit shadow-sm">
      <Icon className="size-6 shrink-0" />
    </div>
    <div>
      <h3 className="font-extrabold text-lg leading-tight text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{description}</p>
    </div>
  </motion.button>
);

const Navbar = ({ activePage, onPageChange }: { activePage: Page, onPageChange: (p: Page) => void }) => {
  const items: { p: Page, icon: LucideIcon, label: string, color: string }[] = [
    { p: 'home', icon: Home, label: 'Beranda', color: 'text-brand-red' },
    { p: 'chat-ai', icon: MessageCircle, label: 'Chat AI', color: 'text-brand-yellow' },
    { p: 'pharmacy', icon: ShoppingBag, label: 'Apotek', color: 'text-brand-green' },
    { p: 'marketplace', icon: Store, label: 'Pasar', color: 'text-brand-blue' },
    { p: 'settings', icon: Settings, label: 'Pengaturan', color: 'text-slate-400' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-3 pb-8 z-40 flex justify-between items-center safe-area-bottom shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      {items.map(({ p, icon: Icon, label, color }) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all",
            activePage === p ? color : "text-slate-300 hover:text-slate-400"
          )}
        >
          <div className={cn(
            "p-2 rounded-2xl transition-all",
            activePage === p ? "bg-slate-50 scale-110" : ""
          )}>
            <Icon className="size-6" />
          </div>
          <span className="text-[9px] font-black tracking-widest uppercase">{label}</span>
          {activePage === p && (
            <motion.div layoutId="nav-dot" className={cn("size-1 rounded-full mt-0.5", color.replace('text-', 'bg-'))} />
          )}
        </button>
      ))}
    </nav>
  );
};

const EmergencyBtn = ({ onClick }: { onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="fixed bottom-24 right-6 z-50 p-4 bg-red-500 text-white rounded-full shadow-2xl shadow-red-500/30 flex items-center justify-center border-4 border-white"
  >
    <AlertCircle className="size-8" />
  </motion.button>
);

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="pb-32 px-6 pt-6"
  >
    {children}
  </motion.div>
);

// --- Pages ---

const HomePage = ({ onNavigate, profile, summary, onNotify }: { onNavigate: (p: Page) => void, profile: BabyProfile, summary: any, onNotify?: (m: string) => void }) => (
  <div className="space-y-10">
    <div className="flex justify-center items-center py-2">
      <img src="/assets/logo.png" className="h-20 w-auto" alt="MomiBy Logo" />
    </div>

    <header className="flex justify-between items-start pt-4 bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50">
      <div className="flex items-center gap-4">
        {profile.photo ? (
          <img src={profile.photo} className="size-14 rounded-2xl object-cover border-2 border-brand-yellow shadow-lg shadow-brand-yellow/10" alt="Profile" />
        ) : (
          <div className="size-14 bg-pastel-yellow rounded-2xl flex items-center justify-center text-brand-yellow font-black text-xl shadow-inner">
            {profile.name[0]}
          </div>
        )}
        <div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest leading-none mb-1">Selamat Pagi,</p>
          <h1 className="text-2xl font-black text-slate-800 leading-tight">Momi {profile.name} 👋</h1>
        </div>
      </div>
      <button 
        onClick={() => onNotify?.("Membuka menu utama...")}
        className="p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50"
      >
        <Menu className="text-brand-blue size-6" />
      </button>
    </header>

    {/* Dashboard Summary */}
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-pastel-blue p-6 rounded-[2.5rem] space-y-3 shadow-sm border border-blue-100/50">
        <div className="flex items-center gap-2 text-brand-blue">
          <Clock className="size-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Jadwal Makan</span>
        </div>
        <p className="text-2xl font-black text-slate-800">{summary.nextFeeding}</p>
        <p className="text-[10px] text-brand-blue/60 font-bold uppercase">ASI - 120ml</p>
      </div>
      <div className="bg-pastel-yellow p-6 rounded-[2.5rem] space-y-3 shadow-sm border border-yellow-100/50">
        <div className="flex items-center gap-2 text-brand-yellow">
          <Activity className="size-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Berat Badan</span>
        </div>
        <p className="text-2xl font-black text-slate-800">{summary.lastWeight} <span className="text-xs">kg</span></p>
        <div className="flex items-center gap-1">
          <Plus className="size-3 text-brand-green" />
          <p className="text-[10px] text-brand-yellow/60 font-bold uppercase">0.5kg dari bln lalu</p>
        </div>
      </div>
    </div>

    <div className="relative overflow-hidden bg-gradient-to-br from-brand-blue to-brand-blue-light rounded-[3rem] p-10 text-white shadow-2xl shadow-brand-blue/20">
      <div className="relative z-10 space-y-4 max-w-[80%]">
        <h2 className="text-3xl font-black leading-tight tracking-tight">Tumbuh Bersama MomiBy.</h2>
        <p className="text-white/80 text-sm leading-relaxed font-black uppercase tracking-widest text-[10px]">For Momi and Papi to raise Baby</p>
        <p className="text-white/90 text-sm leading-relaxed font-medium">Pantau setiap momen berharga si kecil dengan bantuan teknologi cerdas kami.</p>
        <button 
          onClick={() => onNavigate('chat-ai')}
          className="bg-white text-brand-blue px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-brand-blue/20 transition-transform active:scale-95"
        >
          Mulai Chat AI
        </button>
      </div>
      <div className="absolute right-[-15%] bottom-[-15%] w-1/2 opacity-10">
        <Heart className="size-64 fill-current" />
      </div>
    </div>

    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h3 className="font-black text-xl text-slate-800 tracking-tight">Layanan Utama</h3>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard 
          icon={LineChart} 
          title="Tumbuh Kembang" 
          description="Grafik BB & TB" 
          onClick={() => onNavigate('growth')}
          color="bg-pastel-green"
        />
        <FeatureCard 
          icon={Utensils} 
          title="Resep MPASI" 
          description="Menu Dokter" 
          onClick={() => onNavigate('recipes')}
          color="bg-pastel-red"
        />
        <FeatureCard 
          icon={Stethoscope} 
          title="Konsultasi" 
          description="Dokter Anak" 
          onClick={() => onNavigate('doctors')}
          color="bg-pastel-purple"
        />
        <FeatureCard 
          icon={Clock} 
          title="Jadwal Makan" 
          description="Atur Nutrisi" 
          onClick={() => onNavigate('schedule')}
          color="bg-pastel-blue"
        />
        <FeatureCard 
          icon={Camera} 
          title="Kamera AI" 
          description="Cek Gizi Makanan" 
          onClick={() => onNavigate('food-ai')}
          color="bg-pastel-yellow"
        />
        <FeatureCard 
          icon={BookOpen} 
          title="Artikel" 
          description="Tips Parenting" 
          onClick={() => onNavigate('articles')}
          color="bg-pastel-green"
        />
      </div>
    </div>
  </div>
);

const FeedingPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [events, setEvents] = useState<FeedingEvent[]>([
    { id: '1', time: '08:00', type: 'ASI', amount: '120ml', calories: 80 },
    { id: '2', time: '12:30', type: 'MPASI', amount: '1 Mangkok', calories: 150 },
    { id: '3', time: '15:00', type: 'Formula', amount: '100ml', calories: 70 },
  ]);

  const totalCals = events.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const goalCals = 800;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-black text-slate-800">Nutrisi Harian</h1>

      <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
        <div className="flex justify-between items-start relative z-10">
          <div className="space-y-1">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Asupan Kalori</p>
            <h2 className="text-4xl font-black">{totalCals} <span className="text-sm font-medium text-slate-500">/ {goalCals} kkal</span></h2>
          </div>
          <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
             <Utensils className="size-6 text-brand-yellow" />
          </div>
        </div>
        <div className="space-y-2 relative z-10">
           <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(totalCals / goalCals) * 100}%` }}
                className="h-full bg-brand-green" 
              />
           </div>
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target tercapai {(totalCals/goalCals*100).toFixed(0)}% dari rekomendasi dokter</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
         <div className="p-4 bg-pastel-yellow border border-yellow-200/50 rounded-3xl text-center space-y-1">
            <p className="text-[9px] font-black text-brand-yellow uppercase tracking-widest">ASI</p>
            <p className="font-black text-slate-800">2x</p>
         </div>
         <div className="p-4 bg-pastel-green border border-green-200/50 rounded-3xl text-center space-y-1">
            <p className="text-[9px] font-black text-brand-green uppercase tracking-widest">MPASI</p>
            <p className="font-black text-slate-800">1x</p>
         </div>
         <div className="p-4 bg-pastel-blue border border-blue-200/50 rounded-3xl text-center space-y-1">
            <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Snack</p>
            <p className="font-black text-slate-800">0x</p>
         </div>
      </div>

      <div className="space-y-6 relative">
        <div className="absolute left-6 top-2 bottom-2 w-1 bg-slate-100 rounded-full" />
        {events.map((e) => (
          <div key={e.id} className="relative pl-14 pb-8 last:pb-0">
            <div className={cn(
              "absolute left-[18px] top-1.5 size-4 rounded-full border-2 border-white shadow-md ring-4 ring-offset-0 transition-transform hover:scale-125",
              e.type === 'ASI' ? "bg-emerald-400 ring-emerald-50" : 
              e.type === 'Formula' ? "bg-blue-400 ring-blue-50" : "bg-brand-yellow ring-yellow-50"
            )} />
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/30 flex justify-between items-center hover:shadow-2xl transition-all">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">{e.time}</span>
                <h4 className="font-black text-slate-800">{e.type}</h4>
                <p className="text-[10px] text-brand-blue font-black uppercase">{e.calories} kkal</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-slate-400 block uppercase tracking-tight">{e.amount}</span>
                <button className="text-slate-200 mt-2 hover:text-brand-red transition-colors">
                   <MinusCircle className="size-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button 
          onClick={() => onNotify?.("Sedang menyiapkan formulir catatan makan...")}
          className="ml-14 w-[calc(100%-3.5rem)] bg-pastel-blue p-5 rounded-[2.5rem] text-brand-blue font-black flex items-center justify-center gap-3 hover:bg-brand-blue hover:text-white transition-all shadow-lg shadow-brand-blue/10 border-none uppercase tracking-widest text-xs"
        >
          <Plus className="size-5" /> Catat Makan Baru
        </button>
      </div>
    </div>
  );
};

const DoctorsPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [selectedDr, setSelectedDr] = useState<Doctor | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  return (
    <div className="space-y-8">
      {!selectedDr ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Konsultasi</h1>
            <div className="p-3 bg-white rounded-2xl border border-slate-50 shadow-xl shadow-slate-200/40">
              <Search className="text-brand-blue size-6" />
            </div>
          </div>

          <div className="space-y-5">
            {MOCK_DOCTORS.map(dr => (
              <motion.div
                key={dr.id}
                whileHover={{ y: -5 }}
                onClick={() => setSelectedDr(dr)}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-5 cursor-pointer"
              >
                <div className="relative">
                  <img src={dr.photo} className="size-20 rounded-[1.8rem] object-cover shadow-md" alt={dr.name} />
                  {dr.isOnline && (
                    <span className="absolute bottom-0 right-0 size-5 bg-brand-green border-4 border-white rounded-full shadow-sm" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="font-black text-slate-800 leading-tight text-lg">{dr.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-brand-blue uppercase tracking-[0.15em] bg-pastel-blue px-2 py-0.5 rounded-md">{dr.specialty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-tight pt-1">
                    <Activity className="size-3 text-brand-red" /> {dr.hospital}
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-2xl text-brand-blue">
                  <ChevronRight className="size-6" />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-10 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[3.5rem] space-y-5 border border-blue-200/30 shadow-2xl shadow-brand-blue/5 relative overflow-hidden">
            <div className="p-4 bg-white rounded-[1.5rem] w-fit shadow-xl shadow-blue-500/10">
              <Stethoscope className="text-brand-blue size-8" />
            </div>
            <div className="space-y-2 relative z-10">
              <h4 className="font-black text-slate-800 leading-tight text-2xl tracking-tight">Konsultasi Video 24/7</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Hubungi dokter piket kami secara instan tanpa perlu mengantre.</p>
            </div>
            <button 
              onClick={() => onNotify?.("Sedang menghubungkan ke dokter piket...")}
              className="w-full bg-brand-blue text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-brand-blue/30 uppercase tracking-widest text-xs transition-all active:scale-95"
            >
              Mulai Konsultasi (Rp 50rb)
            </button>
            <Heart className="absolute right-[-10%] top-[-10%] size-40 text-brand-blue opacity-5 -rotate-12" />
          </div>
        </>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          <button onClick={() => setSelectedDr(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] bg-white px-5 py-3 rounded-2xl border border-slate-50 shadow-sm">
            <ArrowLeft className="size-4 text-brand-red" /> Kembali ke Daftar
          </button>

          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/50 space-y-10">
            <div className="flex flex-col items-center gap-6 text-center">
              <img src={selectedDr.photo} className="size-32 rounded-[3rem] object-cover shadow-2xl border-4 border-white" alt={selectedDr.name} />
              <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{selectedDr.name}</h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="px-4 py-1.5 bg-pastel-blue text-brand-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">{selectedDr.specialty}</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold"><Info className="size-4 text-brand-yellow" /> {selectedDr.hospital}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h4 className="font-black text-xl text-slate-800 tracking-tight flex items-center gap-3">
                <div className="size-2 w-8 bg-brand-yellow rounded-full" /> Jadwal Praktek
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {selectedDr.schedule.map(s => (
                  <div key={s} className="p-5 bg-slate-50 rounded-[1.8rem] text-sm font-black text-slate-600 border border-slate-100/50 flex justify-between items-center">
                    <span>{s}</span>
                    <span className="text-[10px] bg-white px-3 py-1 rounded-full text-brand-green uppercase">Tersedia</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={() => onNotify?.(`Mulai chat dengan ${selectedDr.name}...`)}
                className="flex-1 bg-brand-blue text-white py-5 rounded-[2rem] font-black shadow-2xl shadow-brand-blue/20 uppercase tracking-widest text-xs"
              >
                Chat Dokter
              </button>
              <button 
                onClick={() => setShowBooking(true)}
                className="flex-1 border-4 border-pastel-yellow text-brand-yellow py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-pastel-yellow transition-all"
              >
                Buat Janji
              </button>
            </div>
          </div>

          {showBooking && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6"
            >
              <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-10 space-y-8 text-center shadow-2xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                  <div className="size-24 bg-pastel-yellow rounded-full flex items-center justify-center mx-auto shadow-inner border-4 border-white">
                    <Star className="size-12 text-brand-yellow fill-current" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Janji Berhasil!</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      Momi, janji temu dengan <span className="text-brand-blue font-bold">{selectedDr.name}</span> telah dikonfirmasi untuk besok jam 09:00.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowBooking(false); setSelectedDr(null); }} 
                    className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                  >
                    Selesai
                  </button>
                </div>
                <div className="absolute -right-10 -bottom-10 size-40 bg-brand-yellow opacity-5 rounded-full" />
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};

const ArticlesPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [articles, setArticles] = useState(MOCK_ARTICLES);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [bookmarked, setBookmarked] = useState<string[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const content = await generateArticle(topic);
      const newArticle = {
        id: Date.now().toString(),
        title: topic,
        category: 'AI Generated',
        thumbnail: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=400',
        readTime: '4 Menit',
        content: content || ''
      };
      setArticles([newArticle, ...articles]);
      setTopic('');
      onNotify?.("Artikel AI berhasil dibuat!");
    } catch (err) {
      console.error(err);
      onNotify?.("Gagal membuat artikel AI.");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBookmark = (id: string) => {
    const isNowBookmarked = !bookmarked.includes(id);
    setBookmarked(prev => isNowBookmarked ? [...prev, id] : prev.filter(b => b !== id));
    onNotify?.(isNowBookmarked ? "Artikel disimpan ke penanda!" : "Artikel dihapus dari penanda.");
  };

  const filtered = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  if (selectedArticle) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
        <button onClick={() => setSelectedArticle(null)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] bg-white px-5 py-3 rounded-2xl border border-slate-50 shadow-sm w-fit">
          <ArrowLeft className="size-4 text-brand-red" /> Kembali ke Artikel
        </button>
        <div className="space-y-8">
          <img src={selectedArticle.thumbnail} className="w-full aspect-video rounded-[3.5rem] object-cover shadow-2xl border-4 border-white" alt="" />
          <div className="space-y-3 px-2">
            <span className="text-[10px] font-black text-brand-blue uppercase tracking-[0.25em] bg-pastel-blue px-3 py-1 rounded-md">{selectedArticle.category}</span>
            <h1 className="text-4xl font-black text-slate-800 leading-tight tracking-tight">{selectedArticle.title}</h1>
          </div>
          <div className="markdown-body p-10 bg-white rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-50">
            <ReactMarkdown>{selectedArticle.content}</ReactMarkdown>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800">Parenting Jurnal</h1>
        <div className="flex gap-2">
           <button className="p-3 bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 relative">
              <BookOpen className="text-brand-blue size-6" />
              {bookmarked.length > 0 && <span className="absolute -top-1 -right-1 size-5 bg-brand-red text-white text-[8px] flex items-center justify-center font-black rounded-full border-2 border-white shadow-lg">{bookmarked.length}</span>}
           </button>
        </div>
      </div>

      <div className="px-6 py-2 bg-white rounded-[2rem] border border-slate-50 flex items-center shadow-xl shadow-slate-100/50">
         <Search className="size-5 text-slate-300 mr-3" />
         <input 
           placeholder="Cari tips atau kategori..." 
           className="flex-1 py-4 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
           value={search}
           onChange={e => setSearch(e.target.value)}
         />
      </div>

      <div className="bg-brand-green p-8 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-brand-green/20 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl font-black tracking-tight">AI Journal Assistant</h2>
          <p className="text-white/80 text-xs font-black uppercase tracking-wider">AI kami akan mencarikan literatur medis populer khusus untuk Momi.</p>
        </div>
        <div className="relative z-10 flex gap-2 p-1.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
          <input 
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Ketik topik: Misal 'GTM pada Bayi'..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-3 placeholder:text-white/50 font-bold text-white"
          />
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="p-3 bg-white text-brand-green rounded-xl disabled:opacity-50 shadow-xl active:scale-95 transition-all"
          >
            {isGenerating ? <Activity className="size-5 animate-spin" /> : <Send className="size-5" />}
          </button>
        </div>
        <Star className="absolute right-[-10%] bottom-[-10%] size-40 text-white opacity-10 -rotate-12" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {filtered.map(article => (
          <div key={article.id} className="group bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/40 border border-slate-50 relative">
            <button 
              onClick={() => toggleBookmark(article.id)}
              className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur-md rounded-2xl text-slate-400 hover:text-brand-red transition-all shadow-lg"
            >
              <Star className={cn("size-5", bookmarked.includes(article.id) ? "fill-current text-brand-red" : "")} />
            </button>
            <div className="h-60 overflow-hidden cursor-pointer" onClick={() => setSelectedArticle(article)}>
              <img src={article.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={article.title} />
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <span className="px-3 py-1 bg-slate-50 rounded-lg text-brand-blue">{article.category}</span>
                <span className="flex items-center gap-1"><Activity className="size-3" /> {article.readTime}</span>
              </div>
              <h3 onClick={() => setSelectedArticle(article)} className="font-black text-xl leading-tight text-slate-800 cursor-pointer hover:text-brand-blue transition-colors">{article.title}</h3>
              <div className="flex items-center gap-6 pt-2">
                 <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Heart className="size-4 text-brand-red" /> 24 Suka</button>
                 <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><MessageCircle className="size-4 text-brand-blue" /> 8 Komentar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
const GrowthPage = ({ history, onNotify }: { history: GrowthEntry[], onNotify?: (m: string) => void }) => {
  const data = history.map(h => ({ name: h.date, weight: h.weight, height: h.height, whoWeight: h.whoWeight }));
  
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold">Tumbuh Kembang</h1>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="font-black text-xl leading-tight text-slate-800">Berat Badan <span className="text-xs font-medium text-slate-400">(kg)</span></h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <div className="size-2 bg-brand-blue rounded-full" />
                <span className="text-[10px] font-black text-brand-blue/50 uppercase tracking-wider">Bayi Anda</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="size-2 bg-slate-200 rounded-full" />
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Standar WHO</span>
              </div>
            </div>
          </div>
          <span className="px-4 py-1.5 bg-pastel-green text-brand-green rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">Normal</span>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-brand-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-brand-blue)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 700 }} />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 800, padding: '12px' }} 
              />
              <Area type="monotone" dataKey="weight" stroke="var(--color-brand-blue)" fillOpacity={1} fill="url(#colorWeight)" strokeWidth={4} />
              <Line type="monotone" dataKey="whoWeight" stroke="#E2E8F0" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900 p-8 rounded-[3rem] text-white space-y-4 shadow-2xl shadow-slate-900/20">
        <h3 className="font-black text-lg text-brand-yellow">Analisis AI MomiBy</h3>
        <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
          "Berdasarkan kurva pertumbuhan, berat badan Arkana berada pada persentil 50 standar WHO. Pertumbuhan sangat stabil dan ideal. Pertahankan asupan MPASI bergizi!"
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 p-6 rounded-3xl space-y-2 border border-blue-100">
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Tinggi Badan</p>
          <h3 className="text-3xl font-black text-blue-900 leading-none">74<span className="text-sm font-medium ml-1 text-blue-400">cm</span></h3>
          <p className="text-[10px] text-blue-900/40 font-bold uppercase tracking-tight">+1.5cm bln ini</p>
        </div>
        <div className="bg-rose-50 p-6 rounded-3xl space-y-2 border border-rose-100">
          <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">Lingkar Kepala</p>
          <h3 className="text-3xl font-black text-rose-900 leading-none">44.5<span className="text-sm font-medium ml-1 text-rose-400">cm</span></h3>
          <p className="text-[10px] text-rose-900/40 font-bold uppercase tracking-tight">Normal Ideal</p>
        </div>
      </div>

      <button 
        onClick={() => onNotify?.("Membuka input data pertumbuhan...")}
        className="w-full bg-brand-blue text-white p-5 rounded-[2.5rem] font-black shadow-xl shadow-brand-blue/30 flex items-center justify-center gap-3 transition-transform active:scale-95"
      >
        <Plus className="size-6" />
        Tambah Data Baru
      </button>
    </div>
  );
};

const RecipesPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [view, setView] = useState<'menu' | 'explore' | 'custom' | 'category'>('menu');
  const [filterAge, setFilterAge] = useState('6-9 Bulan');
  const [customInput, setCustomInput] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateCustom = async () => {
    if (!customInput || isGenerating) return;
    setIsGenerating(true);
    try {
      const prompt = `Buat resep MPASI untuk bayi usia ${filterAge} dengan bahan atau keinginan: ${customInput}. Kembalikan dalam format Markdown lengkap dengan manfaat gizinya.`;
      const res = await chatWithAI(prompt, []);
      setGeneratedRecipe(res);
      setView('custom');
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const AgeSelector = () => (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
      {['6-9 Bulan', '9-12 Bulan', '12+ Bulan'].map(age => (
        <button
          key={age}
          onClick={() => setFilterAge(age)}
          className={cn(
            "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all",
            filterAge === age 
              ? "bg-brand-blue text-white shadow-xl shadow-brand-blue/20" 
              : "bg-white border border-slate-100 text-slate-400 hover:bg-slate-50"
          )}
        >
          {age}
        </button>
      ))}
    </div>
  );

  if (view === 'menu') {
    return (
      <div className="space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-tight">Makan apa Si Kecil hari ini?</h1>
          <p className="text-sm text-slate-500 font-medium leading-relaxed italic">Pilih cara mencari resep MPASI bergizi terbaik untuk buah hati Momi.</p>
        </div>

        <div className="space-y-4">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Pilih Usia Bayi</p>
           <AgeSelector />
        </div>

        <div className="grid grid-cols-1 gap-8">
          <motion.button
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('category')}
            className="p-10 bg-pastel-yellow rounded-[4rem] text-left relative overflow-hidden group shadow-2xl shadow-brand-yellow/5 border border-yellow-100/50"
          >
            <div className="relative z-10 space-y-3">
              <h3 className="text-3xl font-black text-brand-yellow tracking-tight">Kategori</h3>
              <p className="text-xs text-brand-yellow/60 font-black uppercase tracking-widest leading-relaxed">Cari resep berdasarkan<br/>jenis tekstur makanan.</p>
            </div>
            <Utensils className="absolute right-[-10%] bottom-[-10%] size-48 text-brand-yellow opacity-10 group-hover:rotate-12 transition-transform duration-700" />
          </motion.button>

          <motion.button
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('custom')}
            className="p-10 bg-brand-blue rounded-[4rem] text-left relative overflow-hidden group shadow-2xl shadow-brand-blue/20"
          >
            <div className="relative z-10 space-y-3">
              <h3 className="text-3xl font-black text-white tracking-tight">AI Resep</h3>
              <p className="text-xs text-white/60 font-black uppercase tracking-widest leading-relaxed">Ketik bahan yang tersedia,<br/>AI akan membuatkan resepnya.</p>
            </div>
            <Star className="absolute right-[-10%] bottom-[-10%] size-48 text-white/10 group-hover:scale-110 transition-transform duration-700 fill-current" />
          </motion.button>

          <motion.button
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('explore')}
            className="p-10 bg-white border border-slate-100 rounded-[4rem] text-left relative overflow-hidden group shadow-2xl shadow-slate-200/50"
          >
            <div className="relative z-10 space-y-3">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Explore</h3>
              <p className="text-xs text-slate-400 font-black uppercase tracking-widest leading-relaxed">Lihat ribuan inspirasi<br/>resep favorit Momi lainnya.</p>
            </div>
            <Search className="absolute right-[-10%] bottom-[-10%] size-48 text-slate-100 group-hover:-translate-x-6 transition-transform duration-700" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <button onClick={() => setView('menu')} className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] bg-white px-5 py-3 rounded-2xl border border-slate-50 shadow-sm w-fit">
        <ArrowLeft className="size-4 text-brand-red" /> Kembali ke Pilihan
      </button>

      <div className="space-y-6">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">
          {view === 'explore' ? 'Eksplor Resep' : view === 'custom' ? 'AI Resep Custom' : 'Kategori Resep'}
        </h1>
        <AgeSelector />
      </div>

      {view === 'custom' && (
        <div className="space-y-8">
          <div className="p-2 pl-6 bg-white rounded-[2.5rem] border border-slate-50 flex items-center shadow-2xl shadow-slate-200/50">
            <input 
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder="Misal: wortel, ayam, labu..." 
              className="flex-1 py-5 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
            />
            <button 
              onClick={handleGenerateCustom}
              disabled={isGenerating}
              className="p-4 bg-brand-blue text-white rounded-[1.8rem] disabled:opacity-50 shadow-xl shadow-brand-blue/20 active:scale-95 transition-all"
            >
              {isGenerating ? <Activity className="size-6 animate-spin" /> : <Plus className="size-6" />}
            </button>
          </div>
          {generatedRecipe && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/50 markdown-body"
            >
              <ReactMarkdown>{generatedRecipe}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      )}

      {(view === 'explore' || view === 'category') && (
        <div className="grid grid-cols-1 gap-8">
          {MOCK_RECIPES.filter(r => r.ageRange === filterAge || view === 'category').map(recipe => (
            <div key={recipe.id} className="group bg-white rounded-[3.5rem] overflow-hidden border border-slate-50 shadow-2xl shadow-slate-200/40 relative">
              <div className="h-56 overflow-hidden relative">
                <img src={recipe.photo} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={recipe.title} />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-brand-blue uppercase tracking-widest shadow-lg">{recipe.ageRange}</span>
                </div>
              </div>
              <div className="p-8 space-y-5">
                 <h3 className="font-black text-xl text-slate-800 leading-tight">{recipe.title}</h3>
                 <div className="flex gap-2 flex-wrap">
                    {recipe.ingredients.slice(0, 3).map(i => (
                      <span key={i} className="text-[10px] font-black bg-pastel-blue text-brand-blue px-4 py-1.5 rounded-xl uppercase tracking-wider border border-blue-100/50">#{i}</span>
                    ))}
                 </div>
                 <button 
                   onClick={() => onNotify?.(`Resep ${recipe.title} berhasil disimpan!`)}
                   className="w-full bg-brand-green text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-green/10 active:scale-95 transition-all"
                 >
                    Lihat Detail Resep
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChatAIPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));
      const aiResponse = await chatWithAI(userMsg, history);
      setMessages(prev => [...prev, { role: 'model', content: aiResponse || 'Maaf, saya tidak bisa menjangkau data tersebut saat ini.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', content: 'Terjadi kesalahan sistem. Silakan coba lagi.' }]);
      onNotify?.("Gagal menghubungi AI.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[78vh] space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">MomiBy Chat AI</h1>
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">Konsultasi awal non-medis khusus untuk Si Kecil.</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 px-2 scrollbar-none pb-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60 space-y-8 px-12">
            <div className="p-10 bg-pastel-blue rounded-[3rem] shadow-inner text-brand-blue relative">
              <MessageCircle className="size-16" />
              <Activity className="absolute -top-2 -right-2 size-8 text-brand-blue animate-pulse" />
            </div>
            <div className="space-y-3">
              <p className="text-lg font-black text-slate-800 tracking-tight leading-snug">Ada yang bisa MomiBy bantu hari ini, Momi?</p>
              <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-tighter">Tanyakan apapun tentang kesehatan, nutrisi, atau perilaku Si Kecil.</p>
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={cn(
              "flex flex-col max-w-[90%] space-y-2",
              m.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "p-6 rounded-[2.5rem] shadow-xl text-sm leading-relaxed",
              m.role === 'user' 
                ? "bg-brand-blue text-white rounded-br-none shadow-brand-blue/10" 
                : "bg-white text-slate-800 border border-slate-50 rounded-bl-none shadow-slate-200/40"
            )}>
              <div className="markdown-body">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest px-4">{m.role === 'user' ? 'Momi' : 'MomiBy AI'}</span>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-3 p-4 bg-white/50 rounded-full w-fit">
            <div className="size-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="size-1.5 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="size-1.5 bg-brand-blue rounded-full animate-bounce" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 p-3 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 mb-10">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Tanyakan sesuatu..."
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-4 px-5 pr-2 placeholder:text-slate-300 font-bold text-slate-800"
        />
        <button 
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className="p-4 bg-brand-blue text-white rounded-[1.8rem] shadow-xl shadow-brand-blue/20 active:scale-95 transition-all disabled:opacity-30"
        >
          <Send className="size-6" />
        </button>
      </div>
    </div>
  );
};

const EmergencyPage = ({ onNotify }: { onNotify?: (m: string) => void }) => (
  <div className="space-y-10">
    <div className="bg-pastel-red p-10 rounded-[3.5rem] border border-red-100 space-y-6 shadow-2xl shadow-brand-red/5 relative overflow-hidden">
      <div className="p-4 bg-white rounded-2xl w-fit shadow-xl shadow-red-500/10 relative z-10">
        <AlertTriangle className="size-10 text-brand-red" />
      </div>
      <div className="relative z-10">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Bantuan Darurat</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Layanan sigap untuk situasi mendesak.</p>
      </div>
      <AlertCircle className="absolute right-[-10%] top-[-10%] size-40 text-brand-red opacity-5 -rotate-12" />
    </div>

    <div className="space-y-5">
      {[
        { title: 'Panggil Ambulans', desc: 'Layanan medis darurat 119', icon: Phone, color: 'bg-brand-red', num: '119' },
        { title: 'Panggil Polisi', desc: 'Situasi kriminalitas 110', icon: Phone, color: 'bg-brand-blue', num: '110' },
        { title: 'Kesehatan Mental', desc: 'Konsultasi krisis & Baby Blues', icon: Heart, color: 'bg-brand-green', num: 'Bantuan' },
      ].map(e => (
        <motion.button
          key={e.title}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNotify?.(`Sedang menghubungkan ke ${e.title}...`)}
          className="w-full p-6 bg-white rounded-[2.5rem] border border-slate-50 shadow-xl shadow-slate-200/30 flex items-center gap-6"
        >
          <div className={cn("p-4 rounded-[1.5rem] text-white shadow-xl shadow-opacity-30", e.color)}>
            <e.icon className="size-6" />
          </div>
          <div className="text-left flex-1">
            <h3 className="font-black text-slate-800 text-lg">{e.title}</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-tight">{e.desc}</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-slate-800">{e.num}</span>
          </div>
        </motion.button>
      ))}
    </div>

    <div className="space-y-6">
      <h3 className="font-black text-xl text-slate-800 tracking-tight flex items-center gap-3">
        <div className="size-2 w-8 bg-brand-yellow rounded-full" /> Informasi Penting
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {[
          { title: 'Baby Blues & Postpartum', info: 'Gejala dan penanganan pertama untuk ibu baru.', color: 'bg-pastel-blue' },
          { title: 'ADHD pada Anak', info: 'Mengenali tanda-tanda awal dan konsultasi ahli.', color: 'bg-pastel-green' },
          { title: 'Kecemasan Orang Tua', info: 'Teknik relaksasi dan manajemen stres pengasuhan.', color: 'bg-pastel-yellow' }
        ].map(i => (
          <div key={i.title} className={cn("p-8 rounded-[2.5rem] border border-slate-50 shadow-lg shadow-slate-200/20", i.color)}>
            <h4 className="font-black text-slate-800 text-lg leading-tight">{i.title}</h4>
            <p className="text-sm text-slate-600 leading-relaxed mt-2 font-medium">{i.info}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SettingsPage = ({ profile, onUpdateProfile, onNotify }: { 
  profile: BabyProfile, 
  onUpdateProfile: (p: BabyProfile) => void,
  onNotify?: (m: string) => void
}) => {
  const [tempProfile, setTempProfile] = useState(profile);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfile({ ...tempProfile, photo: reader.result as string });
        onNotify?.("Foto profil berhasil diunggah!");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <h1 className="text-3xl font-black text-slate-800">Pengaturan</h1>

      <section className="space-y-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-4">Profil Si Kecil</h2>
        <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group size-32 bg-pastel-yellow rounded-[2.5rem] flex items-center justify-center overflow-hidden cursor-pointer shadow-inner border-4 border-white"
            >
              {tempProfile.photo ? (
                <img src={tempProfile.photo} className="w-full h-full object-cover" alt="Baby" />
              ) : (
                <span className="text-4xl font-black text-brand-yellow">{tempProfile.name[0]}</span>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Plus className="text-white size-8" />
              </div>
            </div>
            <p className="text-[10px] font-black text-brand-blue uppercase tracking-widest">Ganti Foto Profil</p>
            <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
          </div>

          <div className="space-y-5">
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-[0.2em]">Nama Lengkap</label>
              <input 
                value={tempProfile.name}
                onChange={e => setTempProfile({ ...tempProfile, name: e.target.value })}
                className="w-full p-5 bg-slate-50 rounded-3xl text-sm border-none focus:ring-4 focus:ring-brand-blue/10 font-bold"
              />
            </div>
             <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 ml-4 uppercase tracking-[0.2em]">Tanggal Lahir</label>
              <input 
                type="date"
                value={tempProfile.birthDate}
                onChange={e => setTempProfile({ ...tempProfile, birthDate: e.target.value })}
                className="w-full p-5 bg-slate-50 rounded-3xl text-sm border-none focus:ring-4 focus:ring-brand-blue/10 font-bold"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              onUpdateProfile(tempProfile);
              onNotify?.("Profil Baby berhasil diperbarui!");
            }}
            className="w-full bg-brand-green text-white py-5 rounded-3xl font-black shadow-xl shadow-brand-green/20 uppercase tracking-widest text-sm transition-all active:scale-95"
          >
            Simpan Profil
          </button>
        </div>
      </section>
    </div>
  );
};

const PharmacyPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [tab, setTab] = useState<'Obat' | 'Vaksin' | 'Alat'>('Obat');
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800">Apotek MomiBy</h1>
        <div className="relative p-3 bg-pastel-blue rounded-2xl">
          <ShoppingBag className="text-brand-blue size-6" />
          <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[9px] font-black size-5 flex items-center justify-center rounded-full shadow-lg">2</span>
        </div>
      </div>

      <div className="flex gap-4 p-2 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        {[
          { id: 'Obat', label: 'Obat', color: 'bg-brand-red' },
          { id: 'Vaksin', label: 'Vaksin', color: 'bg-brand-blue' },
          { id: 'Alat', label: 'Alkes', color: 'bg-brand-green' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex-1 py-4 rounded-3xl text-sm font-black uppercase tracking-wider transition-all",
              tab === t.id ? `${t.color} text-white shadow-xl ${t.color.replace('bg-', 'shadow-')}/20` : "text-slate-300 hover:bg-slate-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_PHARMACY.filter(p => p.category.includes(tab)).map(item => (
          <motion.div
            key={item.id}
            whileHover={{ y: -5 }}
            className="bg-white p-5 rounded-[2.5rem] border border-slate-50 flex gap-5 shadow-xl shadow-slate-200/30"
          >
            <div className="size-24 rounded-3xl overflow-hidden shadow-inner bg-slate-50">
              <img src={item.photo} className="w-full h-full object-cover" alt={item.name} />
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="font-black text-slate-800 text-lg leading-tight">{item.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-1 uppercase tracking-tight">{item.description}</p>
              <div className="flex justify-between items-end mt-4">
                <span className="font-black text-brand-green text-xl">Rp {item.price.toLocaleString()}</span>
                <button 
                  onClick={() => onNotify?.(`${item.name} berhasil ditambahkan ke keranjang!`)}
                  className="bg-pastel-blue text-brand-blue p-3 rounded-2xl hover:bg-brand-blue hover:text-white transition-all shadow-lg shadow-brand-blue/5"
                >
                  <Plus className="size-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-pastel-green p-8 rounded-[3rem] space-y-4 border border-green-100 shadow-xl shadow-brand-green/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm">
            <Info className="text-brand-green size-6" />
          </div>
          <h4 className="font-black text-slate-800 text-lg">Jadwal Vaksin</h4>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed font-medium">
          Si kecil memerlukan vaksin PCV bulan depan. Pesan sekarang untuk mengamankan stok di klinik rekanan.
        </p>
        <button 
          onClick={() => onNotify?.("Membuka jadwal vaksinasi lengkap...")}
          className="text-sm font-black text-brand-green uppercase tracking-widest border-b-2 border-brand-green pb-1"
        >
          Lihat Jadwal Lengkap
        </button>
      </div>
    </div>
  );
}

const MarketplaceItemCard = ({ item, onAdd, icon, buttonText = 'Beli' }: { item: any, onAdd: () => void, icon?: React.ReactNode, buttonText?: string }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-5 rounded-[3rem] border border-slate-50 flex gap-6 shadow-xl shadow-slate-200/30"
  >
    <div className="size-28 rounded-[2rem] overflow-hidden shadow-inner bg-slate-50 shrink-0">
      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
    </div>
    <div className="flex-1 flex flex-col justify-between py-1">
      <div>
        <h3 className="font-black text-slate-800 text-lg leading-tight">{item.name}</h3>
        <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-2 uppercase tracking-tight leading-relaxed">{item.description}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="font-black text-brand-blue text-lg">Rp {item.price.toLocaleString()}</span>
        <button 
          onClick={onAdd}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue transition-all flex items-center gap-2"
        >
          {icon || <ShoppingBag className="size-4" />}
          {buttonText}
        </button>
      </div>
    </div>
  </motion.div>
);

const MarketplacePage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [tab, setTab] = useState<'Products' | 'Food'>('Products');
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Marketplace</h1>
        <div className="relative p-3 bg-pastel-blue rounded-2xl">
          <Store className="text-brand-blue size-6" />
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/50">
        {[
          { id: 'Products', label: 'Barang', color: 'bg-brand-blue' },
          { id: 'Food', label: 'Makanan', color: 'bg-brand-yellow' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={cn(
              "flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
              tab === t.id ? `${t.color} text-white shadow-lg` : "text-slate-400 hover:bg-slate-50"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5">
        {tab === 'Products' && MOCK_MARKETPLACE.products.map(item => (
          <MarketplaceItemCard key={item.id} item={item} onAdd={() => onNotify?.(`${item.name} masuk keranjang!`)} />
        ))}
        {tab === 'Food' && MOCK_MARKETPLACE.food.map(item => (
          <MarketplaceItemCard key={item.id} item={item} onAdd={() => onNotify?.(`Pesanan ${item.name} sedang diproses!`)} icon={<Clock className="size-4" />} buttonText="Pesan" />
        ))}
      </div>
    </div>
  );
};

const FoodAIPage = ({ onNotify }: { onNotify?: (m: string) => void }) => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'details'>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        setPhoto(base64);
        setIsLoading(true);
        setError(null);
        onNotify?.("Sistem AI MomiBy sedang memproses citra makanan...");
        
        // Simulating AI Analysis with fluid timing
        setTimeout(() => {
          const mockResults = [
            {
              foodName: 'Bubur Tim Ayam Wortel',
              summary: 'Menu lengkap yang kaya akan Vitamin A dan Protein. Tekstur sangat cocok untuk usia 9-12 bulan.',
              nutrition: { calories: 125, protein: 8.5, carbs: 15.2, fat: 4.8 },
              details: [
                { label: 'Vitamin A', value: '85%', status: 'Tinggi' },
                { label: 'Zat Besi', value: '40%', status: 'Cukup' },
                { label: 'Kalsium', value: '25%', status: 'Sedang' }
              ]
            },
            {
              foodName: 'Puree Pisang & Alpukat',
              summary: 'Kombinasi lemak sehat dan kalium tinggi. Baik untuk perkembangan otak dan energi si kecil.',
              nutrition: { calories: 95, protein: 2.1, carbs: 12.5, fat: 5.4 },
              details: [
                { label: 'Kalium', value: '90%', status: 'Tinggi' },
                { label: 'Lemak Sehat', value: '70%', status: 'Tinggi' },
                { label: 'Serat', value: '30%', status: 'Sedang' }
              ]
            }
          ];
          
          const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
          setResult(randomResult);
          setIsLoading(false);
        }, 3000); // 3 seconds simulation
      };
      reader.readAsDataURL(file);
    }
  };

  const chartData = result ? [
    { name: 'Protein', value: result.nutrition.protein, color: '#1e5abb' },
    { name: 'Karbo', value: result.nutrition.carbs, color: '#FFB72B' },
    { name: 'Lemak', value: result.nutrition.fat, color: '#FF6B6B' },
  ] : [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kamera Gizi AI</h1>
        <div className="size-10 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-brand-yellow">
           <Camera className="size-6" />
        </div>
      </div>
      
      {!photo ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => fileInputRef.current?.click()}
          className="aspect-square bg-white rounded-[4rem] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-slate-50 transition-all shadow-2xl shadow-slate-200/40 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-12 bg-slate-50 rounded-[3rem] text-slate-300 group-hover:scale-110 group-hover:text-brand-blue transition-all duration-700 shadow-inner relative z-10">
            <Camera className="size-24" />
          </div>
          <div className="text-center px-10 space-y-3 relative z-10">
            <p className="font-black text-slate-800 text-2xl tracking-tight">Ambil Foto Makanan</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[200px] mx-auto">AI akan mendeteksi kandungan gizi & kalori secara otomatis</p>
          </div>
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleCapture} />
        </motion.div>
      ) : (
        <div className="space-y-10 pb-10">
          <motion.div 
            layoutId="photo-container"
            className="relative rounded-[4rem] overflow-hidden aspect-video shadow-2xl border-4 border-white"
          >
            <img src={photo} className="w-full h-full object-cover" alt="Captured Food" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
               <div className="space-y-1">
                 <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">Citra Terdeteksi</p>
                 <h2 className="text-xl font-black text-white">{result?.foodName || 'Memroses Gambar...'}</h2>
               </div>
               <button 
                onClick={() => { setPhoto(null); setResult(null); setError(null); }}
                className="p-4 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-red-500 transition-colors shadow-lg"
              >
                <X className="size-7" />
              </button>
            </div>
          </motion.div>

          {isLoading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center p-16 space-y-10 bg-white rounded-[4rem] shadow-2xl border border-slate-50 relative overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-2 bg-slate-50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-brand-blue"
                />
              </div>
              <div className="relative">
                <div className="size-28 border-8 border-slate-50 rounded-full" />
                <div className="absolute inset-0 size-28 border-8 border-brand-blue border-t-transparent rounded-full animate-spin" />
                <div className="absolute inset-0 m-auto size-16 bg-pastel-blue rounded-full flex items-center justify-center">
                  <Activity className="size-8 text-brand-blue animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="font-black text-slate-800 text-2xl tracking-tight">Menganalisis Gizi...</p>
                <div className="flex items-center gap-2 justify-center">
                  <span className="size-2 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-2 bg-brand-blue rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-2 bg-brand-blue rounded-full animate-bounce" />
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-2">Memindai Database Nutrisi MomiBy</p>
              </div>
            </motion.div>
          ) : result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Tab Navigation */}
              <div className="flex bg-white p-2 rounded-3xl border border-slate-50 shadow-lg">
                {(['overview', 'details'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 py-4 font-black text-[10px] uppercase tracking-widest rounded-2xl transition-all",
                      activeTab === tab ? "bg-slate-900 text-white" : "text-slate-400"
                    )}
                  >
                    {tab === 'overview' ? 'Ringkasan' : 'Detail Nutrisi'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                  <motion.div 
                    key="overview"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="bg-white p-10 rounded-[4rem] shadow-2xl shadow-slate-200/50 space-y-10 border border-slate-50"
                  >
                    <div className="text-center space-y-4">
                      <div className="px-5 py-2 bg-pastel-blue text-brand-blue rounded-full text-[10px] font-black tracking-[0.3em] w-fit mx-auto border border-blue-100 uppercase">Dashboard Gizi</div>
                      <h2 className="text-4xl font-black text-slate-800 uppercase tracking-tight">{result.foodName}</h2>
                      <div className="w-16 h-2 bg-brand-yellow rounded-full mx-auto" />
                      <p className="text-sm text-slate-500 leading-relaxed px-6 font-medium italic">"{result.summary}"</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="h-[260px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={75}
                              outerRadius={105}
                              paddingAngle={8}
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 800, padding: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-5xl font-black text-slate-800">{result.nutrition.calories}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kkal</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center flex-wrap gap-4 mt-8">
                        {chartData.map(item => (
                          <div key={item.name} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl">
                             <div className="size-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                             <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-8 bg-pastel-blue rounded-[3rem] border border-blue-100/50 text-center space-y-2">
                         <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest">Protein</p>
                         <p className="text-3xl font-black text-slate-800">{result.nutrition.protein}<span className="text-xs ml-1 text-slate-400">g</span></p>
                      </div>
                      <div className="p-8 bg-pastel-yellow rounded-[3rem] border border-yellow-100/50 text-center space-y-2">
                         <p className="text-[9px] font-black text-brand-yellow uppercase tracking-widest">Karbo</p>
                         <p className="text-3xl font-black text-slate-800">{result.nutrition.carbs}<span className="text-xs ml-1 text-slate-400">g</span></p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="details"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {result.details.map((detail: any, idx: number) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={detail.label} 
                        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 flex justify-between items-center"
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{detail.label}</p>
                          <h4 className="text-2xl font-black text-slate-800">{detail.value}</h4>
                        </div>
                        <span className={cn(
                          "px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border",
                          detail.status === 'Tinggi' ? "bg-pastel-green text-brand-green border-green-100" :
                          detail.status === 'Sedang' ? "bg-pastel-yellow text-brand-yellow border-yellow-100" :
                          "bg-pastel-blue text-brand-blue border-blue-100"
                        )}>
                          {detail.status}
                        </span>
                      </motion.div>
                    ))}

                    <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                       <div className="relative z-10 space-y-3">
                          <div className="flex items-center gap-3">
                             <Info className="size-5 text-brand-yellow" />
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rekomendasi MomiBy</p>
                          </div>
                          <p className="text-sm font-medium leading-relaxed italic text-slate-300">"Sangat baik untuk pertumbuhan otot. Momi bisa menambahkan sedikit santan untuk menambah lemak sehat jika diperlukan."</p>
                       </div>
                       <div className="absolute right-[-5%] bottom-[-5%] size-32 bg-white opacity-5 rounded-full" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                onClick={() => { setPhoto(null); setResult(null); }}
                className="w-full bg-brand-blue text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-blue/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Camera className="size-5" /> Ambil Foto Lain
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Main Components ---

const Notification = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={cn(
      "fixed bottom-28 left-6 right-6 z-[60] p-6 rounded-[2rem] shadow-2xl flex items-center justify-between gap-4 border",
      type === 'success' ? "bg-white border-green-100 text-slate-800" : "bg-white border-red-100 text-slate-800"
    )}
  >
    <div className="flex items-center gap-4">
      <div className={cn("p-3 rounded-xl", type === 'success' ? "bg-pastel-green text-brand-green" : "bg-pastel-red text-brand-red")}>
        {type === 'success' ? <Star className="size-5 fill-current" /> : <AlertTriangle className="size-5" />}
      </div>
      <p className="text-sm font-black tracking-tight">{message}</p>
    </div>
    <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
      <X className="size-5 text-slate-300" />
    </button>
  </motion.div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  const [babyProfile, setBabyProfile] = useState<BabyProfile>({
    name: "Arkana",
    birthDate: "2024-05-10",
    gender: "male"
  });
  const [growthHistory] = useState<GrowthEntry[]>([
    { date: 'Jan', weight: 8.5, height: 68, headCirc: 42, whoWeight: 8.2 },
    { date: 'Feb', weight: 8.8, height: 69.5, headCirc: 42.5, whoWeight: 8.7 },
    { date: 'Mar', weight: 9.2, height: 71, headCirc: 43, whoWeight: 9.1 },
    { date: 'Apr', weight: 9.6, height: 72.5, headCirc: 43.8, whoWeight: 9.5 },
    { date: 'Mei', weight: 10.1, height: 74, headCirc: 44.5, whoWeight: 9.9 },
  ]);

  const dashboardSummary = {
    nextFeeding: '18:30',
    lastWeight: growthHistory[growthHistory.length - 1].weight,
    nextVaccine: 'PCV (Bulan Depan)'
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onNavigate={setCurrentPage} profile={babyProfile} summary={dashboardSummary} onNotify={showNotification} />;
      case 'growth': return <GrowthPage history={growthHistory} onNotify={showNotification} />;
      case 'recipes': return <RecipesPage onNotify={showNotification} />;
      case 'doctors': return <DoctorsPage onNotify={showNotification} />;
      case 'schedule': return <FeedingPage onNotify={showNotification} />;
      case 'articles': return <ArticlesPage onNotify={showNotification} />;
      case 'chat-ai': return <ChatAIPage onNotify={showNotification} />;
      case 'emergency': return <EmergencyPage onNotify={showNotification} />;
      case 'pharmacy': return <PharmacyPage onNotify={showNotification} />;
      case 'marketplace': return <MarketplacePage onNotify={showNotification} />;
      case 'settings': return <SettingsPage 
         profile={babyProfile} 
         onUpdateProfile={setBabyProfile} 
         onNotify={showNotification}
       />;
      case 'food-ai': return <FoodAIPage onNotify={showNotification} />;
      default: return <div className="p-10 flex items-center justify-center font-black text-slate-300 uppercase tracking-widest">Halaman Sedang Dikembangkan 🚧</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-warm-50 min-h-screen relative font-sans selection:bg-brand-blue/20">
      <AnimatePresence mode="wait">
        <PageTransition key={currentPage}>
          {(currentPage !== 'home' && currentPage !== 'emergency') && (
            <button 
              onClick={() => setCurrentPage('home')}
              className="p-3 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-50 mb-8 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest"
            >
              <ArrowLeft className="size-4 text-brand-red" /> Kembali
            </button>
          )}
          {renderPage()}
        </PageTransition>
      </AnimatePresence>

      <AnimatePresence>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>

      <EmergencyBtn onClick={() => setCurrentPage('emergency')} />
      <Navbar activePage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
}
