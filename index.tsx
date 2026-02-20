
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Instagram, 
  Linkedin, 
  Mail, 
  Zap,
  Menu,
  X,
  Sparkles,
  Mic,
  MicOff,
  BarChart,
  Video,
  Globe,
  User,
  Activity,
  Target,
  TrendingUp,
  Layers,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  Phone,
  ArrowRight,
  Star,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// --- Configuration & Data ---
const CONFIG = {
  name: "Giacomo Diara",
  title: "Digital Strategy & Creative Design",
  email: "diaragiacomo@gmail.com",
  social: {
    linkedin: "https://www.linkedin.com/in/giacomodiara",
    instagram: "https://www.instagram.com/giacomodiara",
  }
};

const NAV_ITEMS = [
  { label: 'Introduzione', href: '#hero' },
  { label: 'Servizi', href: '#servizi' },
  { label: 'I miei progetti', href: '#portfolio' },
  { label: 'Collabora con me', href: '#collabora' },
  { label: 'Recensioni', href: '#recensioni' },
  { label: 'Amici', href: '#amici' },
  { label: 'Prenota', href: '#prenota' },
];

const SERVICES = [
  {
    id: 'smm',
    title: "Social Media Management",
    icon: <BarChart size={24} />,
    desc: "Strategie verticali su TikTok e Meta per scalare la presenza organica e adv.",
    tags: ["TikTok Strategy", "Content Plan", "Community Management"]
  },
  {
    id: 'web',
    title: "Web Architecture",
    icon: <Globe size={24} />,
    desc: "Landing page e siti WordPress focalizzati sulla conversione e sulla velocità.",
    tags: ["UX/UI Design", "Conversion Rate", "SEO Ready"]
  },
  {
    id: 'video',
    title: "Dynamic Video Editing",
    icon: <Video size={24} />,
    desc: "Editing ritmato e coinvolgente per formati short-form (Reels/TikTok).",
    tags: ["CapCut Expert", "Visual Storytelling", "Hooks"]
  }
];

const PORTFOLIO = [
  { id: 1, title: "Social Feed Concept", category: "Social Design", tech: "Canva" },
  { id: 2, title: "Brand Identity", category: "Branding", tech: "Adobe Suite" },
  { id: 3, title: "Web Mockup", category: "Web Design", tech: "WordPress" },
  { id: 4, title: "Short Form Video", category: "Video Editing", tech: "CapCut" }
];

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"
];

const REVIEWS = [
  { id: 1, name: "Marco Rossi", role: "CEO @ TechStart", text: "Giacomo ha trasformato la nostra presenza social in meno di 3 mesi. I risultati parlano da soli.", rating: 5 },
  { id: 2, name: "Elena Bianchi", role: "Marketing Manager", text: "Professionista serio e creativo. Le sue landing page convertono davvero.", rating: 5 },
  { id: 3, name: "Luca Verdi", role: "Content Creator", text: "Il montaggio video di Giacomo è di un altro livello. Dinamico e coinvolgente.", rating: 5 },
];

const COLLABORATION_STEPS = [
  { title: "Discovery Call", desc: "Analizziamo il tuo brand e i tuoi obiettivi." },
  { title: "Strategia", desc: "Definiamo un piano d'azione su misura." },
  { title: "Esecuzione", desc: "Creazione contenuti e ottimizzazione." },
  { title: "Scaling", desc: "Analisi dei dati e crescita costante." },
];

const FRIENDS = [
  { name: "Andrea", role: "Creative Director", image: "https://picsum.photos/seed/friend1/200/200" },
  { name: "Sofia", role: "Social Strategist", image: "https://picsum.photos/seed/friend2/200/200" },
  { name: "Matteo", role: "Video Editor", image: "https://picsum.photos/seed/friend3/200/200" },
  { name: "Giulia", role: "Web Designer", image: "https://picsum.photos/seed/friend4/200/200" },
];

const GIACOMO_CONTEXT = `
Sei il "Gemello Digitale" di Giacomo Diara. Giacomo è un esperto in SMM, Web Design e Video Editing.
PERSONALITÀ: Professionale, sintetico, energico, cordiale.
LINGUA: Italiano.
OBIETTIVO: Rispondere a domande sui servizi di Giacomo, fissare contatti via email (${CONFIG.email}) e mostrare competenza digitale.
Se l'utente vuole prenotare una chiamata, digli di scorrere fino alla sezione "Prenota" o mandare una mail.
`;

