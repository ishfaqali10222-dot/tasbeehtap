import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Moon,
  RotateCcw,
  Save,
  Volume2,
  VolumeX,
  Smartphone,
  Target,
  Sparkles,
  CalendarDays,
  Flame,
  Trophy,
  BookOpen,
  Star,
  CheckCircle2,
} from "lucide-react";

const AZKAR = [
  "SubhanAllah",
  "Alhamdulillah",
  "Allahu Akbar",
  "Astaghfirullah",
  "La ilaha illallah",
  "Durood Shareef",
];

const GOALS = [33, 100, 500, 1000];

const REMINDERS = [
  "Keep your tongue moist with the remembrance of Allah.",
  "Small daily zikr becomes a huge treasure over time.",
  "Consistency in worship is more beloved than occasional intensity.",
  "A few sincere words of remembrance can calm the heart.",
  "Turn spare moments into moments of reward.",
];

const MODES = [
  {
    title: "After Salah Mode",
    subtitle: "33 SubhanAllah, 33 Alhamdulillah, 34 Allahu Akbar",
    action: { zikr: "SubhanAllah", goal: 33 },
    icon: CheckCircle2,
  },
  {
    title: "Jumma Durood Mode",
    subtitle: "Set a special Durood target for Friday",
    action: { zikr: "Durood Shareef", goal: 500 },
    icon: Sparkles,
  },
  {
    title: "Ramadan Zikr Mode",
    subtitle: "Build your daily Ramadan remembrance habit",
    action: { zikr: "Astaghfirullah", goal: 1000 },
    icon: CalendarDays,
  },
  {
    title: "99 Names Mode",
    subtitle: "Use this as a mindful remembrance tracker",
    action: { zikr: "La ilaha illallah", goal: 99 },
    icon: Star,
  },
];

const STORAGE_KEYS = {
  count: "tasbeehtap_count",
  zikr: "tasbeehtap_zikr",
  goal: "tasbeehtap_goal",
  history: "tasbeehtap_history",
  today: "tasbeehtap_today_total",
  best: "tasbeehtap_best_day",
  streak: "tasbeehtap_streak",
  lastDate: "tasbeehtap_last_date",
  sound: "tasbeehtap_sound",
  vibrate: "tasbeehtap_vibrate",
};

function readLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal(key, value) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function formatDateTime(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString();
}

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ProgressRing({ progress }) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative h-44 w-44">
      <svg className="h-44 w-44 -rotate-90" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="url(#grad)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
            Progress
          </div>
          <div className="text-3xl font-bold">
            {Math.min(progress, 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
      <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-white/5 p-2">
        <Icon className="h-4 w-4 text-emerald-200" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-white/55">{label}</div>
    </div>
  );
}

