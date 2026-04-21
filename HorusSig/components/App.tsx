'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  LayoutDashboard,
  Search,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronRight,
  User,
  LogOut,
  Target,
  BarChart3,
  Cpu,
  BrainCircuit,
  Terminal,
  FileText,
  Loader2,
  CheckCircle2,
  Download,
  Copy,
  Sparkles,
  Info,
  Hand,
  Zap,
  Lock,
  Globe,
  Tag,
  Github,
  Twitter,
  Mail,
  Slack,
  MessageSquare,
  HelpCircle,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/lib/api';
import {
  analyzeVulnerabilities,
  analyzeSecurityLogs,
  assessSecurityPosture,
  askAboutVulnerability,
  AIRiskAnalysis
} from '@/lib/aiService';

// --- Shared Components ---

const GuideSignal = ({ children, active = true, color = 'indigo' }: any) => {
  const colors: any = {
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    emerald: 'bg-emerald-500'
  };
  return (
    <div className="relative inline-block">
      {children}
      {active && (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0, 0.4, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`absolute inset-0 ${colors[color] || colors.indigo} rounded-full blur-md pointer-events-none -m-1 z-0`}
        />
      )}
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', icon: Icon, loading, className = '', disabled, guided }: any) => {
  const variants: any = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 text-scan-text shadow-lg shadow-indigo-900/20',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-scan-text border border-scan-border',
    outline: 'bg-transparent border border-scan-border hover:border-slate-500 text-scan-text-muted',
    ghost: 'bg-transparent hover:bg-slate-800 text-scan-text-muted',
    neon: 'bg-emerald-600 hover:bg-emerald-700 text-scan-text shadow-lg shadow-emerald-900/20',
    danger: 'bg-rose-600 hover:bg-rose-500 text-scan-text shadow-lg shadow-rose-900/20'
  };

  const button = (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-base ${variants[variant]} ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );

  if (guided) return <GuideSignal active={!disabled && !loading}>{button}</GuideSignal>;
  return button;
};

const Card = ({ children, title, subtitle, icon: Icon, className = '' }: any) => (
  <div className={`scan-card p-10 ${className}`}>
    {(title || Icon) && (
      <div className="flex items-center gap-4 mb-8">
        {Icon && <div className="p-3 bg-scan-surface/40 shadow-inner rounded-2xl text-indigo-400 shadow-inner"><Icon className="w-6 h-6" /></div>}
        <div>
          <h3 className="text-sm font-black text-scan-text-muted uppercase tracking-[0.2em]">{title}</h3>
          {subtitle && <p className="text-sm text-scan-text-muted mt-2">{subtitle}</p>}
        </div>
      </div>
    )}
    {children}
  </div>
);

const Badge = ({ variant, children }: any) => {
  const variants: any = {
    Critical: 'bg-rose-500/20 text-rose-400 border-rose-500/20',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/20',
    Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    Low: 'bg-slate-500/20 text-scan-text border-slate-500/20',
    Info: 'bg-indigo-500/10 text-indigo-400 border-scan-border',
    'In Progress': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    Completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
  };
  const activeVariant = variant || (typeof children === 'string' ? children : 'Info');
  return (
    <span className={`px-4 py-1.5 rounded-xl text-xs font-black border uppercase tracking-[0.15em] ${variants[activeVariant] || variants.Info}`}>
      {children}
    </span>
  );
};

// --- View Components ---

