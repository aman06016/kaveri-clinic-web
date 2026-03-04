/*
  ╔═══════════════════════════════════════════════════════════════╗
  ║  KAVERI CARE DIAGNOSTIC CENTER — Website + Admin Panel       ║
  ║  Single-file React component with Supabase backend           ║
  ╚═══════════════════════════════════════════════════════════════╝

  SUPABASE SETUP — Do this once before deploying:

  1. Go to supabase.com/dashboard
  2. Create project: "kaveri-care"
  3. Copy the Project URL and anon key
  4. Put values in `.env.local` (see `.env.example`)
  5. Tables (bookings, slots, settings) are already created via migration.
  6. RLS policies allow open access for MVP. Tighten before going public.
*/

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, supabaseReady } from "./lib/supabase";
import {
  Phone, MapPin, Clock, Star, ChevronDown, ChevronUp,
  Calendar, User, Menu, X, Shield, BarChart3, Settings,
  ClipboardList, Trash2, MessageCircle, Copy, Check,
  AlertCircle, Loader2, ArrowLeft, LogOut, Lock,
  Globe, Search, Filter, Plus, Minus, Ban, Info
} from "lucide-react";

/* ══════════════════════════════════════════
   CONSTANTS
══════════════════════════════════════════ */
const ALL_SLOTS = [
  "10:00","10:30","11:00","11:30","12:00","12:30",
  "13:00","13:30","14:00","14:30",
  "17:30","18:00","18:30"
];

const SERVICES = [
  { icon: "🔬", name: "3D/4D Sonography", desc: "Detailed baby images & real-time movement views for pregnancy care", prep: "Drink water regularly 1–2 days before. Moderately full bladder. Wear loose two-piece clothing. Avoid heavy gas-forming meals before scan.", color: "from-teal-600/70 to-teal-900/80", duration: "20–45 min" },
  { icon: "🤰", name: "Anomaly Scan", desc: "Detailed second-trimester scan checking baby organs head to toe (18–22 weeks)", prep: "Follow instructions on bladder filling (often partially full). Bring previous reports. Wear comfortable clothing.", color: "from-teal-500/50 to-dark-50/80", duration: "30–60 min" },
  { icon: "📏", name: "NT/NB Scan", desc: "First trimester screening for chromosomal risk markers (11–14 weeks)", prep: "Usually no fasting. Full bladder may be advised depending on gestational age. Carry dating scan records.", color: "from-purple-700/40 to-dark-50/80", duration: "20–30 min" },
  { icon: "💓", name: "Pregnancy Doppler Scan", desc: "Blood flow assessment between mother, placenta & baby", prep: "No fasting in most cases. Wear comfortable clothing and carry prior ultrasound records.", color: "from-teal-700/50 to-dark-50/80", duration: "15–30 min" },
  { icon: "☢️", name: "X-Ray", desc: "Quick digital X-Ray for bones, chest & emergency assessments", prep: "Remove metal objects (jewelry, belts). Wear simple clothing. Inform staff if pregnant or possibly pregnant.", color: "from-orange-600/50 to-dark-50/80", duration: "5–15 min" },
  { icon: "🧪", name: "Blood Tests", desc: "Screen organ function, infection, sugar, thyroid, lipids & more", prep: "Fasting 8–12 hours for lipid/glucose profiles (as advised). Drink plain water. Avoid alcohol/heavy meals before test.", color: "from-emerald-600/50 to-dark-50/80", duration: "5–10 min" },
  { icon: "🧫", name: "Urine Test", desc: "Simple lab test for kidney health, infection, sugar & hydration clues", prep: "Prefer clean-catch midstream sample. Avoid contamination. Share current medicines with lab/doctor.", color: "from-blue-600/50 to-dark-50/80", duration: "5 min" },
];

const REVIEWS = [
  { stars: 4, text: "I recently visited Kaveri Care for an ultrasound sonography, and my experience was fantastic. The staff was super helpful and polite.", name: "Sajan Haldar" },
  { stars: 5, text: "Kaveri Care have advance ultrasound machine and X-ray machine. They provide sample collections service also.", name: "Yasir Siddiqui" },
  { stars: 5, text: "Latest machines are used to do sonography. Reports are accurate and reliable.", name: "Raag Anurag" },
  { stars: 5, text: "Excellent staff and good service. Doctors have good knowledge.", name: "Raghavendra R." },
  { stars: 5, text: "Very nice behavior of the doctor, and good hospitality.", name: "Aman Gupta" },
  { stars: 5, text: "Nice behavior, neat and clean diagnostic centre.", name: "Sheikh Jaan Mohammad" },
  { stars: 5, text: "Best diagnostic center in Korba with qualified staff and equipment.", name: "Manasali Sanjay" },
  { stars: 5, text: "Best 4D sonography centre in Korba, quick service.", name: "Pranav Mahant" },
  { stars: 5, text: "Best 3D and 4D ultrasound center in Korba.", name: "Abhishek Yadav" },
  { stars: 5, text: "Well maintained equipment and friendly staff.", name: "Supritha Sup" },
];

const DEFAULT_SETTINGS = {
  name: "Kaveri Care Diagnostic Center",
  phone1: "6267580898",
  phone2: "7747880452",
  address: "HIG 11, Niharika Rd, near Subhash Chowk, in front of Dussehra Maidan, R P Nagar 2, Korba, Chhattisgarh 495677",
  hours: {
    weekday: { open: "10:00", close: "15:00", open2: "17:30", close2: "19:00" },
    sunday: { open: "10:00", close: "15:00", open2: "17:30", close2: "19:00" },
  },
};