export default function Home() {
  const [selectedZikr, setSelectedZikr] = useState("SubhanAllah");
  const [count, setCount] = useState(0);
  const [goal, setGoal] = useState(33);
  const [history, setHistory] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [bestDay, setBestDay] = useState(0);
  const [streak, setStreak] = useState(1);
  const [soundOn, setSoundOn] = useState(false);
  const [vibrateOn, setVibrateOn] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedCount = readLocal(STORAGE_KEYS.count, 0);
    const savedZikr = readLocal(STORAGE_KEYS.zikr, "SubhanAllah");
    const savedGoal = readLocal(STORAGE_KEYS.goal, 33);
    const savedHistory = readLocal(STORAGE_KEYS.history, []);
    const savedToday = readLocal(STORAGE_KEYS.today, 0);
    const savedBest = readLocal(STORAGE_KEYS.best, 0);
    const savedStreak = readLocal(STORAGE_KEYS.streak, 1);
    const savedSound = readLocal(STORAGE_KEYS.sound, false);
    const savedVibrate = readLocal(STORAGE_KEYS.vibrate, true);
    const lastDate = readLocal(STORAGE_KEYS.lastDate, getTodayString());
    const today = getTodayString();

    let updatedToday = savedToday;
    let updatedStreak = savedStreak;

    if (lastDate !== today) {
      const last = new Date(lastDate);
      const now = new Date(today);
      const diff = Math.round((now - last) / (1000 * 60 * 60 * 24));
      updatedToday = 0;
      if (diff === 1) updatedStreak = Math.max(1, savedStreak + 1);
      else if (diff > 1) updatedStreak = 1;
      writeLocal(STORAGE_KEYS.today, 0);
      writeLocal(STORAGE_KEYS.streak, updatedStreak);
      writeLocal(STORAGE_KEYS.lastDate, today);
    }

    setCount(savedCount);
    setSelectedZikr(savedZikr);
    setGoal(savedGoal);
    setHistory(savedHistory);
    setTodayTotal(updatedToday);
    setBestDay(savedBest);
    setStreak(updatedStreak);
    setSoundOn(savedSound);
    setVibrateOn(savedVibrate);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    writeLocal(STORAGE_KEYS.count, count);
    writeLocal(STORAGE_KEYS.zikr, selectedZikr);
    writeLocal(STORAGE_KEYS.goal, goal);
    writeLocal(STORAGE_KEYS.history, history);
    writeLocal(STORAGE_KEYS.today, todayTotal);
    writeLocal(STORAGE_KEYS.best, bestDay);
    writeLocal(STORAGE_KEYS.streak, streak);
    writeLocal(STORAGE_KEYS.sound, soundOn);
    writeLocal(STORAGE_KEYS.vibrate, vibrateOn);
    writeLocal(STORAGE_KEYS.lastDate, getTodayString());
  }, [
    count,
    selectedZikr,
    goal,
    history,
    todayTotal,
    bestDay,
    streak,
    soundOn,
    vibrateOn,
    mounted,
  ]);

  const progress = useMemo(
    () => (goal > 0 ? (count / goal) * 100 : 0),
    [count, goal]
  );

  const reminder = useMemo(
    () => REMINDERS[new Date().getDate() % REMINDERS.length],
    []
  );

  const playTapSound = () => {
    if (!soundOn || typeof window === "undefined") return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    gain.gain.value = 0.03;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const handleTap = () => {
    const newCount = count + 1;
    const newToday = todayTotal + 1;
    setCount(newCount);
    setTodayTotal(newToday);
    if (newToday > bestDay) setBestDay(newToday);
    if (vibrateOn && typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(20);
    }
    playTapSound();
    if (goal > 0 && newCount === goal) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2200);
    }
  };

  const handleReset = () => setCount(0);

  const handleSave = () => {
    if (count === 0) return;
    const entry = {
      id: Date.now(),
      zikr: selectedZikr,
      count,
      date: new Date().toISOString(),
    };
    setHistory([entry, ...history].slice(0, 20));
    setCount(0);
  };

  const applyMode = (mode) => {
    setSelectedZikr(mode.zikr);
    setGoal(mode.goal);
    setCount(0);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_25%),linear-gradient(180deg,_#052e16_0%,_#02110a_45%,_#000000_100%)] text-white">
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-x-4 top-5 z-50 rounded-3xl border border-emerald-400/30 bg-emerald-500/15 px-5 py-4 text-center shadow-2xl backdrop-blur-xl"
          >
            <div className="text-lg font-bold text-emerald-200">
              MashaAllah! Goal Complete ✨
            </div>
            <div className="text-sm text-emerald-100/80">
              May your zikr bring peace and reward.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
              <Moon className="h-4 w-4" /> Islamic Utility
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              TasbeehTap
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-emerald-50/75 sm:text-base">
              Free online digital tasbeeh counter for daily zikr, goals,
              history, and mindful consistency.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              {soundOn ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
              {soundOn ? "Sound On" : "Sound Off"}
            </button>

            <button
              onClick={() => setVibrateOn(!vibrateOn)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition hover:bg-white/10"
            >
              <Smartphone className="h-4 w-4" />
              {vibrateOn ? "Vibration On" : "Vibration Off"}
            </button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                  Active Zikr
                </div>
                <h2 className="mt-2 text-2xl font-bold">{selectedZikr}</h2>
              </div>

              <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-right">
                <div className="text-xs uppercase tracking-[0.25em] text-amber-200/70">
                  Target Goal
                </div>
                <div className="text-xl font-bold">{goal}</div>
              </div>
            </div>

            <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex justify-center">
                <ProgressRing progress={progress} />
              </div>

              <div className="space-y-5">
                <div className="rounded-3xl border border-emerald-400/20 bg-emerald-500/10 p-6 text-center shadow-inner shadow-emerald-500/5">
                  <div className="text-xs uppercase tracking-[0.3em] text-emerald-100/70">
                    Current Count
                  </div>
                  <motion.div
                    key={count}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-4 text-6xl font-extrabold tracking-tight"
                  >
                    {count}
                  </motion.div>
                </div>

                <button
                  onClick={handleTap}
                  className="w-full rounded-full border border-emerald-300/20 bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-700 px-6 py-6 text-2xl font-bold shadow-2xl shadow-emerald-900/40 transition hover:scale-[1.01] active:scale-95"
                >
                  Tap to Count
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 font-semibold transition hover:bg-white/10"
                  >
                    <RotateCcw className="h-4 w-4" /> Reset
                  </button>

                  <button
                    onClick={handleSave}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-4 font-semibold transition hover:bg-amber-400/15"
                  >
                    <Save className="h-4 w-4" /> Save Session
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-100/85">
                <Target className="h-4 w-4" /> Set Goal
              </div>
              <div className="flex flex-wrap gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      goal === g
                        ? "bg-emerald-500 text-white shadow-lg"
                        : "border border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {g}
                  </button>
                ))}

                <input
                  type="number"
                  min="1"
                  value={goal}
                  onChange={(e) => setGoal(Number(e.target.value) || 1)}
                  className="w-28 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-0 placeholder:text-white/35"
                  placeholder="Custom"
                />
              </div>
            </div>
          </motion.div><div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-100/85">
                <BookOpen className="h-4 w-4" /> Popular Azkar
              </div>
              <div className="grid grid-cols-2 gap-3">
                {AZKAR.map((zikr) => (
                  <button
                    key={zikr}
                    onClick={() => setSelectedZikr(zikr)}
                    className={`rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                      selectedZikr === zikr
                        ? "bg-gradient-to-br from-emerald-500 to-green-700 text-white shadow-lg"
                        : "border border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {zikr}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-100/85">
                <Sparkles className="h-4 w-4" /> Today&apos;s Progress
              </div>
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Today Total"
                  value={todayTotal}
                  icon={CalendarDays}
                />
                <StatCard label="This Session" value={count} icon={Target} />
                <StatCard label="Best Day" value={bestDay} icon={Trophy} />
                <StatCard label="Streak" value={`${streak} d`} icon={Flame} />
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-100/85">
              <Moon className="h-4 w-4" /> Special Modes
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.title}
                    onClick={() => applyMode(mode.action)}
                    className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:bg-white/10"
                  >
                    <div className="mb-4 inline-flex rounded-2xl border border-emerald-300/20 bg-emerald-500/10 p-3">
                      <Icon className="h-5 w-5 text-emerald-200" />
                    </div>
                    <h3 className="text-lg font-bold">{mode.title}</h3>
                    <p className="mt-2 text-sm text-white/65">
                      {mode.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-emerald-100/85">
              <Sparkles className="h-4 w-4" /> Islamic Reminder
            </div>
            <div className="rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-400/10 to-emerald-500/10 p-6">
              <p className="text-lg leading-relaxed text-amber-50/95">
                “{reminder}”
              </p>
              <p className="mt-4 text-sm text-amber-100/65">
                A small daily reminder to keep your heart connected.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-emerald-100/85">
                Saved History
              </div>
              <p className="mt-1 text-sm text-white/55">
                Your latest tasbeeh sessions are stored on this device.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium transition hover:bg-white/10"
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-black/10 p-8 text-center text-white/55">
              No saved sessions yet. Start counting and save your first zikr
              session.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-black/15 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-lg font-bold">{item.zikr}</h4>
                      <p className="mt-1 text-sm text-white/55">
                        {formatDateTime(item.date)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-emerald-300/20 bg-emerald-500/10 px-4 py-2 text-xl font-bold text-emerald-100">
                      {item.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="<div>
  <div className="text-lg font-bold text-white">TasbeehTap</div>
  <p className="mt-2 max-w-xl">
    A simple, beautiful, distraction-free Islamic digital tasbeeh
    counter made for daily remembrance.
  </p>
  <p className="mt-3 text-sm text-white/60">
    Built with care for the Muslim Ummah
  </p>
  <p className="mt-1 text-sm text-white/60">
    Contact: ishfaqali10222@gmail.com
  </p>
  <p className="mt-1 text-sm text-white/50">
    © 2026 TasbeehTap. All rights reserved.
  </p>
</div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/about"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              About
            </Link>
            <Link
              to="/privacy-policy"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              Contact
            </Link>
            <Link
              to="/disclaimer"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              Disclaimer
            </Link>
            <Link
              to="/terms"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10"
            >
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