const Dashboard = ({ scans, logs, onSelectScan, onNewScan, isGuest, setView }: any) => {
  const totalVuls = scans.reduce((acc: number, s: any) => acc + (s.vulnerabilities?.length || 0), 0);
  const criticalVuls = scans.reduce((acc: number, s: any) => acc + (s.vulnerabilities?.filter((v: any) => v.severity === 'Critical').length || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="relative py-12 mb-12 border-b border-scan-border/40 group overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-600/10 transition-colors" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full border-2 border-scan-bg bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
                <div className="w-6 h-6 rounded-full border-2 border-scan-bg bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)] animate-pulse"></div>
              </div>
              <span className="text-[10px] font-black text-scan-text-muted uppercase tracking-[0.4em] italic ml-2">Digital Fortress Status: Active</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-scan-text tracking-tighter uppercase leading-[0.85] drop-shadow-lg">
              Stratégie <span className="text-indigo-500">Globale</span>
            </h1>
            <p className="text-scan-text-muted text-xl max-w-2xl font-medium border-l-2 border-indigo-600/30 pl-6 py-1">
              Surveillance proactive et flux en temps réel de votre posture de sécurité réseau.
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" icon={Terminal} onClick={() => setView('logs')} className="px-6 py-4 uppercase tracking-widest text-xs">Vérifier Logs</Button>
            <Button icon={Search} onClick={onNewScan} guided className="px-10 py-5 text-lg shadow-indigo-600/20">Initier Scan</Button>
          </div>
        </div>
      </header>

      {isGuest && (
        <div className="p-6 bg-indigo-600/10 border border-indigo-600/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-indigo-950/20">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-bold text-indigo-400 uppercase tracking-widest text-sm">Guest Mode Active</h3>
            <p className="text-xs text-scan-text-muted">Unlock advanced risk intelligence, automated logs, and priority remediation by creating an account.</p>
          </div>
          <Button variant="primary" className="whitespace-nowrap px-8" onClick={() => window.location.reload()}>Create Full Profile</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Scans', value: scans.length, icon: Target, color: 'text-indigo-400', gradient: 'from-indigo-600/5' },
          { label: 'Active Targets', value: new Set(scans.map((s: any) => s.target)).size, icon: Activity, color: 'text-emerald-400', gradient: 'from-emerald-600/5' },
          { label: 'Vulnerabilities', value: totalVuls, icon: AlertTriangle, color: 'text-orange-400', gradient: 'from-orange-600/5' },
          { label: 'Critical Risks', value: criticalVuls, icon: Shield, color: 'text-rose-500', gradient: 'from-rose-600/5' },
        ].map((stat, i) => (
          <Card key={i} className="hover:border-indigo-500/30 group relative">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.gradient} to-transparent rounded-bl-[100px] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
            <div className="flex items-center justify-between relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-scan-text-muted">{stat.label}</p>
                <p className={`text-5xl font-bold text-scan-text tracking-tighter`}>{stat.value}</p>
              </div>
              <div className={`p-4 rounded-2xl bg-scan-bg border border-scan-border shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6 ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-scan-border/40 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-scan-text-muted">Analyse en temps réel</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(j => <div key={j} className={`w-1 h-3 rounded-full bg-current ${stat.color} opacity-40 animate-pulse`} style={{ animationDelay: `${j * 0.2}s` }} />)}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card title="Security Feed" icon={Activity}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-scan-border text-scan-text-muted text-sm uppercase tracking-widest font-black py-6 px-8">
                    <th className="py-4 px-6">Source Target</th>
                    <th className="py-4 px-6">Findings</th>
                    <th className="py-4 px-6">Timestamp</th>
                    <th className="py-4 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {!Array.isArray(scans) || scans.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-scan-text-muted italic">No security data available.</td>
                    </tr>
                  ) : (
                    scans.map((scan: any) => (
                      <tr key={scan.id} className="border-b border-scan-border/50 hover:bg-slate-800/20 transition-colors group">
                        <td className="py-5 px-6">
                          <span className="font-mono text-xs text-scan-text-muted">{scan.target}</span>
                        </td>
                        <td className="py-5 px-6">
                          <Badge variant={scan.vulnerabilities?.length > 0 ? 'High' : 'Completed'}>
                            {scan.vulnerabilities?.length || 0} Findings
                          </Badge>
                        </td>
                        <td className="py-5 px-6 text-xs text-scan-text-muted font-mono italic">{new Date(scan.timestamp).toLocaleTimeString()}</td>
                        <td className="py-5 px-6 text-right">
                          <button
                            onClick={() => onSelectScan(scan.id)}
                            className="p-2 hover:bg-indigo-600 rounded-full text-scan-text-muted hover:text-scan-text transition-all"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card title="System Logs" icon={Terminal} subtitle={isGuest ? "Locked in Guest Mode" : "Real-time Access Monitoring"}>
            <div className={`space-y-4 ${isGuest ? 'filter blur-[4px] pointer-events-none grayscale opacity-30 select-none' : ''}`}>
              {Array.isArray(logs) && logs.map((log: any) => (
                <div key={log.id} className="p-4 bg-slate-900 border border-scan-border rounded-2xl space-y-2 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{log.type}</span>
                    <span className="text-[10px] text-scan-text-muted font-mono italic">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-scan-text font-mono break-all">{log.source} → {log.target}</p>
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Fix: {log.solution}
                  </p>
                </div>
              ))}
              {(!Array.isArray(logs) || logs.length === 0) && !isGuest && <p className="text-xs text-scan-text-muted text-center py-6 italic">No intrusive attempts detected.</p>}
            </div>
            {isGuest && (
              <div className="absolute inset-x-0 bottom-12 flex justify-center">
                <Button variant="secondary" onClick={() => window.location.reload()} className="text-[10px] uppercase tracking-widest">Unlock Monitoring</Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

const NewScan = ({ onStartScan, loading }: any) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!url) return;
    onStartScan(url);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.2)] mb-6">
          <Target className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter uppercase text-scan-text">Lancer une Simulation d'Attaque</h1>
        <p className="text-scan-text-muted font-medium">Saisissez l'URL cible pour effectuer une évaluation automatisée des vulnérabilités (OWASP).</p>
      </div>

      <Card className="p-8 bg-slate-900 shadow-inner">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] font-black text-scan-text-muted pl-4 italic">URL de la Cible</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://votre-site-dns.com"
                className="w-full bg-scan-bg border border-scan-border rounded-[2rem] py-4 px-8 text-scan-text focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner font-mono text-lg"
                value={url}
                required
                onChange={(e) => setUrl(e.target.value)}
              />
              <span className="absolute right-8 top-4 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Target</span>
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 flex gap-4 text-sm text-scan-text-muted leading-relaxed italic">
            <Shield className="w-6 h-6 shrink-0 text-indigo-500" />
            <p>Ewaba Engine: "Initialisation des protocoles d'attaque et de crawl récursif. Toutes les actions sont journalisées pour conformité."</p>
          </div>

          <Button
            variant="neon"
            className="w-full py-5 text-lg"
            loading={loading}
            icon={Zap}
          >
            Démarrer l'Analyse
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          { label: 'OWASP Scans', value: '10+ Patterns' },
          { label: 'AI Engine', value: 'Ewaba Core' },
          { label: 'Reports', value: 'PDF / JSON' }
        ].map((f, i) => (
          <div key={i} className="space-y-1">
            <p className="text-xs text-scan-text-muted uppercase tracking-widest">{f.label}</p>
            <p className="font-bold text-zinc-200">{f.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const LandingPage = ({ onGuestScan, scanLoading, onLogin, theme, toggleTheme }: any) => {
  const [url, setUrl] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      badge: "Cyber-Défense par IA",
      title: "DÉTECTEZ <span class='text-indigo-500'>L'INVISIBLE</span> INSTANTANÉMENT.",
      desc: "L'outil de sécurité conçu pour les humains. HorusSight utilise le moteur Ewaba pour scanner votre site et vous dire exactement comment corriger les failles.",
      image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070"
    },
    {
      badge: "Roadmap Stratégique",
      title: "PRIORISEZ VOS <span class='text-indigo-500'>ACTIONS</span> DE SÉCURITÉ.",
      desc: "Recevez un plan de remédiation détaillé et priorisé. Ne perdez plus de temps sur des faux positifs, concentrez-vous sur l'essentiel.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=2000"
    },
    {
      badge: "Intelligence en Temps Réel",
      title: "SURVEILLANCE <span class='text-indigo-500'>ACTIVE</span> 24/7.",
      desc: "Monitorez vos logs en temps réel et recevez des alertes immédiates en cas de tentative d'intrusion suspecte.",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=2070"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const scrollToId = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-scan-bg text-scan-text transition-colors duration-500 overflow-x-hidden relative">
      {/* Background Cyber Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(79,70,229,0.1),transparent_70%)] -z-10"></div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-scan-bg/80 backdrop-blur-xl border-b border-scan-border/50">
        <div className="max-w-[1700px] mx-auto px-10 py-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-12 h-12 text-indigo-600" />
            <span className="font-black text-3xl tracking-[0.2em] uppercase text-scan-text">HorusSight</span>
          </div>
          <div className="flex items-center gap-8">
            <button onClick={onLogin} className="text-sm font-black uppercase tracking-widest text-scan-text-muted hover:text-scan-text transition-colors">Base de Logique</button>
            <button
              onClick={toggleTheme}
              className="p-3 text-scan-text-muted hover:text-scan-accent transition-colors bg-scan-surface border border-scan-border rounded-2xl"
            >
              {theme === 'dark' ? <Sun className="w-7 h-7 text-amber-400" /> : <Moon className="w-7 h-7 text-indigo-400" />}
            </button>
            <Button onClick={onLogin} className="px-12 py-5 text-lg">Établir Profil</Button>
          </div>
        </div>
      </nav>

      {/* Hero Slideshow */}
      <header className="h-screen relative flex items-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-scan-bg via-scan-bg/80 to-transparent z-10" />
            <img
              src={slides[currentSlide].image}
              alt="Slide Background"
              className="w-full h-full object-cover opacity-40 brightness-75"
            />
          </motion.div>
        </AnimatePresence>

        <div className="max-w-[1700px] mx-auto px-10 relative z-20 w-full pt-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-4xl space-y-12"
            >
              <div className="flex items-center gap-4">
                <Badge variant="High" className="py-2 px-6 text-sm uppercase tracking-widest ont-black">{slides[currentSlide].badge}</Badge>
                <div className="h-[1px] w-12 bg-indigo-500"></div>
              </div>
              <h1
                className="text-7xl md:text-9xl font-black text-scan-text tracking-tighter leading-[0.85] uppercase drop-shadow-2xl"
                dangerouslySetInnerHTML={{ __html: slides[currentSlide].title }}
              />
              <p className="text-2xl text-scan-text-muted leading-relaxed max-w-2xl font-medium">
                {slides[currentSlide].desc}
              </p>

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <Button onClick={onLogin} className="px-16 py-7 text-xl shadow-[0_0_30px_rgba(79,70,229,0.3)]">
                  Établir Profil Sécurisé
                </Button>
                <Button variant="secondary" onClick={() => scrollToId('quick-scan')} className="px-12 py-7 text-xl border-indigo-500/20 group">
                  Lancement Rapide <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-10">
                <div className="flex -space-x-5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-14 h-14 rounded-full border-4 border-scan-border bg-slate-800 flex items-center justify-center overflow-hidden shadow-xl">
                      <img src={`https://i.pravatar.cc/150?img=${i + 20}`} alt="user" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <p className="text-base font-bold text-scan-text-muted uppercase tracking-[0.2em] italic">+2,500 experts font confiance à HorusSight</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-16 left-10 z-30 flex gap-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 transition-all duration-500 rounded-full ${currentSlide === i ? 'w-20 bg-indigo-500' : 'w-6 bg-scan-border hover:bg-scan-text-muted'}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={() => scrollToId('quick-scan')}
          animate={{ y: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 text-scan-text-muted hover:text-scan-text transition-colors group"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 group-hover:opacity-100">Découvrir Horus</span>
          <div className="w-8 h-14 rounded-full border-2 border-scan-border flex items-start justify-center p-2 shadow-lg">
            <div className="w-1.5 h-3 bg-indigo-500 rounded-full animate-bounce" />
          </div>
        </motion.button>
      </header>

      {/* NEW: Tactical Quick Scan Section */}
      <section id="quick-scan" className="py-40 bg-scan-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(79,70,229,0.05),transparent_50%)]"></div>
        <div className="max-w-[1700px] mx-auto px-10 relative z-10">
          <div className="bg-scan-bg/40 backdrop-blur-3xl border border-scan-border/60 rounded-[4rem] p-20 shadow-3xl flex flex-col lg:flex-row items-center justify-between gap-20 group/scan relative">
            <div className="absolute -inset-1 bg-indigo-500/10 rounded-[4rem] blur-2xl opacity-0 group-hover/scan:opacity-100 transition-opacity duration-1000"></div>

            <div className="max-w-xl space-y-8 relative">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Module Ghost Infiltration</span>
              </div>
              <h2 className="text-6xl font-black text-scan-text uppercase tracking-tighter leading-tight">Lancer une Infiltration <span className="text-indigo-500 underline decoration-indigo-500/20 underline-offset-8">Tactique</span></h2>
              <p className="text-xl text-scan-text-muted leading-relaxed font-medium">
                Saisissez l'URL cible pour initier une simulation d'attaque non-intrusive. Recevez un rapport IA EWABA en quelques secondes.
              </p>
            </div>

            <div className="w-full lg:w-1/2 relative group px-4">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-violet-600/20 rounded-[4rem] opacity-0 group-hover:opacity-100 blur transition duration-700"></div>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://votre-infrastructure.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-scan-bg border-2 border-scan-border rounded-[3rem] py-10 px-14 text-scan-text focus:outline-none focus:border-indigo-600 transition-all font-mono text-2xl shadow-inner group-hover:bg-scan-surface/40"
                />
                <div className="absolute right-5 top-5">
                  <Button
                    guided={url.length > 5}
                    loading={scanLoading}
                    className="py-6 px-14 text-xl shadow-2xl"
                    onClick={() => onGuestScan(url)}
                    icon={Target}
                  >
                    Infiltrer
                  </Button>
                </div>
              </div>
              <p className="mt-8 text-center text-[10px] uppercase tracking-[0.4em] text-scan-text-muted font-bold opacity-40">Protocole de guest activé - Isolation Temporaire</p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features-section" className="py-60 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] -z-10"></div>
        <div className="max-w-[1700px] mx-auto px-10">
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              { title: 'IA EWABA V3.2', desc: 'Analyse neuronale profonde basée sur 15 ans d\'historique de cyber-attaques.', icon: BrainCircuit, color: 'indigo' },
              { title: 'Zéro Faux Positifs', desc: 'Chaque vulnérabilité est validée par notre moteur avant d\'être reportée.', icon: Shield, color: 'blue' },
              { title: 'Infiltration Discrète', desc: 'Des simulations d\'attaque non-intrusives qui n\'affectent jamais vos performances.', icon: Target, color: 'violet' }
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -20, scale: 1.02 }}
                className="group relative"
              >
                <div className="absolute -inset-[2px] bg-gradient-to-br from-indigo-500/50 to-transparent rounded-[3.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                <div className="relative space-y-10 bg-scan-surface/40 backdrop-blur-xl p-16 rounded-[3.5rem] border border-scan-border/50 hover:border-indigo-500/30 transition-all duration-500 shadow-2xl h-full">
                  <div className="w-24 h-24 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-scan-text transition-all duration-500 shadow-xl border border-indigo-600/20">
                    <f.icon className="w-12 h-12" />
                  </div>
                  <h3 className="text-4xl font-black text-scan-text uppercase tracking-tight leading-tight">{f.title}</h3>
                  <p className="text-xl text-scan-text-muted leading-relaxed font-medium opacity-80">{f.desc}</p>
                  <div className="pt-6">
                    <span className="inline-flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir Protocole <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cyber Philosophy Section */}
      <section className="py-60 bg-scan-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px] opacity-40"></div>
        <div className="max-w-[1700px] mx-auto px-10 relative z-10">
          <div className="text-center space-y-10 mb-40">
            <div className="inline-block px-10 py-4 bg-scan-surface border border-scan-border rounded-full shadow-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.8em] text-indigo-500">Architecture & Logique</span>
            </div>
            <h2 className="text-7xl md:text-9xl font-black text-scan-text uppercase tracking-tighter leading-none italic">
              De la <span className="text-indigo-500 relative">Sonde<span className="absolute -bottom-2 left-0 w-full h-2 bg-indigo-500/10"></span></span> à la Protection
            </h2>
            <p className="text-scan-text-muted max-w-3xl mx-auto text-2xl font-medium opacity-70">
              Une transparence numérique totale, propulsée par un cycle de détection intensif.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Cartographie Ghost', desc: 'Identifie chaque point d\'entrée actif sans jamais perturber le flux utilisateur.', icon: Search },
              { step: '02', title: 'Analyse Intensive', desc: 'Ewaba confronte les patterns à notre base mondiale de menaces en temps réel.', icon: Cpu },
              { step: '03', title: 'Roadmap Défense', desc: 'Un plan de remédiation complet avec correctifs prêts à être déployés.', icon: LayoutDashboard },
            ].map((s, i) => (
              <div key={i} className="flex flex-col h-full bg-scan-surface/20 border border-scan-border rounded-[3rem] p-16 relative overflow-hidden group hover:bg-scan-surface/40 transition-all duration-700">
                <div className="text-6xl font-black text-scan-text opacity-10 mb-12 font-mono group-hover:text-indigo-500 transition-colors">{s.step}</div>
                <div className="w-20 h-20 rounded-2xl bg-indigo-600/5 flex items-center justify-center text-indigo-400 mb-10 border border-indigo-600/10 transition-colors group-hover:border-indigo-500/40">
                  <s.icon className="w-10 h-10" />
                </div>
                <h4 className="text-3xl font-black text-scan-text mb-6 uppercase tracking-wide leading-tight group-hover:text-indigo-500 transition-colors">{s.title}</h4>
                <p className="text-lg text-scan-text-muted leading-relaxed font-medium mb-auto">{s.desc}</p>

                <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-40 bg-scan-bg">
        <div className="max-w-[1700px] mx-auto px-10 space-y-32">
          <div className="grid md:grid-cols-4 gap-20">
            <div className="col-span-2 space-y-12">
              <div className="flex items-center gap-6">
                <Shield className="w-16 h-16 text-indigo-600" />
                <span className="font-black text-4xl tracking-[0.2em] uppercase text-scan-text">HorusSight</span>
              </div>
              <p className="text-2xl text-scan-text-muted leading-relaxed max-w-2xl font-medium">
                Démocratiser la cybersécurité grâce à une intelligence artificielle évolutive et totalement transparente.
              </p>
              <div className="flex gap-8">
                {[Github, Twitter, Mail, Slack].map((Icon, i) => (
                  <button key={i} className="p-6 bg-scan-surface border border-scan-border rounded-3xl text-scan-text-muted hover:text-indigo-500 hover:border-indigo-500/50 transition-all shadow-xl group">
                    <Icon className="w-8 h-8 transition-transform group-hover:scale-110" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <h4 className="text-xs font-black text-scan-text uppercase tracking-[0.4em]">Intelligence</h4>
              <ul className="space-y-8 text-lg text-scan-text-muted font-bold">
                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Ewaba v3.2 Core</li>
                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Ghost Engine</li>
                <li className="hover:text-indigo-400 cursor-pointer transition-colors">Vulnerability DB</li>
              </ul>
            </div>

            <div className="space-y-10">
              <h4 className="text-xs font-black text-scan-text uppercase tracking-[0.4em]">Bulletins</h4>
              <p className="text-lg text-scan-text-muted font-medium mb-8">Recevez les dernières alertes mondiales.</p>
              <div className="relative group">
                <input type="email" placeholder="mail@defense.com" className="w-full bg-scan-surface border-2 border-scan-border rounded-[2rem] px-10 py-6 text-lg focus:outline-none focus:border-indigo-600 transition-all font-mono" />
                <button className="absolute right-3 top-3 p-4 bg-indigo-600 rounded-2xl text-scan-text shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition-all"><ChevronRight className="w-8 h-8" /></button>
              </div>
            </div>
          </div>

          <div className="pt-20 border-t border-scan-border flex flex-col md:flex-row justify-between items-center gap-10">
            <span className="text-xs text-scan-text-muted font-mono tracking-[0.5em] uppercase font-black opacity-60">© 2026 HORUSSIGHT CYBER DEFENSE. PROTECTING FLOWS.</span>
            <div className="flex gap-12 text-xs text-scan-text-muted font-black uppercase tracking-[0.4em]">
              <span className="hover:text-scan-text cursor-pointer transition-colors">Privacy Protocol</span>
              <span className="hover:text-scan-text cursor-pointer transition-colors">Access Agreement</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};


const ReportView = ({ scanId, onBack, isGuest }: any) => {
  const [scan, setScan] = useState<any>(null);
  const [analysis, setAnalysis] = useState<AIRiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const [queryingVuln, setQueryingVuln] = useState<any>(null);
  const [aiChatResponse, setAiChatResponse] = useState<string>('');
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState('Tout');

  const handleAskAI = async (vuln: any, context: string) => {
    setQueryingVuln(vuln);
    setIsQueryLoading(true);
    setAiChatResponse('');
    try {
      const response = await askAboutVulnerability(vuln, context);
      setAiChatResponse(response);
    } catch (err) {
      setAiChatResponse('The Intelligence Core is temporarily offline. Please try again.');
    } finally {
      setIsQueryLoading(false);
    }
  };

  const handleDownloadJSON = () => {
    if (!scan || !analysis) return;
    const reportData = {
      scan_overview: {
        id: scan.id,
        target: scan.target,
        timestamp: scan.timestamp,
        status: scan.status,
        duration: scan.duration,
        metrics: {
          endpoints_scanned: scan.endpoints.length,
          vulnerabilities_found: scan.vulnerabilities.length
        }
      },
      ai_intelligence: analysis,
      vulnerabilities: scan.vulnerabilities,
      endpoints: scan.endpoints
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `horussight-report-${scan.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = () => {
    if (!scan || !analysis) return;
    const doc = new jsPDF() as any;

    // Header
    doc.setFillColor(10, 12, 16);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('HORUSSIGHT SECURITY REPORT', 15, 25);
    doc.setFontSize(10);
    doc.text(`TARGET: ${scan.target}`, 15, 33);
    doc.text(`DATE: ${new Date(scan.timestamp).toLocaleString()}`, 160, 33);

    // AI Overview
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('INTELLIGENCE OVERVIEW', 15, 55);
    doc.setFontSize(10);
    doc.text(`Overall Risk Score: ${analysis.overallRiskScore}/100`, 15, 65);
    doc.text(`Severity: ${analysis.severityClassification}`, 150, 65);

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Simplified Security Status (Non-Technical):', 15, 75);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const splitSimple = doc.splitTextToSize(analysis.simplifiedRiskSummary, 180);
    doc.text(splitSimple, 15, 80);

    let nextY = 80 + (splitSimple.length * 5) + 5;

    doc.setFontSize(11);
    doc.setFont('Helvetica', 'bold');
    doc.text('Business Impact Analysis:', 15, nextY);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    const splitImpact = doc.splitTextToSize(analysis.businessImpactSummary, 180);
    doc.text(splitImpact, 15, nextY + 5);

    nextY = nextY + 5 + (splitImpact.length * 5) + 15;

    // Solutions Table
    doc.setFontSize(14);
    doc.text('REMEDIATION ROADMAP', 15, nextY - 5);

    const tableData = analysis.exhaustiveSolutions.map(sol => [
      `P${sol.priorityLevel}`,
      sol.category || 'N/A',
      sol.responsibleParty,
      sol.description,
      sol.action
    ]);

    autoTable(doc, {
      startY: nextY,
      head: [['ID', 'Category', 'Owner', 'Finding', 'Action Required']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 25 },
        3: { cellWidth: 55 },
        4: { cellWidth: 60 }
      }
    });

    // Detailed Remediation Steps (since they are long, we add them after the table or on next page)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text('DETAILED REMEDIATION CHECKLISTS', 15, finalY);
    doc.setFontSize(10);
    let currentY = finalY + 10;

    analysis.exhaustiveSolutions.forEach((sol, i) => {
      if (currentY > 260) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont('Helvetica', 'bold');
      doc.text(`${i + 1}. ${sol.description} (${sol.category})`, 15, currentY);
      doc.setFont('Helvetica', 'normal');
      currentY += 5;
      doc.text(`Contact: ${sol.contactAdvice} via ${sol.contactChannels.join(', ')}`, 15, currentY);
      currentY += 5;
      sol.remediationChecklist.forEach((step) => {
        doc.text(`[ ] ${step}`, 20, currentY);
        currentY += 5;
      });

      if (sol.contactTemplate) {
        currentY += 2;
        doc.setFont('Helvetica', 'italic');
        doc.text('Communication Template:', 15, currentY);
        doc.setFont('Helvetica', 'normal');
        currentY += 5;
        const splitTemplate = doc.splitTextToSize(sol.contactTemplate, 175);

        // Check if we need a new page for the template
        if (currentY + (splitTemplate.length * 5) > 280) {
          doc.addPage();
          currentY = 20;
        }

        doc.text(splitTemplate, 20, currentY);
        currentY += (splitTemplate.length * 5);
      }

      currentY += 10;
    });

    doc.save(`horussight-report-${scan.id}.pdf`);
  };

  useEffect(() => {
    let interval: any;

    const fetchScan = async () => {
      try {
        const endpoint = `/scans/${scanId}`;
        const res = await api.get(endpoint);
        setScan(res.data);

        if (res.data.status === 'Completed') {
          if (interval) clearInterval(interval);
          // Use AI analysis directly from the engine backend results
          if (res.data.ai_analysis) {
            setAnalysis(res.data.ai_analysis);
          }
        } else if (res.data.status === 'Failed') {
          if (interval) clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
        if (interval) clearInterval(interval);
      } finally {
        setLoading(false);
      }
    };

    fetchScan();
    interval = setInterval(fetchScan, 3000);

    return () => clearInterval(interval);
  }, [scanId, isGuest]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      <p className="text-scan-text-muted animate-pulse">Aggregating vulnerability data...</p>
    </div>
  );

  if (!scan) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-6">
      <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/20">
        <AlertTriangle className="w-10 h-10" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-scan-text uppercase tracking-widest">Échec du chargement</h3>
        <p className="text-scan-text-muted max-w-xs">Impossible de récupérer les détails du scan. Il a peut-être été supprimé ou le serveur est inaccessible.</p>
      </div>
      <Button variant="secondary" onClick={onBack} icon={ChevronRight} className="rotate-180">Retour au Tableau de Bord</Button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative overflow-hidden p-10 lg:p-14 rounded-[3.5rem] bg-scan-surface/40 backdrop-blur-3xl border border-scan-border shadow-[0_30px_100px_rgba(0,0,0,0.5)] group mb-12">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-600/10 to-transparent -z-10 animate-pulse" />
        <div className="absolute -top-1/2 -right-1/4 w-2/3 h-[200%] bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.08)_0%,transparent_70%)] rotate-12 -z-10" />
        <div className="absolute bottom-0 left-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 relative z-10">
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ x: -5, backgroundColor: 'rgba(79, 70, 229, 0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="p-3.5 rounded-2xl bg-scan-bg border border-scan-border text-scan-text-muted hover:text-indigo-400 transition-all shadow-inner"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </motion.button>
              <div className="h-10 w-[1px] bg-scan-border mx-2"></div>
              <Badge variant={scan.status}>{scan.status}</Badge>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-scan-text-muted animate-pulse">Scan System Active</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] text-scan-text drop-shadow-2xl">
                Scan <span className="text-indigo-500 inline-block transform -rotate-2">Report</span>
              </h1>
              <div className="flex items-center gap-3 font-mono text-lg text-scan-text-muted bg-scan-bg/40 py-2 px-4 rounded-xl border border-scan-border/50 backdrop-blur w-fit">
                <Globe className="w-5 h-5 text-indigo-400" />
                {scan.target}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-8 lg:gap-14">
            {[
              { label: 'Indice de Risque', value: `${analysis?.overallRiskScore || 0}/100`, icon: Shield, color: (analysis?.overallRiskScore || 0) > 60 ? 'text-rose-500' : 'text-emerald-500' },
              { label: 'Endpoints', value: scan.endpoints?.length || 0, icon: Target, color: 'text-indigo-400' },
              { label: 'Vulnérabilités', value: scan.vulnerabilities?.length || 0, icon: AlertTriangle, color: 'text-amber-500' }
            ].map((m, i) => (
              <div key={i} className="space-y-2 pr-8 lg:pr-14 border-r border-scan-border/30 last:border-0 border-dashed">
                <div className="flex items-center gap-2 text-[10px] font-black text-scan-text-muted uppercase tracking-[0.2em]">
                  <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                  {m.label}
                </div>
                <p className="text-4xl font-bold tracking-tighter">{m.value}</p>
              </div>
            ))}

            <div className="flex flex-col gap-4">
              {isGuest ? (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Guest Limitation</p>
                  <p className="text-[9px] text-scan-text-muted">Upgrade to Export PDF/JSON</p>
                </div>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleDownloadJSON}
                    icon={FileText}
                    className="py-3 px-8 text-xs uppercase tracking-widest rounded-xl hover:border-indigo-500/50"
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleDownloadPDF}
                    icon={Download}
                    className="py-3 px-8 text-xs uppercase tracking-widest rounded-xl shadow-indigo-600/20"
                    guided
                  >
                    Export PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!analysis || !analysis.exhaustiveSolutions ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-12">
            <div className="p-8 lg:p-12 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <BrainCircuit className="w-12 h-12 text-indigo-500/20" />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 mb-6 italic">Strategie Expert EWABA</h2>
              <p className="text-3xl lg:text-5xl font-black text-scan-text tracking-tighter mb-8 leading-[0.95] uppercase">
                {analysis.simplifiedRiskSummary || "Calcul de l'impact en cours..."}
              </p>
              <p className="text-lg text-scan-text-muted font-medium max-w-4xl leading-relaxed italic border-l-2 border-indigo-500/30 pl-8">
                "{analysis.businessImpactSummary || "Analyse EWABA en attente de traitement..."}"
              </p>
            </div>
          </div>
        </div>
      )}

      {scan.status === 'In Progress' ? (
        <Card className="text-center py-24 space-y-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.05)_0%,transparent_70%)] animate-pulse" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-indigo-600/20 rounded-full animate-ping"></div>
            <div className="absolute -inset-4 border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute -inset-8 border border-indigo-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
            <div className="relative bg-slate-900 border-2 border-indigo-600 rounded-full w-full h-full flex items-center justify-center text-indigo-400 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
              <Activity className="w-14 h-14 animate-pulse" />
            </div>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-indigo-500/50"></div>
              <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-scan-text drop-shadow-glow">Séquence Tactical Ghost en cours</h2>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-indigo-500/50"></div>
            </div>
            <p className="text-scan-text-muted max-w-lg mx-auto text-sm italic font-medium leading-relaxed">
              "Injection multi-threadée activée. Analyse récursive des vecteurs XSS et SQL. <br />
              Expert Intelligence EWABA en attente de synchronisation."
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Button variant="secondary" onClick={() => window.location.reload()} icon={Activity} className="px-8 py-3 rounded-xl border-indigo-500/20 text-[10px] uppercase tracking-widest">Forcer la Synchronisation</Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card title="Remédiation Tactique" icon={AlertTriangle}>
              <div className="space-y-12">
                {!analysis || !analysis.exhaustiveSolutions || analysis.exhaustiveSolutions.length === 0 ? (
                  <div className="text-center py-12 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                    <h3 className="font-bold text-emerald-400">Accès Sécurisé : Vérifié</h3>
                    <p className="text-sm text-scan-text-muted">Aucune vulnérabilité identifiée sur cette trajectoire.</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2 mb-8 p-1 bg-scan-surface rounded-2xl border border-scan-border/50">
                      {['Tout', ...new Set(analysis.exhaustiveSolutions.map((s: any) => s.category || 'Sécurité Générale'))].map((cat: any) => (
                        <button
                          key={cat}
                          onClick={() => setFilterCategory(cat)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterCategory === cat
                              ? 'bg-indigo-600 text-scan-text shadow-lg shadow-indigo-900/40'
                              : 'text-scan-text-muted hover:text-scan-text hover:bg-scan-surface/40 shadow-inner'
                            }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-12">
                      {Object.entries(
                        analysis.exhaustiveSolutions
                          .filter((sol: any) => filterCategory === 'Tout' || (sol.category || 'Sécurité Générale') === filterCategory)
                          .reduce((acc: any, sol: any) => {
                            const category = sol.category || 'Sécurité Générale';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(sol);
                            return acc;
                          }, {})
                      ).map(([category, solutions]: [string, any]) => (
                        <div key={category} className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                            <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] whitespace-nowrap bg-indigo-500/5 px-4 py-1.5 rounded-full border border-indigo-500/10 shadow-inner">
                              {category}
                            </h3>
                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent"></div>
                          </div>

                          <div className="space-y-10">
                            {solutions.map((sol: any, idx: number) => (
                              <div key={idx} className="p-8 lg:p-14 bg-slate-900/40 backdrop-blur-3xl border border-scan-border hover:border-indigo-500/30 transition-all rounded-[3.5rem] space-y-10 relative group overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full -z-10 group-hover:from-indigo-500/20 transition-all duration-700" />

                                <div className="absolute top-6 right-10 text-[10px] font-black text-scan-text-muted opacity-40 uppercase tracking-widest bg-scan-surface/50 border border-scan-border px-3 py-1 rounded-full z-20">
                                  Matrice Cible : {idx + 1}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-7">
                                    <div className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center font-black text-2xl shadow-2xl border-2 ${sol.priorityLevel <= 3 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-900/20' :
                                        sol.priorityLevel <= 6 ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-900/10' :
                                          'bg-slate-500/10 text-scan-text-muted border-slate-500/20 shadow-slate-900/10'
                                      }`}>
                                      P{sol.priorityLevel}
                                    </div>
                                    <div className="space-y-3">
                                      <div className="flex items-center gap-5">
                                        <h4 className="font-black text-scan-text text-3xl lg:text-5xl tracking-tighter leading-tight">{sol.description}</h4>
                                        <button
                                          onClick={() => handleAskAI(sol, 'Explique-moi ça en détail et propose des alternatives.')}
                                          className="p-3 text-indigo-400 hover:bg-indigo-400/10 rounded-full transition-all group/ai hover:scale-125 hover:rotate-12 active:scale-90"
                                          title="Interaction IA HorusSight"
                                        >
                                          <BrainCircuit className="w-8 h-8 group-hover/ai:animate-pulse" />
                                        </button>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-[0.3em] text-scan-text-muted">
                                        <span className="flex items-center gap-2.5 px-3 py-1 bg-scan-bg rounded-lg border border-scan-border shadow-inner"><Tag className="w-4 h-4 text-indigo-500" /> {sol.category}</span>
                                        <span className="flex items-center gap-2.5 px-3 py-1 bg-scan-bg rounded-lg border border-scan-border shadow-inner"><Shield className="w-4 h-4 text-emerald-500" /> Vérifié EWABA Logic</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="lg:text-right shrink-0 pt-4">
                                    <p className="text-[10px] font-black text-scan-text-muted uppercase tracking-[0.35em] mb-3 opacity-60">Matrice de Responsabilité</p>
                                    <Badge variant={sol.priorityLevel <= 3 ? 'Critical' : 'Info'}>{sol.responsibleParty}</Badge>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <div className="p-8 bg-scan-bg/60 backdrop-blur border border-scan-border/60 rounded-[2rem] space-y-4 relative overflow-hidden group/action shadow-inner">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600/40"></div>
                                    <div className="flex items-center gap-2 text-[11px] font-black text-scan-text-muted uppercase tracking-[0.3em]">
                                      <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                                      Action Immédiate Requise
                                    </div>
                                    <p className="text-lg text-scan-text font-mono leading-relaxed pl-2">{sol.action}</p>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-indigo-600/5 rounded-2xl border border-indigo-600/10 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.35em]">Stratégie de Remédiation</span>
                                        <div className="flex gap-1.5">
                                          {sol.contactChannels.map((channel: string, i: number) => {
                                            const getIcon = (c: string) => {
                                              const low = c.toLowerCase();
                                              if (low.includes('github')) return Github;
                                              if (low.includes('email') || low.includes('mail')) return Mail;
                                              if (low.includes('slack')) return Slack;
                                              if (low.includes('support') || low.includes('help')) return MessageSquare;
                                              if (low.includes('twitter')) return Twitter;
                                              return Globe;
                                            };
                                            const ChannelIcon = getIcon(channel);
                                            return (
                                              <motion.div
                                                key={i}
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex items-center justify-center p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all cursor-pointer group/channel"
                                                title={channel}
                                              >
                                                <ChannelIcon className="w-3 h-3" />
                                              </motion.div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      <p className="text-xs text-indigo-300 font-bold leading-snug">{sol.contactAdvice}</p>
                                    </div>
                                    <div className="p-4 bg-amber-600/5 rounded-2xl border border-amber-600/10 space-y-3">
                                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Précautions de Risque</span>
                                      <p className="text-xs text-amber-200/70 italic leading-snug">"{sol.precautions}"</p>
                                    </div>
                                  </div>

                                  {sol.contactTemplate && (
                                    <div className="p-5 bg-scan-bg border-scan-border space-y-4">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-scan-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                          <FileText className="w-3 h-3" />
                                          Communication Template
                                        </span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(sol.contactTemplate);
                                            const btn = document.getElementById(`copy-btn-${idx}`);
                                            if (btn) {
                                              const originalText = btn.innerHTML;
                                              btn.innerHTML = 'Copied!';
                                              btn.classList.add('bg-emerald-500/20', 'text-emerald-400');
                                              setTimeout(() => {
                                                btn.innerHTML = originalText;
                                                btn.classList.remove('bg-emerald-500/20', 'text-emerald-400');
                                              }, 2000);
                                            }
                                          }}
                                          id={`copy-btn-${idx}`}
                                          className="group/copy flex items-center gap-1.5 px-3 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 text-[9px] font-bold text-indigo-400 rounded-lg border border-indigo-500/20 transition-all hover:scale-110 active:scale-90 relative"
                                        >
                                          <motion.div
                                            animate={{ rotate: [0, -10, 10, 0] }}
                                            transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2, 0.3] }}
                                          >
                                            <Copy className="w-3 h-3 group-hover/copy:text-scan-text transition-colors" />
                                          </motion.div>
                                          Copier le Template
                                          <motion.div
                                            animate={{ x: [0, 5, 0], scale: [1, 1.2, 1] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                            className="absolute -right-8 top-1/2 -translate-y-1/2 text-indigo-400/60 hidden group-hover/copy:block pointer-events-none"
                                          >
                                            <Hand className="w-5 h-5 -rotate-90" />
                                          </motion.div>
                                          {/* Animated Pulse Ring for priority actions */}
                                          {sol.priorityLevel <= 3 && (
                                            <motion.div
                                              animate={{ scale: [1, 1.2, 1], opacity: [0, 0.3, 0] }}
                                              transition={{ repeat: Infinity, duration: 3 }}
                                              className="absolute inset-0 border border-indigo-500 rounded-lg pointer-events-none"
                                            />
                                          )}
                                        </button>
                                      </div>
                                      <pre className="text-[10px] text-scan-text-muted font-mono bg-scan-surface/50 p-4 rounded-xl border border-scan-border/50 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                                        {sol.contactTemplate}
                                      </pre>
                                    </div>
                                  )}

                                  {queryingVuln?.description === sol.description && (aiChatResponse || isQueryLoading) && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      className="p-5 bg-indigo-600/5 rounded-2xl border border-indigo-600/20 space-y-3 relative overflow-hidden"
                                    >
                                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <BrainCircuit className="w-4 h-4 text-indigo-400" />
                                          <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Intelligence Insight</span>
                                        </div>
                                        <button
                                          onClick={() => { setQueryingVuln(null); setAiChatResponse(''); }}
                                          className="text-[9px] font-black text-scan-text-muted hover:text-scan-text uppercase"
                                        >
                                          Dismiss
                                        </button>
                                      </div>

                                      {isQueryLoading ? (
                                        <div className="flex items-center gap-3 py-4">
                                          <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                          <p className="text-xs text-scan-text-muted animate-pulse font-mono uppercase tracking-[0.2em]">Deciphering vulnerability intricacies...</p>
                                        </div>
                                      ) : (
                                        <div className="text-xs text-scan-text leading-relaxed font-medium space-y-2 whitespace-pre-wrap">
                                          {aiChatResponse}
                                        </div>
                                      )}
                                    </motion.div>
                                  )}

                                  <div className="p-5 bg-scan-surface/50 rounded-2xl border border-scan-border space-y-4">
                                    <span className="text-[10px] font-black text-scan-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                                      <Clock className="w-3 h-3" />
                                      Execution Checklist
                                    </span>
                                    <div className="space-y-3">
                                      {sol.remediationChecklist.map((step: string, i: number) => (
                                        <motion.div
                                          key={i}
                                          whileHover={{ scale: 1.01, x: 5 }}
                                          className="flex items-start gap-3 group/step cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                          <div className="mt-0.5 w-4 h-4 rounded-md border-2 border-scan-border flex items-center justify-center shrink-0 group-hover/step:border-indigo-500 transition-colors">
                                            <div className="w-1.5 h-1.5 bg-indigo-500 rounded-sm opacity-0 group-hover/step:opacity-100 transition-opacity"></div>
                                          </div>
                                          <p className="text-xs text-scan-text-muted group-hover/step:text-scan-text leading-relaxed transition-colors">{step}</p>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-2">
                                  {sol.responsibleParty === 'Developer' && <Badge variant="Info">Requires Code Modification</Badge>}
                                  {sol.responsibleParty === 'Security Expert' && <Badge variant="Critical">Requires Infrastructure Config</Badge>}
                                  {sol.responsibleParty === 'User' && <Badge variant="High">Account Owner Decision Needed</Badge>}
                                  <Badge variant="Completed">Verified EWABA v3.1</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card title="Mapped Architecture" icon={Terminal}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.isArray(scan.endpoints) && scan.endpoints.map((ep: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-slate-900 border border-scan-border rounded-xl group hover:border-indigo-500/50 transition-all">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]"></span>
                    <span className="text-[10px] font-mono text-scan-text-muted truncate flex-1">{ep}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-scan-text-muted group-hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => window.open(ep, '_blank')} />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card
              title={scan.status === 'In Progress' ? "Tactical Live Stream" : "Intelligence Contextuelle"}
              icon={scan.status === 'In Progress' ? Activity : BrainCircuit}
              className="border-indigo-500/20 bg-indigo-600/5 shadow-2xl shadow-indigo-950/40 sticky top-12 overflow-visible"
            >
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-scan-text shadow-lg shadow-indigo-900/40 transform rotate-12 group-hover:rotate-0 transition-transform">
                {scan.status === 'In Progress' ? <Activity className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
              </div>

              {scan.status === 'In Progress' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-3xl border border-indigo-500/20 font-mono text-[10px] h-[500px] overflow-y-auto custom-scrollbar shadow-inner relative group">
                    <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10"></div>
                    <div className="space-y-2 pb-4">
                      {(scan.logs || []).map((log: string, i: number) => (
                        <motion.p
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={i}
                          className="flex gap-2 leading-relaxed border-l border-indigo-500/10 pl-2"
                        >
                          <span className="text-indigo-500/50 shrink-0">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                          <span className={log.includes('SQLi') || log.includes('XSS') ? 'text-amber-400' : 'text-emerald-400/80'}>{log}</span>
                        </motion.p>
                      ))}
                      {(scan.logs || []).length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-40">
                          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                          <p className="text-[10px] uppercase tracking-widest text-center">Initialisation des protocoles tactiques...</p>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10"></div>
                  </div>
                  <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Calcul Threadé</span>
                      <span className="text-[9px] font-mono text-indigo-400/60">Full Power Mode</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        className="h-full w-1/3 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                      />
                    </div>
                  </div>
                </div>
              ) : analyzing ? (
                <div className="py-12 text-center space-y-6">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 bg-indigo-600/20 rounded-full animate-ping"></div>
                    <Loader2 className="relative w-16 h-16 text-indigo-400 animate-spin" />
                  </div>
                  <p className="text-[10px] text-indigo-400 animate-pulse font-bold uppercase tracking-[0.2em]">Ewaba v3.1 Logic Core Processing</p>
                </div>
              ) : analysis ? (
                <div className="space-y-8">
                  <div className="text-center py-8 bg-slate-900 border border-scan-border rounded-3xl shadow-inner relative overflow-hidden group">
                    <motion.div
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="absolute inset-0 bg-indigo-600 pointer-events-none"
                    />
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
                    <p className="text-[10px] text-scan-text-muted uppercase tracking-[0.2em] mb-2 font-bold relative z-10">Index de Risque Global</p>
                    <div className="text-6xl font-light text-scan-text tracking-tighter relative z-10">
                      {analysis.overallRiskScore}
                      <span className="text-xl text-scan-text-muted opacity-50 ml-1">/100</span>
                    </div>
                    <div className="mt-4 relative z-10">
                      <Badge>{analysis.severityClassification}</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-scan-text-muted uppercase tracking-widest flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      RÉSUMÉ SIMPLIFIÉ
                    </h5>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                      <p className="text-sm text-amber-200/80 leading-relaxed font-medium">"{analysis.simplifiedRiskSummary}"</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="text-[10px] font-bold text-scan-text-muted uppercase tracking-widest flex items-center gap-2">
                      ANALYSE D'IMPACT BUSINESS
                    </h5>
                    <p className="text-sm text-scan-text leading-relaxed italic italic font-light">"{analysis.businessImpactSummary}"</p>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-scan-border">
                    <h5 className="text-[10px] font-bold text-scan-text-muted uppercase tracking-widest">Plan de Remédiation</h5>
                    {[
                      { label: 'Phase Prioritaire', items: analysis.remediationRoadmap.immediate, color: 'text-rose-500' },
                      { label: 'Stratégie Court Terme', items: analysis.remediationRoadmap.shortTerm, color: 'text-scan-text' },
                    ].map((phase, i) => phase.items.length > 0 && (
                      <div key={i} className="space-y-3">
                        <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${phase.color}`}>{phase.label}</p>
                        <ul className="space-y-2">
                          {phase.items.map((item, j) => (
                            <li key={j} className="text-xs text-scan-text-muted flex gap-3 leading-tight">
                              <span className="text-indigo-600 font-bold shrink-0">→</span> {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-600 text-center py-8 italic font-light opacity-60">Terminez un scan pour générer une intelligence contextuelle.</p>
              )}
            </Card>

            <Card title="Métriques du Scan" icon={Activity}>
              <div className="space-y-4">
                {[
                  { label: 'Durée Totale', value: `${(scan.duration / 1000).toFixed(2)}s` },
                  { label: 'Endpoints Analysés', value: scan.endpoints.length },
                  { label: 'Niveau de Précision', value: 'Haute-Fidélité (DeepScan)' },
                  { label: 'Moteur Actif', value: 'Horus Engine v2.4' }
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-scan-text-muted font-bold text-[10px] uppercase tracking-wider">{m.label}</span>
                    <span className="font-mono text-scan-text font-black text-xs">{m.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const LogsView = ({ logs }: { logs: any[] }) => {
  const [selectedLog, setSelectedLog] = useState<any>(null);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Badge>Real-time Access Monitoring</Badge>
          <h2 className="text-4xl font-light text-scan-text tracking-tighter mt-2 uppercase">System <span className="text-indigo-500">Logs</span></h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Capture Enabled</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Traffic Stream" icon={Terminal}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-scan-border text-[10px] text-scan-text-muted uppercase tracking-widest text-left">
                    <th className="pb-4 px-4 font-black">Timestamp</th>
                    <th className="pb-4 px-4 font-black">Event Type</th>
                    <th className="pb-4 px-4 font-black">Source</th>
                    <th className="pb-4 px-4 font-black text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-scan-border/30">
                  {logs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`group hover:bg-white/5 transition-colors cursor-pointer ${selectedLog?.id === log.id ? 'bg-indigo-600/5 shadow-inner' : ''}`}
                    >
                      <td className="py-4 px-4 text-[10px] font-mono text-scan-text-muted">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold ${log.result === 'Blocked' ? 'text-rose-500' : 'text-amber-500'}`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[10px] font-mono text-scan-text-muted">
                        {log.source}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="p-1 px-3 text-[9px] uppercase font-black text-scan-text-muted group-hover:text-indigo-400 group-hover:bg-indigo-400/10 rounded-lg transition-all border border-transparent group-hover:border-indigo-500/20">
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-scan-text-muted italic">
                        No active security events detected in the current cycle.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Inspector Core" icon={Cpu} className="border-indigo-600/20">
            {selectedLog ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Protocol Header</span>
                  <h3 className="text-lg font-bold text-scan-text leading-tight">{selectedLog.type}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-scan-surface shadow-inner border border-scan-border/30 rounded-xl border border-scan-border">
                    <p className="text-[9px] text-scan-text-muted font-bold uppercase mb-1">Status</p>
                    <p className={`text-[10px] font-black ${selectedLog.result === 'Blocked' ? 'text-rose-500' : 'text-amber-500'}`}>
                      {selectedLog.result.toUpperCase()}
                    </p>
                  </div>
                  <div className="p-3 bg-scan-surface shadow-inner border border-scan-border/30 rounded-xl border border-scan-border">
                    <p className="text-[9px] text-scan-text-muted font-bold uppercase mb-1">Origin</p>
                    <p className="text-[10px] font-mono text-scan-text">{selectedLog.source}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] text-scan-text-muted font-bold uppercase">Requested Resource</p>
                  <p className="text-[10px] font-mono bg-scan-surface shadow-inner border border-scan-border/30 p-2 rounded-lg border border-scan-border text-indigo-300 break-all">
                    {selectedLog.target}
                  </p>
                </div>

                <div className="p-4 bg-indigo-600/5 border border-indigo-600/20 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Automated Mitigation</span>
                  </div>
                  <p className="text-xs text-scan-text leading-relaxed italic">
                    "{selectedLog.solution}"
                  </p>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mt-4 flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em] cursor-pointer group-hover:text-indigo-400"
                  >
                    Deploy Defense Patch <ChevronRight className="w-3 h-3" />
                  </motion.div>
                </div>

                <div className="pt-4 border-t border-scan-border">
                  <p className="text-[9px] text-scan-text-muted opacity-50 font-mono">Captured: {new Date(selectedLog.timestamp).toISOString()}</p>
                </div>
              </div>
            ) : (
              <div className="py-24 text-center space-y-4">
                <div className="w-12 h-12 bg-scan-surface/40 shadow-inner rounded-full flex items-center justify-center mx-auto text-scan-text-muted opacity-50">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-xs text-scan-text-muted">Select a stream event to initialize deep packet inspection.</p>
              </div>
            )}
          </Card>

          <Card title="Monitoring Metrics" icon={BarChart3}>
            <div className="space-y-4">
              {[
                { label: 'Ingress PPS', value: '142.4', trend: '+12%' },
                { label: 'Auth Failures', value: logs.filter(l => l.type.includes('Force')).length, trend: 'Stable' },
                { label: 'Injection Probes', value: logs.filter(l => l.type.includes('SQL') || l.type.includes('XSS')).length, trend: 'Warning' },
                { label: 'System Uptime', value: '99.99%', trend: 'Nominal' }
              ].map((m, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-scan-text-muted text-xs">{m.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-scan-text text-xs font-bold">{m.value}</span>
                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${m.trend.includes('+') || m.trend === 'Warning' ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'
                      }`}>
                      {m.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const AuthPage = ({ onAuthSuccess, theme, toggleTheme }: any) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin
        ? { identity: username, password }
        : { username, email, password };
      const res = await api.post(endpoint, payload);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      onAuthSuccess(res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-scan-bg text-scan-text transition-colors duration-300">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(79,70,229,0.15),transparent_60%)] -z-10"></div>
      <Card className="w-full max-w-md p-10 bg-scan-surface border-scan-border backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent"></div>
        <div className="text-center mb-10 space-y-3">
          <div className="mx-auto w-14 h-14 bg-indigo-600 rounded-xl flex items-center justify-center text-scan-text shadow-xl shadow-indigo-900/40 mb-6">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-scan-text uppercase tracking-[0.2em]">HorusSight</h1>
          <p className="text-scan-text-muted text-sm font-black tracking-[0.2em]">{isLogin ? 'SECURE NODE AUTHENTICATION' : 'INITIALIZE ANALYST PROFILE'}</p>
        </div>

        <div className="absolute top-6 right-6">
          <button
            onClick={toggleTheme}
            className="p-2 text-scan-text-muted hover:text-scan-accent transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">{error}</div>}

          <div className="space-y-2">
            <label className="text-sm font-black text-scan-text-muted uppercase tracking-[0.2em] pl-6">
              {isLogin ? "Identifiant (Nom ou Email)" : "Nom d'utilisateur / Username"}
            </label>
            <input
              type="text"
              className="w-full bg-scan-bg border-2 border-scan-border rounded-[2rem] px-8 py-5 text-scan-text focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-base shadow-inner"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder={isLogin ? "Ex: alpha_user" : "Choisissez un nom simple"}
            />
          </div>

          {!isLogin && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
              <label className="text-sm font-black text-scan-text-muted uppercase tracking-[0.2em] pl-6">Email (Facultatif / Optional)</label>
              <input
                type="email"
                className="w-full bg-scan-bg border-2 border-scan-border rounded-[2rem] px-8 py-5 text-scan-text focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-base shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: mail@test.com (optionnel)"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-scan-text-muted uppercase tracking-widest pl-4">Code / Mot de passe</label>
            <input
              type="password"
              className="w-full bg-scan-bg border border-scan-border rounded-full px-6 py-3 text-scan-text focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Chiffres ou Lettres"
            />
          </div>

          <Button className="w-full py-4 uppercase tracking-[0.2em] text-xs font-black pt-4" loading={loading}>
            {isLogin ? 'ACCÉDER / LOGIN' : 'CRÉER COMPTE / START'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[10px] text-scan-text-muted hover:text-indigo-400 transition-colors uppercase tracking-widest font-bold"
          >
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </Card>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState('landing');
  const [theme, setTheme] = useState('dark');
  const [scans, setScans] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const [init, setInit] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [scanLoading, setScanLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const savedTheme = localStorage.getItem('theme') || 'dark';

    setTheme(savedTheme);
    if (savedTheme === 'light') document.documentElement.classList.add('light');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setView('dashboard');
      fetchData();
    }
    setInit(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const fetchData = async () => {
    try {
      const [scansRes, logsRes] = await Promise.all([
        api.get('/scans'),
        api.get('/security-logs')
      ]);
      setScans(scansRes.data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      setSecurityLogs(logsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartScan = async (url: string, guestMode?: boolean) => {
    const effectiveIsGuest = guestMode ?? isGuest;
    setScanLoading(true);
    try {
      const endpoint = effectiveIsGuest ? '/scans' : '/scans';
      const res = await api.post(endpoint, { url });
      if (!effectiveIsGuest) fetchData();
      setActiveScanId(res.data.id);
      setView('report');
    } catch (err) {
      console.error(err);
    } finally {
      setScanLoading(false);
    }
  };

  const handleGuestScan = (url: string) => {
    setIsGuest(true);
    handleStartScan(url, true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsGuest(false);
    setScans([]);
    setSecurityLogs([]);
    setView('landing');
  };

  if (!init) return null;

  if (view === 'landing' && !user) {
    return <LandingPage onGuestScan={handleGuestScan} scanLoading={scanLoading} onLogin={() => setView('login')} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (view === 'login' && !user) {
    return <AuthPage onAuthSuccess={(u: any) => { setUser(u); setView('dashboard'); fetchData(); }} theme={theme} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="flex h-screen bg-scan-bg text-scan-text overflow-hidden font-sans transition-colors duration-300">
      {/* Sidebar - Only if not guest */}
      {!isGuest && (
        <aside className="w-72 border-r border-scan-border bg-scan-surface hidden lg:flex flex-col shadow-2xl z-20">
          <div className="p-8">
            <div className="flex items-center gap-4 text-scan-text mb-12 px-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-scan-text shadow-xl shadow-indigo-900/40 transform rotate-3">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-black text-xl tracking-[0.15em] uppercase">HorusSight</span>
            </div>

            <nav className="space-y-2">
              {[
                { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
                { id: 'new-scan', label: 'Attack Simulation', icon: Search },
                { id: 'logs', label: 'System Logs', icon: Terminal },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative group ${view === item.id || (view === 'report' && item.id === 'dashboard')
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                      : 'text-scan-text-muted hover:text-scan-text hover:bg-slate-800'
                    }`}
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
                  {item.id === 'logs' && (
                    <span className="absolute right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="mt-8 pt-8 border-t border-scan-border">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-scan-bg border border-scan-border hover:border-scan-accent transition-all group"
              >
                <div className="flex items-center gap-4">
                  {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
                  <span className="font-bold text-xs uppercase tracking-widest">{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
                </div>
                <div className="w-8 h-4 bg-scan-border rounded-full relative">
                  <motion.div
                    animate={{ x: theme === 'dark' ? 0 : 16 }}
                    className="absolute top-1 left-1 w-2 h-2 bg-scan-accent rounded-full"
                  />
                </div>
              </button>
            </div>
          </div>

          <div className="mt-auto p-8 space-y-6">
            <div className="p-5 bg-scan-surface/50 border border-scan-border rounded-3xl space-y-4 shadow-inner">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-sm font-black text-scan-text shadow-lg">
                  {user?.username ? user.username[0].toUpperCase() : 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate text-scan-text uppercase tracking-widest">{user?.username || 'ANONYMOUS'}</p>
                  <p className="text-xs text-scan-text-muted truncate font-mono font-black uppercase tracking-widest">OPERATIVE ALPHA</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-scan-text-muted hover:text-rose-500 bg-scan-surface shadow-inner border border-scan-border/30 rounded-xl border border-scan-border transition-all hover:bg-rose-500/5 hover:border-rose-500/20"
              >
                <LogOut className="w-3.5 h-3.5" /> Terminate Link
              </button>
            </div>
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] text-scan-text-muted opacity-50 font-black uppercase tracking-widest">Ghost v2.4</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest">Nominal</span>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-full bg-scan-bg">
        {/* Mobile Header */}
        <header className="lg:hidden p-6 border-b border-scan-border flex items-center justify-between sticky top-0 bg-scan-bg/90 backdrop-blur-xl z-50">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-indigo-600" />
            <span className="font-black uppercase tracking-widest">HorusSight</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-scan-text-muted hover:text-scan-accent transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
            <button onClick={handleLogout} className="p-2 text-scan-text-muted hover:text-scan-text transition-colors">
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Guest Return Header */}
        {isGuest && (
          <header className="p-4 bg-indigo-600 flex items-center justify-between text-scan-text shadow-xl z-50 animate-in slide-in-from-top duration-500">
            <div className="flex items-center gap-4">
              <Shield className="w-6 h-6" />
              <p className="text-xs font-bold uppercase tracking-widest">Scanning as Guest Operative</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => window.location.reload()} className="text-[10px] font-black uppercase tracking-widest border border-white/30 px-4 py-2 rounded-full hover:bg-white hover:text-indigo-600 transition-all">Sign Up for Full Intel</button>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-4 py-2 rounded-full shadow-lg">Exit</button>
            </div>
          </header>
        )}

        <div className="max-w-[1700px] mx-auto p-6 md:p-14 xl:px-24 xl:py-16 relative">
          {/* Floating Luxury Theme Toggle */}
          <div className="fixed bottom-8 right-8 z-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="bg-scan-surface/40 backdrop-blur-2xl border border-scan-border p-1.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-2 group transition-all hover:border-scan-accent/50"
            >
              <div className="w-10 h-10 rounded-full bg-scan-bg flex items-center justify-center text-scan-accent shadow-inner">
                {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
              </div>
              <div className="pr-4 hidden group-hover:block animate-in fade-in slide-in-from-right-2 duration-300">
                <p className="text-[10px] font-black uppercase tracking-tighter text-scan-text">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </p>
              </div>
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Dashboard
                  scans={scans}
                  logs={securityLogs}
                  isGuest={isGuest}
                  setView={setView}
                  onSelectScan={(id: number) => { setActiveScanId(id); setView('report'); }}
                  onNewScan={() => setView('new-scan')}
                />
              </motion.div>
            )}

            {view === 'new-scan' && (
              <motion.div
                key="new-scan"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <NewScan onStartScan={handleStartScan} loading={scanLoading} />
              </motion.div>
            )}

            {view === 'logs' && (
              <motion.div
                key="logs"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LogsView logs={securityLogs} />
              </motion.div>
            )}

            {view === 'report' && activeScanId && (
              <motion.div
                key="report"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ReportView
                  scanId={activeScanId}
                  isGuest={isGuest}
                  onBack={() => {
                    if (isGuest) {
                      setIsGuest(false);
                      setView('landing');
                    } else {
                      setView('dashboard');
                      fetchData();
                    }
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