const STATUS_MAP = {
  pending: { label: "Pending", bg: "bg-yellow-500/20", text: "text-yellow-300", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  confirmed: { label: "Confirmed", bg: "bg-green-500/20", text: "text-green-300", border: "border-green-500/30", dot: "bg-green-400" },
  completed: { label: "Completed", bg: "bg-blue-500/20", text: "text-blue-300", border: "border-blue-500/30", dot: "bg-blue-400" },
  cancelled: { label: "Cancelled", bg: "bg-red-500/20", text: "text-red-300", border: "border-red-500/30", dot: "bg-red-400" },
};

const NEXT_STATUS = { pending: "confirmed", confirmed: "completed", completed: "cancelled", cancelled: "pending" };

/* ══════════════════════════════════════════
   TRANSLATIONS
══════════════════════════════════════════ */
const t = {
  en: {
    bookBtn: "Book Appointment",
    callBtn: "Call Now",
    servicesTitle: "Our Diagnostic Services",
    servicesSubtitle: "State-of-the-art equipment. Experienced technicians.",
    bookTest: "Book This Test",
    prepTips: "Prep Tips",
    formTitle: "Book Your Appointment",
    formSubtitle: "Takes 60 seconds. Confirmation on WhatsApp.",
    openNow: "Open Now",
    closedNow: "Closed",
    closesAt: "Closes at",
    opensAt: "Opens tomorrow at",
    trustTitle: "Trusted by Korba",
    patients: "Happy Patients",
    rating: "Google Reviews",
    years: "Services Offered",
    name: "Full Name",
    phone: "Phone Number",
    service: "Select Service",
    date: "Preferred Date",
    time: "Select Time Slot",
    submit: "Confirm Booking",
    saving: "Saving...",
    checkingSlots: "Checking availability...",
    full: "Full",
    na: "N/A",
    address: "Address",
    hours: "Clinic Hours",
    findUs: "Find Us",
    copyAddr: "Copy",
    copied: "Copied!",
    getDir: "Get Directions",
    madeWith: "Made with ❤️ for Korba",
    admin: "Admin",
    weekday: "Mon – Sat",
    sunday: "Sunday",
    heroTagline: "Accurate Reports. Caring Hands.",
    heroSubTagline: "सटीक रिपोर्ट। स्नेहपूर्ण देखभाल।",
    heroDesc: "Advanced diagnostic services in the heart of Korba. 3D/4D Sonography, Anomaly Scan, Doppler, X-Ray, Blood Tests & more — with accurate reports and trusted care.",
    whatsappUs: "WhatsApp Us",
  },
  hi: {
    bookBtn: "अपॉइंटमेंट बुक करें",
    callBtn: "अभी कॉल करें",
    servicesTitle: "हमारी डायग्नोस्टिक सेवाएं",
    servicesSubtitle: "आधुनिक उपकरण। अनुभवी तकनीशियन।",
    bookTest: "यह टेस्ट बुक करें",
    prepTips: "तैयारी टिप्स",
    formTitle: "अपॉइंटमेंट बुक करें",
    formSubtitle: "60 सेकंड में बुकिंग। WhatsApp पर पुष्टि।",
    openNow: "अभी खुला है",
    closedNow: "बंद है",
    closesAt: "बंद होगा",
    opensAt: "कल खुलेगा",
    trustTitle: "कोरबा का भरोसा",
    patients: "खुश मरीज़",
    rating: "गूगल रिव्यू",
    years: "सेवाएं उपलब्ध",
    name: "पूरा नाम",
    phone: "फ़ोन नंबर",
    service: "सेवा चुनें",
    date: "तिथि चुनें",
    time: "समय चुनें",
    submit: "बुकिंग की पुष्टि करें",
    saving: "सेव हो रहा...",
    checkingSlots: "उपलब्धता जांच रहे...",
    full: "भरा",
    na: "N/A",
    address: "पता",
    hours: "क्लिनिक समय",
    findUs: "हमें खोजें",
    copyAddr: "कॉपी",
    copied: "कॉपी हुआ!",
    getDir: "दिशा-निर्देश",
    madeWith: "कोरबा के लिए ❤️ से बनाया",
    admin: "एडमिन",
    weekday: "सोम – शनि",
    sunday: "रविवार",
    heroTagline: "सटीक रिपोर्ट। स्नेहपूर्ण देखभाल।",
    heroSubTagline: "Accurate Reports. Caring Hands.",
    heroDesc: "कोरबा के केंद्र में उन्नत डायग्नोस्टिक सेवाएं। 3D/4D सोनोग्राफी, एनॉमली स्कैन, डॉपलर, एक्स-रे, ब्लड टेस्ट और बहुत कुछ — सटीक रिपोर्ट और भरोसेमंद देखभाल।",
    whatsappUs: "WhatsApp करें",
  }
};

/* ══════════════════════════════════════════
   UTILITY: Format time for display
══════════════════════════════════════════ */
function fmt12(t24) {
  const [h, m] = t24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

/* ══════════════════════════════════════════
   STAR PARTICLE BACKGROUND (from kaveri-combo)
══════════════════════════════════════════ */
function StarParticles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W, H, stars, raf;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      stars = Array.from({ length: 100 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3, twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.01 + Math.random() * 0.02, speed: Math.random() * 0.3 + 0.05,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach(s => {
        s.twinkle += s.twinkleSpeed;
        const a = 0.3 + 0.7 * Math.abs(Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,240,255,${a * 0.7})`;
        ctx.fill();
        if (s.r > 1.1) {
          ctx.strokeStyle = `rgba(200,240,255,${a * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y);
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3);
          ctx.stroke();
        }
        s.y -= s.speed;
        if (s.y < -4) { s.y = H + 4; s.x = Math.random() * W; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ══════════════════════════════════════════
   AURORA BLOBS (from kaveri-combo)
══════════════════════════════════════════ */
function AuroraBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[60%] h-[70%] -top-[10%] -left-[5%] animate-aurora-1" style={{ background: "radial-gradient(ellipse, rgba(13,110,110,0.35) 0%, transparent 70%)", filter: "blur(30px)" }} />
      <div className="absolute w-[50%] h-[60%] top-[20%] right-0 animate-aurora-2" style={{ background: "radial-gradient(ellipse, rgba(20,160,133,0.28) 0%, transparent 70%)", filter: "blur(35px)" }} />
      <div className="absolute w-[45%] h-[55%] -bottom-[5%] left-[25%] animate-aurora-3" style={{ background: "radial-gradient(ellipse, rgba(232,168,56,0.15) 0%, transparent 70%)", filter: "blur(40px)" }} />
    </div>
  );
}

/* ══════════════════════════════════════════
   GLASS CARD
══════════════════════════════════════════ */
function GlassCard({ children, className = "", hover = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-glass rounded-2xl shadow-glass transition-all duration-300 ${hover ? "hover:-translate-y-1 hover:scale-[1.01] hover:shadow-glass-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(36px)",
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════════ */
function Counter({ target, suffix = "", label, decimal = false }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const interval = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(interval); }
          else setCount(decimal ? parseFloat(start.toFixed(1)) : Math.floor(start));
        }, 25);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target, decimal]);
  return (
    <div ref={ref} className="text-center">
      <p className="text-gradient-stat font-display text-[clamp(28px,4vw,44px)] font-black mb-1">
        {decimal ? count.toFixed(1) : count.toLocaleString()}{suffix}
      </p>
      <p className="text-xs text-white/50 font-semibold tracking-wider uppercase font-body">{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════ */
function Marquee({ items, reverse = false }) {
  return (
    <div className="overflow-hidden w-full">
      <div className={`flex gap-4 w-max ${reverse ? "animate-marquee-r" : "animate-marquee-f"}`}>
        {[...items, ...items].map((item, i) => (
          <div key={i} className="bg-glass rounded-2xl p-4 min-w-[260px] flex-shrink-0">
            <div className="flex gap-0.5 mb-2">
              {Array.from({ length: item.stars }).map((_, si) => (
                <span key={si} className="text-gold-400 text-xs">★</span>
              ))}
            </div>
            <p className="text-white/85 text-sm mb-2 leading-relaxed font-body">&ldquo;{item.text}&rdquo;</p>
            <p className="text-white/40 text-xs font-semibold">— {item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════════════ */
function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`animate-slide-in-right rounded-xl p-4 shadow-lg border flex items-start gap-3 ${
            toast.type === "success" ? "bg-green-900/90 border-green-500/30" :
            toast.type === "error" ? "bg-red-900/90 border-red-500/30" :
            "bg-dark-50/90 border-white/10"
          }`}
        >
          {toast.type === "success" && <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
          {toast.type === "info" && <Info className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />}
          <p className="text-sm text-white/90 font-body">{toast.message}</p>
          <button onClick={() => removeToast(toast.id)} className="text-white/40 hover:text-white ml-auto shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t2 => t2.id !== id)), 3500);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t2 => t2.id !== id));
  }, []);
  return { toasts, addToast, removeToast };
}

/* ══════════════════════════════════════════
   LIVE STATUS COMPUTATION
══════════════════════════════════════════ */
function computeOpenStatus(settings) {
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours();
  const m = now.getMinutes();
  const current = h * 60 + m;

  const hrs = settings?.hours || DEFAULT_SETTINGS.hours;
  const isSunday = day === 0;
  const schedule = isSunday ? hrs.sunday : hrs.weekday;

  const toMin = (t) => { const [hh, mm] = t.split(":").map(Number); return hh * 60 + mm; };

  const s1Open = toMin(schedule.open);
  const s1Close = toMin(schedule.close);
  const inSession1 = current >= s1Open && current < s1Close;

  const hasSession2 = schedule.open2 && schedule.close2;
  const s2Open = hasSession2 ? toMin(schedule.open2) : 0;
  const s2Close = hasSession2 ? toMin(schedule.close2) : 0;
  const inSession2 = hasSession2 && current >= s2Open && current < s2Close;

  const isOpen = inSession1 || inSession2;

  let closeTime = schedule.close;
  let openTime = schedule.open;
  if (inSession1) closeTime = schedule.close;
  else if (inSession2) closeTime = schedule.close2;
  else if (!isOpen && hasSession2 && current < s2Open && current >= s1Close) {
    openTime = schedule.open2;
  }

  return { isOpen, closeTime, openTime, schedule };
}

/* ══════════════════════════════════════════
   MAIN APP COMPONENT
══════════════════════════════════════════ */
export default function App() {
  // Page/view state
  const [page, setPage] = useState("website"); // "website" | "admin"
  const [lang, setLang] = useState("en");
  const L = t[lang];

  // Clinic settings from Supabase
  const [clinicSettings, setClinicSettings] = useState(DEFAULT_SETTINGS);

  // Navigation
  const [navSolid, setNavSolid] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Booking form
  const [selectedService, setSelectedService] = useState("");
  const bookingRef = useRef(null);

  // Toast
  const { toasts, addToast, removeToast } = useToast();

  // Scroll listener for nav
  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load clinic settings from Supabase (with realtime)
  useEffect(() => {
    if (!supabaseReady) return;
    const fetchSettings = async () => {
      const { data } = await supabase.from("settings").select("value").eq("key", "clinic").single();
      if (data?.value) setClinicSettings({ ...DEFAULT_SETTINGS, ...data.value });
    };
    fetchSettings();
    const channel = supabase.channel("settings-changes").on(
      "postgres_changes", { event: "*", schema: "public", table: "settings", filter: "key=eq.clinic" },
      (payload) => {
        if (payload.new?.value) setClinicSettings({ ...DEFAULT_SETTINGS, ...payload.new.value });
      }
    ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const scrollToBooking = (service = "") => {
    if (service) setSelectedService(service);
    setPage("website");
    setTimeout(() => {
      bookingRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const openStatus = computeOpenStatus(clinicSettings);

  // ─── WEBSITE VIEW ───
  if (page === "website") {
    return (
      <div className="bg-dark min-h-screen font-body text-white overflow-x-hidden">
        <ToastContainer toasts={toasts} removeToast={removeToast} />

        {/* ── NAVBAR ── */}
        <nav className={`fixed top-0 left-0 right-0 z-[100] px-[5%] py-4 flex items-center justify-between transition-all duration-400 ${navSolid ? "bg-dark/85 backdrop-blur-xl border-b border-white/[0.06]" : ""}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl flex items-center justify-center text-lg shadow-teal">🏥</div>
            <div>
              <p className="font-display font-black text-sm leading-none tracking-tight">{clinicSettings.name}</p>
              <p className="text-[9px] text-white/40 font-semibold tracking-[1.5px] uppercase">Diagnostic Center</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {[
              ["#services", L.servicesTitle.split(" ")[0]],
              ["#booking", L.bookBtn.split(" ")[0]],
              ["#contact", L.findUs],
            ].map(([href, label]) => (
              <a key={href} href={href} className="text-white/60 hover:text-white text-xs font-semibold tracking-wide transition-colors">{label}</a>
            ))}

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "हिं" : "EN"}
            </button>

            <button onClick={() => scrollToBooking()} className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-full px-5 py-2 text-white font-bold text-xs tracking-wide shadow-teal hover:shadow-lg transition-all">
              {L.bookBtn}
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white/70" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile menu overlay */}
        {mobileMenu && (
          <div className="fixed inset-0 z-[99] bg-dark/95 backdrop-blur-xl pt-20 px-6 flex flex-col gap-6 md:hidden animate-fade-in">
            <button onClick={() => setLang(lang === "en" ? "hi" : "en")} className="flex items-center gap-2 text-sm font-bold text-white/70">
              <Globe className="w-4 h-4" /> {lang === "en" ? "हिंदी" : "English"}
            </button>
            {[
              ["#services", L.servicesTitle],
              ["#booking", L.bookBtn],
              ["#contact", L.findUs],
            ].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileMenu(false)} className="text-white/80 text-lg font-semibold">{label}</a>
            ))}
            <button onClick={() => { setMobileMenu(false); scrollToBooking(); }} className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-full px-6 py-3 text-white font-bold text-sm shadow-teal mt-4">
              📅 {L.bookBtn}
            </button>
          </div>
        )}

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center px-[5%] pt-24 pb-16 overflow-hidden">
          <AuroraBlobs />
          <StarParticles />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative z-10 max-w-2xl animate-fade-in-up">
            {/* Live badge */}
            <div className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 border text-xs font-bold ${openStatus.isOpen ? "bg-teal-500/20 border-teal-500/50 text-teal-200" : "bg-red-500/20 border-red-500/40 text-red-300"}`}>
              <div className={`w-2 h-2 rounded-full animate-live-pulse ${openStatus.isOpen ? "bg-teal-400" : "bg-red-400"}`} />
              {openStatus.isOpen ? `${L.openNow} — ${L.closesAt} ${fmt12(openStatus.closeTime)}` : L.closedNow}
            </div>

            {/* Star badge */}
            <div className="flex items-center gap-2 mt-4 mb-2">
              <div className="flex items-center gap-1 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1">
                <Star className="w-3.5 h-3.5 text-gold-400 fill-gold-400" />
                <span className="text-xs font-bold text-gold-400">4.4</span>
              </div>
              <span className="text-xs text-white/40 font-medium">52+ Google Reviews</span>
            </div>

            <h1 className="font-display text-[clamp(36px,6vw,68px)] font-black leading-[1.08] tracking-tight mt-4">
              <span className="block text-gradient-white">{clinicSettings.name}</span>
            </h1>
            <p className="text-xl md:text-2xl text-teal-300/90 font-display font-bold mt-2">{L.heroTagline}</p>
            <p className="text-base text-white/40 font-hindi mt-1">{L.heroSubTagline}</p>
            <p className="text-white/50 text-sm leading-relaxed max-w-lg mt-5">{L.heroDesc}</p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => scrollToBooking()}
                className="flex items-center gap-2.5 bg-gradient-to-br from-teal-600 to-teal-500 rounded-full px-7 py-3.5 text-white font-bold text-sm shadow-teal hover:shadow-lg transition-all animate-pulse-ring"
              >
                <Calendar className="w-4.5 h-4.5" /> {L.bookBtn}
              </button>
              <a
                href={`tel:+91${clinicSettings.phone1}`}
                className="flex items-center gap-2.5 border border-white/20 hover:border-white/40 rounded-full px-6 py-3.5 text-white/80 font-semibold text-sm transition-colors"
              >
                <Phone className="w-4 h-4" /> {L.callBtn}: {clinicSettings.phone1}
              </a>
            </div>

            <div className="flex gap-8 flex-wrap mt-10">
              {[["4.4★", "Google Rating"], ["52+", "Reviews"], ["Est. 2023", "Korba"]].map(([v, l]) => (
                <div key={l}>
                  <p className="font-display text-xl font-black text-teal-300">{v}</p>
                  <p className="text-[10px] text-white/40 tracking-wider font-semibold uppercase">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-float-y">
            <ChevronDown className="w-6 h-6 text-white/30" />
          </div>
        </section>

        {/* ── LIVE STATUS BAR ── */}
        <div className={`py-2.5 text-center text-xs font-bold tracking-wide ${openStatus.isOpen ? "bg-teal-600/20 text-teal-200 border-y border-teal-600/20" : "bg-red-500/10 text-red-300 border-y border-red-500/20"}`}>
          <span className="mr-2">{openStatus.isOpen ? "🟢" : "🔴"}</span>
          {openStatus.isOpen ? `${L.openNow} — ${L.closesAt} ${fmt12(openStatus.closeTime)}` : `${L.closedNow} — ${L.opensAt} ${fmt12(openStatus.openTime)}`}
        </div>

        {/* ── STATS ── */}
        <section className="py-16 px-[5%] border-b border-white/5">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
            <Counter target={52} suffix="+" label={L.rating} />
            <Counter target={4.4} suffix="★" label="Google" decimal />
            <Counter target={7} suffix="+" label={L.years} />
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 px-[5%]">
          <Reveal>
            <p className="text-center text-[11px] text-teal-500 tracking-[3px] uppercase font-bold mb-3">{lang === "en" ? "What We Offer" : "हमारी सेवाएं"}</p>
            <h2 className="text-center font-display text-[clamp(26px,4vw,46px)] font-black text-gradient-white mb-2">{L.servicesTitle}</h2>
            <p className="text-center text-white/40 text-sm mb-12">{L.servicesSubtitle}</p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {SERVICES.map((s, i) => (
              <ServiceCard key={s.name} service={s} delay={i * 80} lang={lang} L={L} onBook={() => scrollToBooking(s.name)} />
            ))}
          </div>
        </section>

        {/* ── BOOKING FORM ── */}
        <section id="booking" ref={bookingRef} className="py-20 px-[5%] relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-600/[0.03] to-transparent pointer-events-none" />
          <Reveal>
            <p className="text-center text-[11px] text-teal-500 tracking-[3px] uppercase font-bold mb-3">📅</p>
            <h2 className="text-center font-display text-[clamp(26px,4vw,46px)] font-black text-gradient-white mb-2">{L.formTitle}</h2>
            <p className="text-center text-white/40 text-sm mb-12">{L.formSubtitle}</p>
          </Reveal>
          <BookingForm
            lang={lang}
            L={L}
            preselectedService={selectedService}
            onServiceUsed={() => setSelectedService("")}
            addToast={addToast}
            clinicSettings={clinicSettings}
          />
        </section>

        {/* ── TRUST / REVIEWS ── */}
        <section className="py-20 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-600/[0.04] to-transparent pointer-events-none" />
          <Reveal>
            <p className="text-center text-[11px] text-teal-500 tracking-[3px] uppercase font-bold mb-3">{lang === "en" ? "What Patients Say" : "मरीज़ क्या कहते हैं"}</p>
            <h2 className="text-center font-display text-[clamp(24px,4vw,42px)] font-black text-gradient-white mb-10">{L.trustTitle}</h2>
          </Reveal>
          <div className="flex flex-col gap-4">
            <Marquee items={REVIEWS} />
            <Marquee items={[...REVIEWS].reverse()} reverse />
          </div>
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/25 rounded-full px-5 py-2.5">
              <Star className="w-5 h-5 text-gold-400 fill-gold-400" />
              <span className="font-extrabold text-gold-400">4.4 / 5</span>
              <span className="text-white/40 text-sm">· Google Reviews</span>
            </div>
          </div>
        </section>

        {/* ── CLINIC INFO / CONTACT ── */}
        <section id="contact" className="py-20 px-[5%]">
          <Reveal>
            <h2 className="text-center font-display text-[clamp(24px,4vw,42px)] font-black text-gradient-white mb-12">{L.findUs}</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
            <Reveal delay={0}>
              <GlassCard className="p-0 overflow-hidden h-full min-h-[300px]" hover={false}>
                <iframe
                  title="Kaveri Care Diagnostic Center Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3692.5!2d82.68!3d22.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDIxJzAwLjAiTiA4MsKwNDAnNDguMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  className="w-full h-full min-h-[300px] border-0 rounded-2xl"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </GlassCard>
            </Reveal>
            <Reveal delay={100}>
              <ClinicInfoCard settings={clinicSettings} L={L} lang={lang} openStatus={openStatus} addToast={addToast} />
            </Reveal>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/5 px-[5%] py-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="font-display font-black text-base">{clinicSettings.name}</p>
              <p className="text-xs text-white/40 mt-1">{L.heroTagline}</p>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-white/50 font-medium">
              <a href="#services" className="hover:text-white transition-colors">{L.servicesTitle.split(" ")[0]}</a>
              <a href="#booking" className="hover:text-white transition-colors">{L.bookBtn}</a>
              <a href="#contact" className="hover:text-white transition-colors">{L.findUs}</a>
              <button onClick={() => setPage("admin")} className="hover:text-white transition-colors">{L.admin}</button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => <span key={i} className="text-gold-400 text-sm">★</span>)}
              </div>
              <span className="text-white/40 text-xs">4.4 Google</span>
            </div>
          </div>
          <p className="text-center text-white/25 text-xs mt-6">{L.madeWith}</p>
        </footer>

        {/* ── FLOATING WHATSAPP ── */}
        <a
          href="https://wa.me/916267580898"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-[90] w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-2xl shadow-green animate-float-y-fast hover:scale-110 transition-transform"
        >
          💬
        </a>

        {/* ── FLOATING BOOK NOW PILL ── */}
        <button
          onClick={() => scrollToBooking()}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[89] md:hidden bg-gradient-to-br from-teal-600 to-teal-500 rounded-full px-6 py-3 text-white font-bold text-sm shadow-teal animate-pulse-ring flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" /> {L.bookBtn}
        </button>
      </div>
    );
  }

  // ─── ADMIN VIEW ───
  return (
    <AdminPanel
      addToast={addToast}
      toasts={toasts}
      removeToast={removeToast}
      onBack={() => setPage("website")}
      clinicSettings={clinicSettings}
    />
  );
}

/* ══════════════════════════════════════════
   SERVICE CARD
══════════════════════════════════════════ */
function ServiceCard({ service, delay, lang, L, onBook }) {
  const [showPrep, setShowPrep] = useState(false);
  return (
    <Reveal delay={delay}>
      <GlassCard className="overflow-hidden h-full">
        <div className={`bg-gradient-to-br ${service.color} p-6 relative min-h-[180px] flex flex-col justify-end`}>
          <div className="absolute top-4 right-4 text-3xl opacity-60">{service.icon}</div>
          <p className="font-bold text-base mb-1">{service.name}</p>
          <p className="text-xs text-white/55">{service.desc}</p>
        </div>
        <div className="p-4">
          <button
            onClick={() => setShowPrep(!showPrep)}
            className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 font-medium transition-colors mb-3"
          >
            <Info className="w-3.5 h-3.5" />
            {L.prepTips}
            {showPrep ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showPrep && (
            <p className="text-xs text-white/50 bg-white/5 rounded-lg p-3 mb-3 leading-relaxed animate-fade-in">{service.prep}</p>
          )}
          <button
            onClick={onBook}
            className="w-full py-2.5 rounded-xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-600/30 text-teal-200 text-xs font-bold transition-all"
          >
            {L.bookTest} →
          </button>
        </div>
      </GlassCard>
    </Reveal>
  );
}

/* ══════════════════════════════════════════
   CLINIC INFO CARD
══════════════════════════════════════════ */
function ClinicInfoCard({ settings, L, lang, openStatus, addToast }) {
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(settings.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast("Could not copy", "error");
    }
  };

  return (
    <GlassCard className="p-7 h-full flex flex-col" hover={false}>
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-5 h-5 text-teal-400" />
        <h3 className="font-display font-black text-lg">{L.findUs}</h3>
      </div>

      <p className="text-white/55 text-sm leading-relaxed mb-3">{settings.address}</p>
      <div className="flex gap-2 mb-6">
        <button onClick={copyAddress} className="flex items-center gap-1.5 text-xs text-teal-300 font-bold hover:text-teal-200 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? L.copied : L.copyAddr}
        </button>
        <a href="https://maps.google.com/?q=Kaveri+Care+Diagnostic+Center+Korba" target="_blank" rel="noopener noreferrer" className="text-xs text-teal-300 font-bold hover:text-teal-200 transition-colors">
          {L.getDir} →
        </a>
      </div>

      <div className="space-y-2 mb-6">
        {[settings.phone1, settings.phone2].filter(Boolean).map(ph => (
          <a key={ph} href={`tel:+91${ph}`} className="flex items-center gap-2 text-white/70 text-sm font-semibold hover:text-white transition-colors">
            <Phone className="w-4 h-4 text-teal-400" /> {ph}
          </a>
        ))}
      </div>

      <div className="mt-auto">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-teal-400" />
          <h4 className="font-bold text-sm">{L.hours}</h4>
        </div>
        {(() => {
          const wk = settings.hours?.weekday || DEFAULT_SETTINGS.hours.weekday;
          const su = settings.hours?.sunday || DEFAULT_SETTINGS.hours.sunday;
          const fmtSession = (s) => {
            let line = `${fmt12(s.open)} – ${fmt12(s.close)}`;
            if (s.open2 && s.close2) line += `, ${fmt12(s.open2)} – ${fmt12(s.close2)}`;
            return line;
          };
          return [
            [L.weekday, fmtSession(wk)],
            [L.sunday, fmtSession(su)],
          ].map(([day, time]) => (
            <div key={day} className="flex justify-between py-1.5 border-b border-white/5 text-sm gap-2">
              <span className="text-white/50 shrink-0">{day}</span>
              <span className="font-semibold text-teal-200 text-right text-xs leading-relaxed">{time}</span>
            </div>
          ));
        })()}

        <div className={`inline-flex items-center gap-2 mt-4 rounded-full px-3 py-1.5 border text-xs font-bold ${openStatus.isOpen ? "bg-teal-500/20 border-teal-500/50 text-teal-200" : "bg-red-500/20 border-red-500/40 text-red-300"}`}>
          <div className={`w-2 h-2 rounded-full animate-live-pulse ${openStatus.isOpen ? "bg-teal-400" : "bg-red-400"}`} />
          {openStatus.isOpen ? L.openNow : L.closedNow}
        </div>
      </div>
    </GlassCard>
  );
}

/* ══════════════════════════════════════════
   BOOKING FORM
══════════════════════════════════════════ */
function BookingForm({ lang, L, preselectedService, onServiceUsed, addToast }) {
  const [form, setForm] = useState({ name: "", phone: "", service: "", date: "", time: "" });
  const [errors, setErrors] = useState({});
  const [slots, setSlots] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Apply preselected service
  useEffect(() => {
    if (preselectedService) {
      setForm(f => ({ ...f, service: preselectedService }));
      onServiceUsed();
    }
  }, [preselectedService, onServiceUsed]);

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: "" }));
  };

  // Fetch slots when date changes
  useEffect(() => {
    if (!form.date) { setSlots(null); return; }
    setLoadingSlots(true);
    setForm(f => ({ ...f, time: "" }));

    const loadSlots = async () => {
      try {
        if (!supabaseReady) throw new Error("Supabase not configured");
        const { data, error } = await supabase.from("slots").select("slot_data").eq("date", form.date).single();
        if (error && error.code !== "PGRST116") throw error;
        if (data?.slot_data) {
          setSlots(data.slot_data);
        } else {
          const defaults = {};
          ALL_SLOTS.forEach(time => { defaults[time] = { max: 3, booked: 0, blocked: false }; });
          setSlots(defaults);
        }
      } catch {
        const defaults = {};
        ALL_SLOTS.forEach(time => { defaults[time] = { max: 3, booked: 0, blocked: false }; });
        setSlots(defaults);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [form.date]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = lang === "en" ? "Name is required" : "नाम आवश्यक है";
    if (!/^\d{10}$/.test(form.phone)) e.phone = lang === "en" ? "Enter valid 10-digit number" : "10 अंकों का नंबर दें";
    if (!form.service) e.service = lang === "en" ? "Select a service" : "सेवा चुनें";
    if (!form.date) e.date = lang === "en" ? "Select a date" : "तिथि चुनें";
    if (!form.time) e.time = lang === "en" ? "Select a time slot" : "समय चुनें";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    let dbSuccess = false;
    try {
      if (!supabaseReady) throw new Error("Supabase not configured");

      // Write booking row
      const { error: bookErr } = await supabase.from("bookings").insert({
        name: form.name,
        phone: form.phone,
        service: form.service,
        date: form.date,
        time: form.time,
        status: "pending",
      });
      if (bookErr) throw bookErr;

      // Increment booked count in the slot row
      const { data: slotRow } = await supabase.from("slots").select("slot_data").eq("date", form.date).single();
      if (slotRow?.slot_data) {
        const updated = { ...slotRow.slot_data };
        updated[form.time] = { ...updated[form.time], booked: (updated[form.time]?.booked || 0) + 1 };
        await supabase.from("slots").update({ slot_data: updated }).eq("date", form.date);
      } else {
        const defaults = {};
        ALL_SLOTS.forEach(time => { defaults[time] = { max: 3, booked: 0, blocked: false }; });
        defaults[form.time].booked = 1;
        await supabase.from("slots").upsert({ date: form.date, slot_data: defaults });
      }

      dbSuccess = true;
    } catch (err) {
      console.error("Booking Supabase error:", err);
    }

    setSubmitting(false);
    setSubmitted(true);

    if (dbSuccess) {
      addToast(lang === "en" ? "Booking saved! Opening WhatsApp..." : "बुकिंग सेव हुई! WhatsApp खुल रहा...", "success");
    } else {
      addToast(lang === "en" ? "WhatsApp opened — we'll confirm your slot shortly" : "WhatsApp खुला — हम जल्द पुष्टि करेंगे", "info");
    }

    // Open WhatsApp regardless of DB success
    setTimeout(() => {
      const msg = encodeURIComponent(
        `Hello Kaveri Care, I would like to book an appointment.\nName: ${form.name}\nService: ${form.service}\nDate: ${form.date}\nTime: ${form.time}\nPhone: ${form.phone}`
      );
      window.open(`https://wa.me/916267580898?text=${msg}`, "_blank");
    }, 800);

    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", phone: "", service: "", date: "", time: "" });
      setSlots(null);
    }, 4000);
  };

  const minDate = todayStr();

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="text-6xl animate-bounce-in mb-4">✅</div>
        <h3 className="font-display text-2xl font-black text-gradient-white mb-2">
          {lang === "en" ? "Booking Confirmed!" : "बुकिंग पक्की!"}
        </h3>
        <p className="text-white/50 text-sm">{lang === "en" ? "We're opening WhatsApp to confirm your slot." : "हम WhatsApp खोल रहे हैं।"}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
      <GlassCard className="p-6 md:p-8" hover={false}>
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">{L.name}</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text" value={form.name} onChange={e => updateField("name", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
                placeholder={lang === "en" ? "Enter your name" : "अपना नाम दें"}
              />
            </div>
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">{L.phone}</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="tel" value={form.phone} onChange={e => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Service */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">{L.service}</label>
            <select
              value={form.service} onChange={e => updateField("service", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors appearance-none"
            >
              <option value="" className="bg-dark">{L.service}</option>
              {SERVICES.map(s => <option key={s.name} value={s.name} className="bg-dark">{s.icon} {s.name}</option>)}
            </select>
            {errors.service && <p className="text-red-400 text-xs mt-1">{errors.service}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-white/60 mb-1.5">{L.date}</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="date" value={form.date} min={minDate} onChange={e => updateField("date", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
              />
            </div>
            {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
          </div>

          {/* Time Slots */}
          {form.date && (
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-2">{L.time}</label>
              {loadingSlots ? (
                <div className="flex items-center gap-2 text-white/40 text-sm py-4 justify-center">
                  <Loader2 className="w-4 h-4 animate-spin" /> {L.checkingSlots}
                </div>
              ) : slots ? (
                <div className="grid grid-cols-4 gap-2">
                  {ALL_SLOTS.map(time => {
                    const slot = slots[time] || { max: 3, booked: 0, blocked: false };
                    const isFull = slot.booked >= slot.max;
                    const isBlocked = slot.blocked;
                    const isAvailable = !isFull && !isBlocked;
                    const isSelected = form.time === time;

                    return (
                      <button
                        key={time} type="button"
                        disabled={!isAvailable}
                        onClick={() => isAvailable && updateField("time", time)}
                        className={`py-2 px-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-teal-600 text-white ring-2 ring-teal-400 shadow-teal"
                            : isAvailable
                              ? "bg-white/5 border border-white/10 text-white/70 hover:bg-teal-600/30 hover:border-teal-500/30 hover:text-teal-200"
                              : "bg-white/[0.02] border border-white/5 text-white/25 cursor-not-allowed"
                        }`}
                      >
                        {fmt12(time).replace(" ", "\n").split("\n")[0]}
                        <span className="block text-[9px] font-medium opacity-70">
                          {fmt12(time).split(" ")[1]}
                        </span>
                        {isFull && !isBlocked && <span className="block text-[8px] text-red-400">{L.full}</span>}
                        {isBlocked && <span className="block text-[8px] text-white/30">{L.na}</span>}
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {errors.time && <p className="text-red-400 text-xs mt-1">{errors.time}</p>}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 text-white font-bold text-sm shadow-teal hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {L.saving}</>
            ) : (
              <><Calendar className="w-4 h-4" /> {L.submit}</>
            )}
          </button>
        </div>
      </GlassCard>
    </form>
  );
}

/* ══════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════ */
function AdminPanel({ addToast, toasts, removeToast, onBack, clinicSettings }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [shaking, setShaking] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "kaveri2024") {
      setAuthenticated(true);
    } else {
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  if (!authenticated) {
    return (
      <div className="bg-dark min-h-screen font-body text-white flex items-center justify-center px-4">
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <div className={`w-full max-w-sm ${shaking ? "animate-shake" : ""}`}>
          <GlassCard className="p-8" hover={false}>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-teal">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-display text-xl font-black">Admin Panel</h2>
              <p className="text-white/40 text-xs mt-1">{clinicSettings.name}</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors"
                  autoFocus
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-br from-teal-600 to-teal-500 text-white font-bold text-sm shadow-teal hover:shadow-lg transition-all">
                Login
              </button>
            </form>
            <button onClick={onBack} className="w-full mt-4 text-white/40 text-xs hover:text-white/70 transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to website
            </button>
          </GlassCard>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "slots", label: "Slot Manager", icon: Calendar },
    { id: "appointments", label: "Appointments", icon: ClipboardList },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="bg-dark min-h-screen font-body text-white">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Admin Header */}
      <div className="border-b border-white/[0.06] bg-dark/80 backdrop-blur-xl sticky top-0 z-50 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-600 to-teal-500 rounded-lg flex items-center justify-center text-sm shadow-teal">🏥</div>
          <div>
            <p className="font-display font-black text-sm leading-none">Admin Panel</p>
            <p className="text-[9px] text-white/40 font-semibold">{clinicSettings.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!supabaseReady && (
            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full px-2 py-0.5 font-bold">Supabase not configured</span>
          )}
          <button onClick={onBack} className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Website
          </button>
          <button onClick={() => setAuthenticated(false)} className="text-xs text-white/50 hover:text-red-300 flex items-center gap-1 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/[0.06] px-4 md:px-6 flex gap-1 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id ? "border-teal-500 text-teal-300" : "border-transparent text-white/40 hover:text-white/70"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="p-4 md:p-6 max-w-6xl mx-auto animate-fade-in">
        {activeTab === "overview" && <OverviewTab addToast={addToast} />}
        {activeTab === "slots" && <SlotManagerTab addToast={addToast} />}
        {activeTab === "appointments" && <AppointmentsTab addToast={addToast} />}
        {activeTab === "settings" && <SettingsTab addToast={addToast} currentSettings={clinicSettings} />}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN: OVERVIEW TAB
══════════════════════════════════════════ */
function OverviewTab({ addToast }) {
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);
  const [topService, setTopService] = useState("—");
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return; }

    const today = todayStr();
    const monthStart = today.slice(0, 7) + "-01";

    const fetchData = async () => {
      const { data: todayData } = await supabase.from("bookings").select("id", { count: "exact" }).eq("date", today);
      setTodayCount(todayData?.length || 0);

      const { data: all } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      const rows = all || [];
      setMonthCount(rows.filter(b => b.date >= monthStart).length);

      const serviceCounts = {};
      rows.forEach(b => { serviceCounts[b.service] = (serviceCounts[b.service] || 0) + 1; });
      const top = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0];
      setTopService(top ? top[0] : "—");

      setRecent(rows.slice(0, 5));
      setLoading(false);
    };
    fetchData();

    // Realtime subscription for bookings changes
    const channel = supabase.channel("overview-bookings").on(
      "postgres_changes", { event: "*", schema: "public", table: "bookings" },
      () => { fetchData(); }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Appointments", value: todayCount, icon: Calendar, color: "from-teal-600/30 to-teal-800/20" },
          { label: "This Month Total", value: monthCount, icon: BarChart3, color: "from-blue-600/30 to-blue-800/20" },
          { label: "Top Service", value: topService, icon: Star, color: "from-gold-500/30 to-gold-600/20", small: true },
        ].map(card => {
          const Icon = card.icon;
          return (
            <GlassCard key={card.label} className={`p-5 bg-gradient-to-br ${card.color}`} hover={false}>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-white/50" />
                <p className="text-xs text-white/50 font-semibold">{card.label}</p>
              </div>
              <p className={`font-display font-black ${card.small ? "text-lg truncate" : "text-3xl"}`}>{card.value}</p>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="overflow-hidden" hover={false}>
        <div className="p-4 border-b border-white/[0.06]">
          <h3 className="font-bold text-sm">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Name", "Service", "Date", "Time", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30 text-xs">No bookings yet</td></tr>
              ) : (
                recent.map(b => {
                  const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
                  return (
                    <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium">{b.name}</td>
                      <td className="px-4 py-3 text-white/60">{b.service}</td>
                      <td className="px-4 py-3 text-white/60">{b.date}</td>
                      <td className="px-4 py-3 text-white/60">{b.time}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${st.bg} ${st.text} border ${st.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN: SLOT MANAGER TAB
══════════════════════════════════════════ */
function SlotManagerTab({ addToast }) {
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSlots = useCallback(async (d) => {
    setLoading(true);
    try {
      if (!supabaseReady) throw new Error("Supabase not configured");
      const { data, error } = await supabase.from("slots").select("slot_data").eq("date", d).single();
      if (error && error.code !== "PGRST116") throw error;
      if (data?.slot_data) {
        setSlots(data.slot_data);
      } else {
        const defaults = {};
        ALL_SLOTS.forEach(time => { defaults[time] = { max: 3, booked: 0, blocked: false }; });
        setSlots(defaults);
      }
    } catch {
      const defaults = {};
      ALL_SLOTS.forEach(time => { defaults[time] = { max: 3, booked: 0, blocked: false }; });
      setSlots(defaults);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (date) loadSlots(date); }, [date, loadSlots]);

  const toggleBlock = (time) => {
    setSlots(prev => ({ ...prev, [time]: { ...prev[time], blocked: !prev[time].blocked } }));
  };

  const changeMax = (time, delta) => {
    setSlots(prev => ({
      ...prev,
      [time]: { ...prev[time], max: Math.max(1, Math.min(10, prev[time].max + delta)) }
    }));
  };

  const blockAll = () => {
    setSlots(prev => {
      const next = { ...prev };
      ALL_SLOTS.forEach(time => { next[time] = { ...next[time], blocked: true }; });
      return next;
    });
  };

  const unblockAll = () => {
    setSlots(prev => {
      const next = { ...prev };
      ALL_SLOTS.forEach(time => { next[time] = { ...next[time], blocked: false }; });
      return next;
    });
  };

  const saveSlots = async () => {
    setSaving(true);
    try {
      if (!supabaseReady) throw new Error("Supabase not configured");
      const { error } = await supabase.from("slots").upsert({ date, slot_data: slots });
      if (error) throw error;
      addToast("Slots saved!", "success");
    } catch (err) {
      addToast("Failed to save — " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const allBlocked = slots && ALL_SLOTS.every(time => slots[time]?.blocked);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-xs font-semibold text-white/50 mb-1">Date</label>
          <input
            type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={allBlocked ? unblockAll : blockAll} className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-colors ${allBlocked ? "bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30" : "bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"}`}>
            <Ban className="w-3.5 h-3.5 inline mr-1" /> {allBlocked ? "Unblock All" : "Block Entire Day"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
        </div>
      ) : slots ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_SLOTS.map(time => {
              const slot = slots[time];
              return (
                <GlassCard key={time} className={`p-4 ${slot.blocked ? "opacity-50" : ""}`} hover={false}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-sm">{fmt12(time)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${slot.blocked ? "bg-red-500/20 text-red-300" : "bg-teal-500/20 text-teal-300"}`}>
                      {slot.blocked ? "Blocked" : `${slot.booked}/${slot.max}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-white/40">Max:</span>
                      <button onClick={() => changeMax(time, -1)} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-5 text-center">{slot.max}</span>
                      <button onClick={() => changeMax(time, 1)} className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => toggleBlock(time)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${slot.blocked ? "bg-red-600/20 border-red-500/30 text-red-300" : "bg-white/5 border-white/10 text-white/50 hover:text-white/80"}`}
                    >
                      {slot.blocked ? "Blocked" : "Active"}
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <button
            onClick={saveSlots}
            disabled={saving}
            className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl px-6 py-3 text-white font-bold text-sm shadow-teal hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Slots"}
          </button>
        </>
      ) : null}
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN: APPOINTMENTS TAB
══════════════════════════════════════════ */
function AppointmentsTab({ addToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    if (!supabaseReady) { setLoading(false); return; }

    const fetchBookings = async () => {
      const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      setBookings(data || []);
      setLoading(false);
    };
    fetchBookings();

    const channel = supabase.channel("appointments-bookings").on(
      "postgres_changes", { event: "*", schema: "public", table: "bookings" },
      () => { fetchBookings(); }
    ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const cycleStatus = async (booking) => {
    try {
      if (!supabaseReady) throw new Error("Supabase not configured");
      const next = NEXT_STATUS[booking.status] || "pending";
      const { error } = await supabase.from("bookings").update({ status: next }).eq("id", booking.id);
      if (error) throw error;
    } catch (err) {
      addToast("Failed to update — " + err.message, "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!supabaseReady) throw new Error("Supabase not configured");
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
      addToast("Booking deleted", "success");
      setConfirmDelete(null);
    } catch (err) {
      addToast("Failed to delete — " + err.message, "error");
    }
  };

  const openWhatsApp = (b) => {
    const msg = encodeURIComponent(
      `Regarding your appointment:\nName: ${b.name}\nService: ${b.service}\nDate: ${b.date}\nTime: ${b.time}\nStatus: ${b.status}`
    );
    window.open(`https://wa.me/91${b.phone}?text=${msg}`, "_blank");
  };

  const filtered = bookings.filter(b => {
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (filterDate && b.date !== filterDate) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      if (!b.name?.toLowerCase().includes(s) && !b.phone?.includes(s)) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-1">Status</label>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/50 transition-colors"
          >
            <option value="all" className="bg-dark">All</option>
            {Object.keys(STATUS_MAP).map(s => <option key={s} value={s} className="bg-dark">{STATUS_MAP[s].label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/40 mb-1">Date</label>
          <input
            type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500/50 transition-colors"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-semibold text-white/40 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Name or phone..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-colors"
            />
          </div>
        </div>
        {(filterStatus !== "all" || filterDate || searchTerm) && (
          <button onClick={() => { setFilterStatus("all"); setFilterDate(""); setSearchTerm(""); }} className="text-xs text-white/40 hover:text-white/70 underline pb-2">
            Clear
          </button>
        )}
      </div>

      <GlassCard className="overflow-hidden" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Name", "Phone", "Service", "Date", "Time", "Status", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-white/40 font-semibold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30 text-xs">No bookings found</td></tr>
              ) : (
                filtered.map(b => {
                  const st = STATUS_MAP[b.status] || STATUS_MAP.pending;
                  return (
                    <tr key={b.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium whitespace-nowrap">{b.name}</td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{b.phone}</td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{b.service}</td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{b.date}</td>
                      <td className="px-4 py-3 text-white/60 whitespace-nowrap">{b.time}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => cycleStatus(b)}
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${st.bg} ${st.text} border ${st.border} hover:opacity-80`}
                          title="Click to change status"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} /> {st.label}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => openWhatsApp(b)} className="p-1.5 rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-300 transition-colors" title="WhatsApp">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          {confirmDelete === b.id ? (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg bg-red-600/30 text-red-300 text-[10px] font-bold">Yes</button>
                              <button onClick={() => setConfirmDelete(null)} className="p-1.5 rounded-lg bg-white/5 text-white/50 text-[10px] font-bold">No</button>
                            </div>
                          ) : (
                            <button onClick={() => setConfirmDelete(b.id)} className="p-1.5 rounded-lg bg-red-600/10 hover:bg-red-600/20 text-red-400 transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
      <p className="text-xs text-white/30">{filtered.length} booking{filtered.length !== 1 ? "s" : ""} shown</p>
    </div>
  );
}

/* ══════════════════════════════════════════
   ADMIN: SETTINGS TAB
══════════════════════════════════════════ */
function SettingsTab({ addToast, currentSettings }) {
  const [settings, setSettings] = useState(currentSettings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const update = (path, value) => {
    setSettings(prev => {
      const next = { ...prev };
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      if (!supabaseReady) throw new Error("Supabase not configured");
      const { error } = await supabase.from("settings").upsert({ key: "clinic", value: settings });
      if (error) throw error;
      addToast("Settings saved! Changes are live.", "success");
    } catch (err) {
      addToast("Failed to save — " + err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/30 transition-colors";

  return (
    <div className="max-w-2xl space-y-6">
      <GlassCard className="p-6" hover={false}>
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Settings className="w-4 h-4 text-teal-400" /> Clinic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1">Clinic Name</label>
            <input value={settings.name} onChange={e => update("name", e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Phone 1</label>
              <input value={settings.phone1} onChange={e => update("phone1", e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/50 mb-1">Phone 2</label>
              <input value={settings.phone2 || ""} onChange={e => update("phone2", e.target.value)} className={inputCls} placeholder="Optional" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/50 mb-1">Address</label>
            <textarea value={settings.address} onChange={e => update("address", e.target.value)} rows={2} className={inputCls + " resize-none"} />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6" hover={false}>
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-teal-400" /> Operating Hours</h3>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-white/50 mb-2">Weekday — Session 1 (Morning)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Open</label>
                <input type="time" value={settings.hours?.weekday?.open || "10:00"} onChange={e => update("hours.weekday.open", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Close</label>
                <input type="time" value={settings.hours?.weekday?.close || "15:00"} onChange={e => update("hours.weekday.close", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 mb-2">Weekday — Session 2 (Evening)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Open</label>
                <input type="time" value={settings.hours?.weekday?.open2 || "17:30"} onChange={e => update("hours.weekday.open2", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Close</label>
                <input type="time" value={settings.hours?.weekday?.close2 || "19:00"} onChange={e => update("hours.weekday.close2", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 mb-2">Sunday — Session 1 (Morning)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Open</label>
                <input type="time" value={settings.hours?.sunday?.open || "10:00"} onChange={e => update("hours.sunday.open", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Close</label>
                <input type="time" value={settings.hours?.sunday?.close || "15:00"} onChange={e => update("hours.sunday.close", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-white/50 mb-2">Sunday — Session 2 (Evening)</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Open</label>
                <input type="time" value={settings.hours?.sunday?.open2 || "17:30"} onChange={e => update("hours.sunday.open2", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-[10px] text-white/40 mb-1">Close</label>
                <input type="time" value={settings.hours?.sunday?.close2 || "19:00"} onChange={e => update("hours.sunday.close2", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="bg-gradient-to-br from-teal-600 to-teal-500 rounded-xl px-6 py-3 text-white font-bold text-sm shadow-teal hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