// --- Helpers for Audio & AI ---
const encode = (bytes: Uint8Array) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// --- Components ---

const SectionHeading = ({ subtitle, title, centered = false }: { subtitle: string, title: string, centered?: boolean }) => (
  <div className={`mb-16 ${centered ? 'text-center' : ''}`}>
    <motion.span 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-electric-blue text-[10px] font-black uppercase tracking-[0.4em] mb-4 block"
    >
      {subtitle}
    </motion.span>
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none"
    >
      {title}
    </motion.h2>
  </div>
);

const BookingCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth] = useState(new Date().getMonth());
  const [currentYear] = useState(new Date().getFullYear());
  const [isBooked, setIsBooked] = useState(false);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long' }).format(new Date(currentYear, currentMonth));

  const handleBooking = () => {
    if (selectedDate && selectedTime) {
      setIsBooked(true);
      setTimeout(() => setIsBooked(false), 5000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white border border-zinc-100 p-8 rounded-3xl shadow-xl">
      <div>
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black uppercase italic tracking-tighter">
            {monthName} {currentYear}
          </h3>
          <div className="flex gap-2">
            <button className="p-2 border border-zinc-100 rounded-full hover:bg-zinc-50 transition-colors"><ChevronLeft size={20} /></button>
            <button className="p-2 border border-zinc-100 rounded-full hover:bg-zinc-50 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center mb-4">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
            <span key={d} className="text-[10px] font-bold text-zinc-400 uppercase">{d}</span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array(firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1).fill(null).map((_, i) => (
            <div key={`empty-${i}`} className="h-12" />
          ))}
          {days.map(day => {
            const isSelected = selectedDate === day;
            const isToday = new Date().getDate() === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(day)}
                className={`h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all
                  ${isSelected ? 'bg-electric-blue text-white scale-110 shadow-lg' : 'hover:bg-zinc-100 text-zinc-800'}
                  ${isToday && !isSelected ? 'border border-electric-blue text-electric-blue' : ''}
                `}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-zinc-100 pt-8 lg:pt-0 lg:pl-12">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
            <Clock size={16} /> Slot Disponibili
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`py-3 px-4 rounded-xl border text-sm font-bold transition-all
                  ${selectedTime === slot ? 'bg-zinc-900 border-zinc-900 text-white' : 'border-zinc-100 text-zinc-600 hover:border-zinc-300'}
                `}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12">
          <AnimatePresence mode="wait">
            {isBooked ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-3 border border-green-100"
              >
                <CheckCircle2 size={20} />
                <span className="font-bold">Richiesta inviata con successo!</span>
              </motion.div>
            ) : (
              <button
                disabled={!selectedDate || !selectedTime}
                onClick={handleBooking}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all
                  ${selectedDate && selectedTime 
                    ? 'bg-electric-blue text-white hover:scale-[1.02] shadow-xl' 
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'}
                `}
              >
                Conferma Prenotazione
                <ArrowRight size={20} />
              </button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ onToggleAI, aiActive }: { onToggleAI: () => void, aiActive: boolean }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'py-8'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="text-2xl font-black italic tracking-tighter uppercase">
          GD<span className="text-electric-blue">.</span>
        </a>

        <div className="hidden md:flex items-center gap-12">
          {NAV_ITEMS.map(item => (
            <a key={item.label} href={item.href} className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-electric-blue transition-colors">
              {item.label}
            </a>
          ))}
          <button 
            onClick={onToggleAI}
            className={`flex items-center gap-2 px-6 py-2 rounded-full border-2 transition-all font-black text-[11px] uppercase tracking-widest
              ${aiActive ? 'bg-electric-blue border-electric-blue text-white animate-pulse' : 'border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white'}
            `}
          >
            {aiActive ? <Zap size={14} fill="currentColor" /> : <Sparkles size={14} />}
            Digital Twin
          </button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-100 px-6 py-8"
          >
            <div className="flex flex-col gap-6">
              {NAV_ITEMS.map(item => (
                <a key={item.label} href={item.href} onClick={() => setIsOpen(false)} className="text-xl font-black uppercase italic tracking-tighter">
                  {item.label}
                </a>
              ))}
              <button 
                onClick={() => { onToggleAI(); setIsOpen(false); }}
                className="w-full py-4 bg-zinc-900 text-white font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <Sparkles size={18} />
                Digital Twin
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const DigitalTwinOverlay = ({ isActive, onClose }: { isActive: boolean, onClose: () => void }) => {
  const [isLive, setIsLive] = useState(false);
  const [transcription, setTranscription] = useState("");
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLive(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const input = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(input.length);
              for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
              sessionPromise.then(s => s.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
              }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.outputTranscription) {
              setTranscription(prev => (prev + " " + msg.serverContent?.outputTranscription?.text).trim());
            }
            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64 && audioContextRef.current) {
              const buffer = await decodeAudioData(decode(audioBase64), audioContextRef.current, 24000, 1);
              const source = audioContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(audioContextRef.current.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsLive(false),
          onerror: (e) => console.error("Live Error", e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: GIACOMO_CONTEXT,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          outputAudioTranscription: {}
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isActive && !isLive) startSession();
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      sourcesRef.current.forEach(s => s.stop());
    };
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-zinc-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
        >
          <button onClick={onClose} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors">
            <X size={32} />
          </button>

          <div className="w-full max-w-xl text-center">
            <div className="relative mb-12">
              <div className="w-32 h-32 rounded-full bg-electric-blue/20 mx-auto flex items-center justify-center relative">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 rounded-full border-2 border-electric-blue/50"
                />
                <Sparkles className="text-electric-blue" size={48} />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black italic uppercase text-white mb-4 tracking-tighter">
              Digital Twin <span className="text-electric-blue">Giacomo</span>
            </h2>
            <p className="text-zinc-400 font-medium mb-12 uppercase tracking-widest text-[11px]">
              {isLive ? "In ascolto... Parla ora." : "Connessione in corso..."}
            </p>

            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-8 min-h-[120px] flex items-center justify-center">
              <p className="text-zinc-200 text-lg leading-relaxed italic">
                {transcription || "Ciao! Sono la versione digitale di Giacomo. Come posso aiutarti oggi?"}
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <div className="p-4 bg-white/5 rounded-full text-zinc-400">
                <Mic size={20} />
              </div>
              <div className="px-6 py-4 bg-electric-blue text-white rounded-full font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Live Audio Session
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const [aiActive, setAiActive] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar onToggleAI={() => setAiActive(true)} aiActive={aiActive} />
      <DigitalTwinOverlay isActive={aiActive} onClose={() => setAiActive(false)} />

      {/* Hero */}
      <section id="hero" className="relative pt-40 pb-20 md:pt-60 md:pb-40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-electric-blue text-[11px] font-black uppercase tracking-[0.4em] mb-6 block">
                Digital Strategy & Content Design
              </span>
              <h1 className="text-6xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85] mb-8">
                Creatività <br />
                <span className="text-electric-blue">Digitale</span> <br />
                Senza Compromessi
              </h1>
              <p className="text-xl md:text-2xl text-zinc-500 max-w-xl font-medium leading-relaxed mb-10">
                Trasformo idee in ecosistemi digitali performanti. Social Media, Web Design e Video Editing con un unico obiettivo: la conversione.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="#prenota" className="px-10 py-5 bg-zinc-900 text-white font-black uppercase tracking-widest text-[11px] hover:bg-electric-blue transition-all">
                  Iniziamo un Progetto
                </a>
                <button onClick={() => setAiActive(true)} className="px-10 py-5 border-2 border-zinc-900 font-black uppercase tracking-widest text-[11px] flex items-center gap-2 hover:bg-zinc-50 transition-all">
                  Parla con il Twin
                </button>
              </div>
            </motion.div>
          </div>
          <div className="hidden md:block md:col-span-4 relative">
             <motion.div 
               animate={{ rotate: [0, 5, 0] }}
               transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
               className="aspect-[4/5] bg-zinc-100 border border-zinc-200 rounded-3xl overflow-hidden relative"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                  <div className="font-black italic uppercase tracking-tighter text-4xl">GD.</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest opacity-80">Giacomo Diara</div>
                </div>
                {/* Placeholder image representation */}
                <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                   <User size={120} className="text-zinc-200" />
                </div>
             </motion.div>
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-electric-blue rounded-full blur-[100px] opacity-20" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servizi" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle="Expertise" title="Cosa posso fare per te" />
          <div className="grid md:grid-cols-3 gap-8">
            {SERVICES.map((s, idx) => (
              <motion.div 
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-10 rounded-3xl border border-zinc-100 hover:shadow-2xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-8 group-hover:bg-electric-blue group-hover:text-white transition-colors">
                  {s.icon}
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">{s.title}</h3>
                <p className="text-zinc-500 font-medium mb-8 leading-relaxed">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-zinc-100 rounded-full text-zinc-400">{tag}</span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio */}
      <section id="portfolio" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
            <SectionHeading subtitle="Work" title="Progetti Selezionati" />
            <a href="#" className="mb-16 font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-electric-blue transition-colors flex items-center gap-2">
              Vedi Tutto <ArrowRight size={14} />
            </a>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PORTFOLIO.map(item => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -10 }}
                className="aspect-square bg-zinc-100 rounded-3xl p-8 flex flex-col justify-end border border-zinc-200 group relative overflow-hidden"
              >
                <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <ArrowRight size={18} />
                </div>
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-electric-blue mb-2 block">{item.category}</span>
                  <h4 className="text-xl font-black uppercase italic tracking-tighter mb-2">{item.title}</h4>
                  <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">{item.tech}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Collabora con me */}
      <section id="collabora" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle="Processo" title="Collabora con me" />
          <div className="grid md:grid-cols-4 gap-8">
            {COLLABORATION_STEPS.map((step, idx) => (
              <motion.div 
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative p-8 bg-white rounded-3xl border border-zinc-100"
              >
                <div className="text-4xl font-black text-zinc-100 absolute top-4 right-8">0{idx + 1}</div>
                <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4 relative z-10">{step.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recensioni */}
      <section id="recensioni" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle="Testimonials" title="Cosa dicono di me" centered />
          <div className="grid md:grid-cols-3 gap-8">
            {REVIEWS.map((review, idx) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-10 bg-white border border-zinc-100 rounded-3xl shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-electric-blue text-electric-blue" />
                  ))}
                </div>
                <p className="text-lg font-medium text-zinc-700 italic mb-8">"{review.text}"</p>
                <div>
                  <div className="font-black uppercase italic tracking-tighter">{review.name}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{review.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Amici */}
      <section id="amici" className="py-32 bg-zinc-50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionHeading subtitle="Network" title="Amici & Collaboratori" centered />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {FRIENDS.map((friend, idx) => (
              <motion.div 
                key={friend.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-6 inline-block">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-electric-blue transition-all duration-500">
                    <img 
                      src={friend.image} 
                      alt={friend.name} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-2 rounded-full shadow-md text-electric-blue opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} fill="currentColor" />
                  </div>
                </div>
                <h4 className="text-xl font-black uppercase italic tracking-tighter">{friend.name}</h4>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{friend.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="prenota" className="py-32 bg-zinc-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-blue rounded-full blur-[180px] opacity-10" />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-20">
            <div className="lg:col-span-5">
              <span className="text-electric-blue text-[11px] font-black uppercase tracking-[0.4em] mb-6 block">Contatto Diretto</span>
              <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none mb-12">
                Pianifica la Tua <span className="text-electric-blue">Strategia</span>
              </h2>
              <p className="text-zinc-400 text-lg mb-12 max-w-md">
                Scegli un momento per una discovery call gratuita. Analizzeremo insieme il tuo business e i tuoi obiettivi digitali.
              </p>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-electric-blue">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Email</div>
                    <div className="font-bold">{CONFIG.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-electric-blue">
                    <Linkedin size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Linkedin</div>
                    <div className="font-bold">giacomodiara</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 text-zinc-900">
              <BookingCalendar />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black italic tracking-tighter uppercase">
            GD<span className="text-electric-blue">.</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
            © 2024 Giacomo Diara. Tutti i diritti riservati.
          </div>
          <div className="flex gap-6">
            <a href={CONFIG.social.instagram} className="text-zinc-400 hover:text-electric-blue transition-colors"><Instagram size={20} /></a>
            <a href={CONFIG.social.linkedin} className="text-zinc-400 hover:text-electric-blue transition-colors"><Linkedin size={20} /></a>
            <a href={`mailto:${CONFIG.email}`} className="text-zinc-400 hover:text-electric-blue transition-colors"><Mail size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
