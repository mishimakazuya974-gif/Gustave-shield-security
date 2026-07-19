import { useState, useEffect, createContext, useContext } from "react";
import {
  Shield, ShieldAlert, ShieldCheck, AlertTriangle,
  CheckCircle2, XCircle, Loader2, ScanLine, KeyRound, Video, CloudOff,
  ChevronRight, RotateCcw, Globe, Check
} from "lucide-react";

// ---------- i18n ----------

const LANGS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
];

const T = {
  fr: {
    appName: "GUSTAVE SECURITY SHIELD",
    tagline: "Protection multi-menaces",
    sessionActive: "SESSION ACTIVE",
    back: "← Retour au tableau de bord",
    footer: "Outil pédagogique de sensibilisation — ne remplace pas un audit de sécurité professionnel.",
    globalVigilance: "NIVEAU DE VIGILANCE GLOBAL",
    heroTitle: "Quatre couches de défense, un seul tableau de bord.",
    heroBody: "Chaque module s'entraîne indépendamment : analyse un message suspect, teste un mot de passe, entraîne ton œil aux deepfakes, ou vérifie tes réflexes face au Shadow IA. Ton score global se met à jour à chaque passage.",
    notTested: "NON TESTÉ",
    openModule: "Ouvrir le module",
    modules: { scanner: "Scanner de menace", password: "Mot de passe", deepfake: "Deepfake", shadowia: "Shadow IA" },
    scanner: {
      subtitle: "Colle un email, un SMS ou une URL suspecte pour une analyse instantanée.",
      placeholder: "Ex : « Votre colis est bloqué, cliquez ici pour payer les frais de douane : bit.ly/xxxxx »",
      analyze: "Analyser",
      analyzing: "Analyse en cours…",
      error: "Analyse impossible pour le moment. Réessaie dans un instant.",
      riskLabel: (lvl) => `Risque ${lvl}`,
      threatScore: "Score de menace",
      recommendation: "Recommandation",
      levels: { faible: "faible", moyen: "moyen", élevé: "élevé" },
    },
    password: {
      subtitle: "Analyse 100% locale — rien n'est envoyé ni enregistré.",
      placeholder: "Teste un mot de passe ici…",
      noIssues: "Aucun problème détecté sur les critères de base.",
      labels: { none: "—", vlow: "Très faible", low: "Faible", good: "Bon", excellent: "Excellent" },
      flags: {
        length: "Moins de 12 caractères", case: "Manque de majuscules/minuscules mélangées",
        digit: "Aucun chiffre", symbol: "Aucun symbole (!?@#...)",
        repeat: "Caractères répétés consécutifs", common: "Contient un mot très courant (facile à deviner)",
      },
    },
    deepfake: {
      subtitle: "Repère les scénarios à risque parmi des situations réalistes.",
      situation: (i, n) => `SITUATION ${i}/${n}`,
      alertBtn: "Signal d'alerte", normalBtn: "Situation normale",
      correct: "Bonne réponse", incorrect: "Pas tout à fait",
      next: "Situation suivante", seeScore: "Voir mon score",
      resultBody: (c, n) => `${c}/${n} bonnes réponses. Le meilleur réflexe reste de vérifier par un second canal (rappeler sur un numéro connu) avant toute action sensible.`,
      restart: "Recommencer",
      quiz: [
        { q: "Un \"directeur\" t'appelle en urgence par téléphone pour demander un virement immédiat, sans passer par les canaux habituels.", correct: true, tip: "Vrai signal d'alerte : l'urgence + le contournement des procédures est la base de la fraude au deepfake vocal." },
        { q: "Une vidéo d'une personnalité annonce un investissement garanti \"sans risque\" avec des gains rapides.", correct: true, tip: "Vrai signal d'alerte : les promesses de gains garantis sont un classique du deepfake utilisé pour l'arnaque financière." },
        { q: "Un ami t'envoie un message texte classique disant qu'il sera en retard.", correct: false, tip: "Pas un signal en soi : un simple texto de routine, sans urgence ni demande sensible, n'a rien d'anormal." },
        { q: "Lors d'un appel vidéo, l'interlocuteur a un léger décalage entre les lèvres et le son, ou un regard qui ne cligne presque jamais.", correct: true, tip: "Vrai signal d'alerte : ce sont des artefacts techniques fréquents des vidéos synthétiques actuelles." },
      ],
    },
    shadowia: {
      subtitle: "Coche les pratiques que tu appliques déjà. Les pratiques à risque doivent rester décochées.",
      riskWarning: "⚠ Pratique à risque — à éviter",
      checklist: [
        { text: "Coller des données clients ou des secrets d'entreprise dans un chatbot IA public pour \"gagner du temps\"", bad: true },
        { text: "Vérifier la politique de confidentialité d'un outil IA avant d'y importer des documents sensibles", bad: false },
        { text: "Utiliser un outil IA non validé par l'équipe pour traiter des données RH ou financières", bad: true },
        { text: "Anonymiser ou remplacer les données sensibles avant de les soumettre à une IA", bad: false },
        { text: "Partager un identifiant/mot de passe avec un assistant IA pour qu'il \"se connecte à ta place\"", bad: true },
      ],
    },
  },

  en: {
    appName: "GUSTAVE SECURITY SHIELD",
    tagline: "Multi-threat protection",
    sessionActive: "SESSION ACTIVE",
    back: "← Back to dashboard",
    footer: "Awareness tool — not a substitute for a professional security audit.",
    globalVigilance: "GLOBAL VIGILANCE LEVEL",
    heroTitle: "Four layers of defense, one dashboard.",
    heroBody: "Each module trains independently: analyze a suspicious message, test a password, sharpen your eye for deepfakes, or check your Shadow AI reflexes. Your overall score updates every time.",
    notTested: "NOT TESTED",
    openModule: "Open module",
    modules: { scanner: "Threat scanner", password: "Password", deepfake: "Deepfake", shadowia: "Shadow AI" },
    scanner: {
      subtitle: "Paste a suspicious email, SMS, or URL for an instant analysis.",
      placeholder: "E.g.: \"Your package is on hold, click here to pay customs fees: bit.ly/xxxxx\"",
      analyze: "Analyze", analyzing: "Analyzing…",
      error: "Analysis unavailable right now. Try again in a moment.",
      riskLabel: (lvl) => `${lvl} risk`,
      threatScore: "Threat score", recommendation: "Recommendation",
      levels: { faible: "low", moyen: "medium", élevé: "high" },
    },
    password: {
      subtitle: "100% local analysis — nothing is sent or stored.",
      placeholder: "Test a password here…",
      noIssues: "No issues detected on the basic criteria.",
      labels: { none: "—", vlow: "Very weak", low: "Weak", good: "Good", excellent: "Excellent" },
      flags: {
        length: "Less than 12 characters", case: "Missing mixed upper/lowercase letters",
        digit: "No digits", symbol: "No symbols (!?@#...)",
        repeat: "Consecutive repeated characters", common: "Contains a very common word (easy to guess)",
      },
    },
    deepfake: {
      subtitle: "Spot risky scenarios among realistic situations.",
      situation: (i, n) => `SITUATION ${i}/${n}`,
      alertBtn: "Red flag", normalBtn: "Normal situation",
      correct: "Correct", incorrect: "Not quite",
      next: "Next situation", seeScore: "See my score",
      resultBody: (c, n) => `${c}/${n} correct answers. The best reflex is always to verify through a second channel (call back on a known number) before any sensitive action.`,
      restart: "Restart",
      quiz: [
        { q: "A \"director\" calls you urgently asking for an immediate wire transfer, bypassing the usual channels.", correct: true, tip: "Real red flag: urgency + bypassing procedures is the basis of voice deepfake fraud." },
        { q: "A video of a public figure announces a \"risk-free\" guaranteed investment with fast returns.", correct: true, tip: "Real red flag: guaranteed-return promises are a classic deepfake used for financial scams." },
        { q: "A friend sends you a routine text saying they'll be late.", correct: false, tip: "Not a red flag on its own: a routine text with no urgency or sensitive request is nothing unusual." },
        { q: "During a video call, the person has a slight lip-sync delay, or almost never blinks.", correct: true, tip: "Real red flag: these are common technical artifacts of current synthetic video." },
      ],
    },
    shadowia: {
      subtitle: "Check the practices you already follow. Risky practices should stay unchecked.",
      riskWarning: "⚠ Risky practice — avoid this",
      checklist: [
        { text: "Pasting customer data or company secrets into a public AI chatbot to \"save time\"", bad: true },
        { text: "Checking an AI tool's privacy policy before uploading sensitive documents to it", bad: false },
        { text: "Using an AI tool not approved by the team to process HR or financial data", bad: true },
        { text: "Anonymizing or replacing sensitive data before submitting it to an AI", bad: false },
        { text: "Sharing a login/password with an AI assistant so it can \"log in for you\"", bad: true },
      ],
    },
  },

  es: {
    appName: "GUSTAVE SECURITY SHIELD",
    tagline: "Protección multi-amenaza",
    sessionActive: "SESIÓN ACTIVA",
    back: "← Volver al panel",
    footer: "Herramienta educativa — no sustituye una auditoría de seguridad profesional.",
    globalVigilance: "NIVEL DE VIGILANCIA GLOBAL",
    heroTitle: "Cuatro capas de defensa, un solo panel.",
    heroBody: "Cada módulo se entrena de forma independiente: analiza un mensaje sospechoso, prueba una contraseña, agudiza tu ojo para los deepfakes o revisa tus reflejos frente a la IA en la sombra. Tu puntuación global se actualiza cada vez.",
    notTested: "SIN PROBAR",
    openModule: "Abrir módulo",
    modules: { scanner: "Escáner de amenazas", password: "Contraseña", deepfake: "Deepfake", shadowia: "IA en la sombra" },
    scanner: {
      subtitle: "Pega un correo, SMS o URL sospechosa para un análisis instantáneo.",
      placeholder: "Ej.: «Tu paquete está retenido, haz clic aquí para pagar aduanas: bit.ly/xxxxx»",
      analyze: "Analizar", analyzing: "Analizando…",
      error: "Análisis no disponible por ahora. Inténtalo de nuevo en un momento.",
      riskLabel: (lvl) => `Riesgo ${lvl}`,
      threatScore: "Puntuación de riesgo", recommendation: "Recomendación",
      levels: { faible: "bajo", moyen: "medio", élevé: "alto" },
    },
    password: {
      subtitle: "Análisis 100% local — no se envía ni se guarda nada.",
      placeholder: "Prueba una contraseña aquí…",
      noIssues: "No se detectaron problemas en los criterios básicos.",
      labels: { none: "—", vlow: "Muy débil", low: "Débil", good: "Buena", excellent: "Excelente" },
      flags: {
        length: "Menos de 12 caracteres", case: "Faltan mayúsculas y minúsculas combinadas",
        digit: "Sin números", symbol: "Sin símbolos (!?@#...)",
        repeat: "Caracteres repetidos consecutivos", common: "Contiene una palabra muy común (fácil de adivinar)",
      },
    },
    deepfake: {
      subtitle: "Detecta escenarios de riesgo entre situaciones realistas.",
      situation: (i, n) => `SITUACIÓN ${i}/${n}`,
      alertBtn: "Señal de alerta", normalBtn: "Situación normal",
      correct: "Respuesta correcta", incorrect: "No exactamente",
      next: "Siguiente situación", seeScore: "Ver mi puntuación",
      resultBody: (c, n) => `${c}/${n} respuestas correctas. El mejor reflejo siempre es verificar por un segundo canal (llamar a un número conocido) antes de cualquier acción sensible.`,
      restart: "Reiniciar",
      quiz: [
        { q: "Un \"director\" te llama con urgencia pidiendo una transferencia inmediata, saltándose los canales habituales.", correct: true, tip: "Señal real: la urgencia + saltarse los procedimientos es la base del fraude por deepfake de voz." },
        { q: "Un video de una figura pública anuncia una inversión \"sin riesgo\" con ganancias rápidas garantizadas.", correct: true, tip: "Señal real: las promesas de ganancias garantizadas son un clásico del deepfake usado para estafas financieras." },
        { q: "Un amigo te envía un mensaje de texto normal diciendo que llegará tarde.", correct: false, tip: "No es una señal por sí sola: un mensaje rutinario sin urgencia ni petición sensible no tiene nada de anormal." },
        { q: "En una videollamada, la persona tiene un ligero desfase entre labios y sonido, o casi nunca parpadea.", correct: true, tip: "Señal real: son artefactos técnicos frecuentes en los vídeos sintéticos actuales." },
      ],
    },
    shadowia: {
      subtitle: "Marca las prácticas que ya sigues. Las prácticas de riesgo deben quedar sin marcar.",
      riskWarning: "⚠ Práctica de riesgo — evítala",
      checklist: [
        { text: "Pegar datos de clientes o secretos de la empresa en un chatbot de IA público para \"ganar tiempo\"", bad: true },
        { text: "Revisar la política de privacidad de una herramienta de IA antes de subir documentos sensibles", bad: false },
        { text: "Usar una herramienta de IA no aprobada por el equipo para procesar datos de RRHH o financieros", bad: true },
        { text: "Anonimizar o sustituir los datos sensibles antes de enviarlos a una IA", bad: false },
        { text: "Compartir una contraseña con un asistente de IA para que \"inicie sesión por ti\"", bad: true },
      ],
    },
  },
};

const LangContext = createContext({ lang: "fr", t: T.fr, setLang: () => {} });
const useLang = () => useContext(LangContext);

// ---------- helpers ----------

const MODULE_IDS = ["scanner", "password", "deepfake", "shadowia"];
const MODULE_META = {
  scanner: { icon: ScanLine, color: "#F2A93B" },
  password: { icon: KeyRound, color: "#3ED598" },
  deepfake: { icon: Video, color: "#7C9CFF" },
  shadowia: { icon: CloudOff, color: "#E9738F" },
};

function scorePassword(pw) {
  if (!pw) return { score: 0, labelKey: "none", flagKeys: [] };
  let score = 0;
  const flagKeys = [];
  if (pw.length >= 12) score += 30; else flagKeys.push("length");
  if (pw.length >= 16) score += 10;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 15; else flagKeys.push("case");
  if (/[0-9]/.test(pw)) score += 15; else flagKeys.push("digit");
  if (/[^A-Za-z0-9]/.test(pw)) score += 20; else flagKeys.push("symbol");
  if (!/(.)\1\1/.test(pw)) score += 5; else flagKeys.push("repeat");
  const common = ["password", "123456", "azerty", "qwerty", "motdepasse", "cameroun", "admin", "letmein"];
  if (common.some(c => pw.toLowerCase().includes(c))) { score -= 30; flagKeys.push("common"); }
  score = Math.max(0, Math.min(100, score));
  let labelKey = "vlow";
  if (score >= 80) labelKey = "excellent";
  else if (score >= 60) labelKey = "good";
  else if (score >= 35) labelKey = "low";
  return { score, labelKey, flagKeys };
}

// ---------- shared components ----------

function ScoreRing({ value, size = 120, color = "#F2A93B" }) {
  const r = (size - 14) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1E2A44" strokeWidth="10" />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <text x="50%" y="52%" textAnchor="middle" fill="#E8ECF4" fontSize={size * 0.24} fontFamily="'JetBrains Mono', monospace" fontWeight="700">
        {value}
      </text>
    </svg>
  );
}

function ModuleHeader({ icon: Icon, color, title, subtitle }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="text-sm mt-1" style={{ color: "#8590A6" }}>{subtitle}</p>
      </div>
    </div>
  );
}

function LanguageMenu() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const current = LANGS.find(l => l.code === lang);

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="lang-trigger flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono" style={{ border: "1px solid #1E2A44", color: "#B4BDD1" }}>
        <Globe size={14} />
        {current.code.toUpperCase()}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-40 rounded-lg overflow-hidden z-20" style={{ background: "#131B2E", border: "1px solid #1E2A44" }}>
            {LANGS.map(l => (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} className="lang-option w-full flex items-center justify-between px-3 py-2.5 text-sm text-left" style={{ color: l.code === lang ? "#F2A93B" : "#E8ECF4" }}>
                {l.label}
                {l.code === lang && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------- main app ----------

function AppShell() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState("home");
  const [status, setStatus] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gss-status");
      if (saved) setStatus(JSON.parse(saved));
    } catch (e) { /* no saved state yet */ }
  }, []);

  const saveStatus = (next) => {
    setStatus(next);
    try { localStorage.setItem("gss-status", JSON.stringify(next)); } catch (e) {}
  };

  const globalScore = Math.round(
    MODULE_IDS.reduce((sum, id) => sum + (status[id]?.score ?? 0), 0) / MODULE_IDS.length
  );

  return (
    <div style={{ background: "#0B1220", minHeight: "100vh", fontFamily: "'Inter', sans-serif", color: "#E8ECF4" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        ::selection { background: #F2A93B; color: #0B1220; }
        .module-card { transition: background 0.15s ease, transform 0.15s ease; }
        .module-card:hover { background: #17223B; }
        .back-btn { transition: color 0.15s ease; }
        .back-btn:hover { color: #ffffff; }
        .quiz-btn-alert { transition: background 0.15s ease; }
        .quiz-btn-alert:hover { background: #E94F4F33; }
        .quiz-btn-normal { transition: background 0.15s ease; }
        .quiz-btn-normal:hover { background: #3ED59833; }
        .input-amber { transition: border-color 0.15s ease; }
        .input-amber:focus { border-color: #F2A93B; }
        .input-green { transition: border-color 0.15s ease; }
        .input-green:focus { border-color: #3ED598; }
        .analyze-btn { transition: opacity 0.15s ease; }
        .analyze-btn:not(:disabled):hover { opacity: 0.9; }
        .restart-btn { transition: border-color 0.15s ease, color 0.15s ease; }
        .restart-btn:hover { border-color: #4A5674; color: #E8ECF4; }
        .lang-trigger { transition: border-color 0.15s ease; }
        .lang-trigger:hover { border-color: #4A5674; }
        .lang-option { transition: background 0.15s ease; }
        .lang-option:hover { background: #1E2A44; }
      `}</style>

      <header className="border-b" style={{ borderColor: "#1E2A44" }}>
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={() => setTab("home")} className="flex items-center gap-3">
            <Shield size={26} style={{ color: "#F2A93B" }} />
            <div className="text-left">
              <div className="font-display font-semibold text-base leading-none">{t.appName}</div>
              <div className="text-xs mt-1" style={{ color: "#8590A6" }}>{t.tagline}</div>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 font-mono text-xs" style={{ color: "#8590A6" }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#3ED598" }} />
              {t.sessionActive}
            </div>
            <LanguageMenu />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-8" key={lang}>
        {tab === "home" && <HomeView status={status} globalScore={globalScore} onNavigate={setTab} />}
        {tab === "scanner" && <ScannerView onComplete={(s) => saveStatus({ ...status, scanner: s })} />}
        {tab === "password" && <PasswordView onComplete={(s) => saveStatus({ ...status, password: s })} />}
        {tab === "deepfake" && <DeepfakeView onComplete={(s) => saveStatus({ ...status, deepfake: s })} />}
        {tab === "shadowia" && <ShadowIAView onComplete={(s) => saveStatus({ ...status, shadowia: s })} />}

        {tab !== "home" && (
          <button onClick={() => setTab("home")} className="back-btn mt-8 text-sm flex items-center gap-1" style={{ color: "#8590A6" }}>
            {t.back}
          </button>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-5 py-10 text-xs text-center border-t mt-12" style={{ color: "#4A5674", borderColor: "#1E2A44" }}>
        {t.footer}
      </footer>
    </div>
  );
}

export default function App() {
  const [lang, setLangState] = useState("fr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("gss-lang");
      if (saved && T[saved]) setLangState(saved);
    } catch (e) {}
  }, []);

  const setLang = (code) => {
    setLangState(code);
    try { localStorage.setItem("gss-lang", code); } catch (e) {}
  };

  return (
    <LangContext.Provider value={{ lang, t: T[lang], setLang }}>
      <AppShell />
    </LangContext.Provider>
  );
}

// ---------- home / dashboard ----------

function HomeView({ status, globalScore, onNavigate }) {
  const { t } = useLang();
  return (
    <div>
      <section className="grid md:grid-cols-[auto,1fr] gap-8 items-center mb-12">
        <div className="flex justify-center">
          <ScoreRing value={globalScore || 0} size={140} color={globalScore >= 70 ? "#3ED598" : globalScore >= 40 ? "#F2A93B" : "#E94F4F"} />
        </div>
        <div>
          <div className="font-mono text-xs mb-2" style={{ color: "#8590A6" }}>{t.globalVigilance}</div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold mb-3">{t.heroTitle}</h1>
          <p className="text-sm leading-relaxed" style={{ color: "#B4BDD1" }}>{t.heroBody}</p>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        {MODULE_IDS.map((id) => {
          const { icon: Icon, color } = MODULE_META[id];
          const s = status[id];
          return (
            <button key={id} onClick={() => onNavigate(id)} className="module-card text-left p-5 rounded-xl border hover:-translate-y-0.5" style={{ borderColor: "#1E2A44", background: "#131B2E" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}22` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                {s ? (
                  <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: "#1E2A44", color }}>{s.score}/100</span>
                ) : (
                  <span className="font-mono text-xs" style={{ color: "#4A5674" }}>{t.notTested}</span>
                )}
              </div>
              <div className="font-display font-semibold text-base mb-1">{t.modules[id]}</div>
              <div className="text-xs flex items-center gap-1" style={{ color: "#8590A6" }}>
                {t.openModule} <ChevronRight size={14} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- scanner (calls the Netlify function, not Anthropic directly) ----------

function ScannerView({ onComplete }) {
  const { t, lang } = useLang();
  const s = t.scanner;
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, lang }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "API error");
      const text = data?.choices?.[0]?.message?.content || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      onComplete({ score: 100 - parsed.risk_score, lastRun: Date.now() });
    } catch (e) {
      setError(s.error);
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result ? (result.risk_level === "élevé" ? "#E94F4F" : result.risk_level === "moyen" ? "#F2A93B" : "#3ED598") : "#F2A93B";
  const riskLabel = result ? (s.levels[result.risk_level] || result.risk_level) : "";

  return (
    <div>
      <ModuleHeader icon={ScanLine} color="#F2A93B" title={t.modules.scanner} subtitle={s.subtitle} />

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={s.placeholder}
        rows={6}
        className="input-amber w-full rounded-lg p-4 text-sm outline-none resize-none"
        style={{ background: "#131B2E", border: "1px solid #1E2A44", color: "#E8ECF4" }}
      />

      <button onClick={analyze} disabled={loading || !input.trim()} className="analyze-btn mt-3 px-5 py-2.5 rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-40" style={{ background: "#F2A93B", color: "#0B1220" }}>
        {loading ? <><Loader2 size={16} className="animate-spin" /> {s.analyzing}</> : s.analyze}
      </button>

      {error && <p className="mt-4 text-sm" style={{ color: "#E94F4F" }}>{error}</p>}

      {result && (
        <div className="mt-6 p-5 rounded-xl" style={{ background: "#131B2E", border: `1px solid ${riskColor}44` }}>
          <div className="flex items-center gap-3 mb-4">
            {result.risk_level === "élevé" ? <ShieldAlert size={22} style={{ color: riskColor }} /> : result.risk_level === "moyen" ? <AlertTriangle size={22} style={{ color: riskColor }} /> : <ShieldCheck size={22} style={{ color: riskColor }} />}
            <div>
              <div className="font-display font-semibold" style={{ color: riskColor }}>{s.riskLabel(riskLabel)}</div>
              <div className="font-mono text-xs" style={{ color: "#8590A6" }}>{s.threatScore}: {result.risk_score}/100</div>
            </div>
          </div>
          <p className="text-sm mb-4" style={{ color: "#B4BDD1" }}>{result.explanation}</p>
          {result.red_flags?.length > 0 && (
            <ul className="mb-4 space-y-1.5">
              {result.red_flags.map((f, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5 shrink-0" style={{ color: riskColor }} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-3 text-sm" style={{ borderTop: "1px solid #1E2A44" }}>
            <span className="font-medium">{s.recommendation}: </span>{result.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- password ----------

function PasswordView({ onComplete }) {
  const { t } = useLang();
  const s = t.password;
  const [pw, setPw] = useState("");
  const { score, labelKey, flagKeys } = scorePassword(pw);
  const color = score >= 80 ? "#3ED598" : score >= 60 ? "#7C9CFF" : score >= 35 ? "#F2A93B" : "#E94F4F";

  useEffect(() => { if (pw) onComplete({ score, lastRun: Date.now() }); }, [pw]); // eslint-disable-line

  return (
    <div>
      <ModuleHeader icon={KeyRound} color="#3ED598" title={t.modules.password} subtitle={s.subtitle} />
      <input type="text" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={s.placeholder} className="input-green w-full rounded-lg p-4 text-sm font-mono outline-none" style={{ background: "#131B2E", border: "1px solid #1E2A44", color: "#E8ECF4" }} />
      {pw && (
        <div className="mt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#1E2A44" }}>
              <div className="h-full transition-all duration-500" style={{ width: `${score}%`, background: color }} />
            </div>
            <span className="font-mono text-sm font-semibold" style={{ color }}>{s.labels[labelKey]}</span>
          </div>
          {flagKeys.length > 0 ? (
            <ul className="space-y-1.5">
              {flagKeys.map((k) => (
                <li key={k} className="text-sm flex items-start gap-2" style={{ color: "#B4BDD1" }}>
                  <XCircle size={14} className="mt-0.5 shrink-0" style={{ color: "#E94F4F" }} />
                  {s.flags[k]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm flex items-center gap-2" style={{ color: "#3ED598" }}>
              <CheckCircle2 size={16} /> {s.noIssues}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ---------- deepfake quiz ----------

function DeepfakeView({ onComplete }) {
  const { t } = useLang();
  const s = t.deepfake;
  const [i, setI] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const current = s.quiz[i];

  const answer = (choice) => {
    const isRight = choice === current.correct;
    if (isRight) setCorrectCount((c) => c + 1);
    setAnswered({ choice, isRight });
  };

  const next = () => {
    if (i + 1 < s.quiz.length) {
      setI(i + 1);
      setAnswered(null);
    } else {
      const finalScore = Math.round((correctCount / s.quiz.length) * 100);
      onComplete({ score: finalScore, lastRun: Date.now() });
      setDone(true);
    }
  };

  const restart = () => { setI(0); setAnswered(null); setCorrectCount(0); setDone(false); };

  return (
    <div>
      <ModuleHeader icon={Video} color="#7C9CFF" title={t.modules.deepfake} subtitle={s.subtitle} />
      {!done ? (
        <div className="p-5 rounded-xl" style={{ background: "#131B2E", border: "1px solid #1E2A44" }}>
          <div className="font-mono text-xs mb-3" style={{ color: "#8590A6" }}>{s.situation(i + 1, s.quiz.length)}</div>
          <p className="text-sm mb-5 leading-relaxed">{current.q}</p>
          {!answered ? (
            <div className="flex gap-3">
              <button onClick={() => answer(true)} className="quiz-btn-alert flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#E94F4F22", color: "#E94F4F", border: "1px solid #E94F4F44" }}>{s.alertBtn}</button>
              <button onClick={() => answer(false)} className="quiz-btn-normal flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#3ED59822", color: "#3ED598", border: "1px solid #3ED59844" }}>{s.normalBtn}</button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3 text-sm font-medium" style={{ color: answered.isRight ? "#3ED598" : "#E94F4F" }}>
                {answered.isRight ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {answered.isRight ? s.correct : s.incorrect}
              </div>
              <p className="text-sm mb-5" style={{ color: "#B4BDD1" }}>{current.tip}</p>
              <button onClick={next} className="px-5 py-2.5 rounded-lg text-sm font-medium" style={{ background: "#7C9CFF", color: "#0B1220" }}>
                {i + 1 < s.quiz.length ? s.next : s.seeScore}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 rounded-xl text-center" style={{ background: "#131B2E", border: "1px solid #1E2A44" }}>
          <div className="flex justify-center mb-4">
            <ScoreRing value={Math.round((correctCount / s.quiz.length) * 100)} color="#7C9CFF" />
          </div>
          <p className="text-sm mb-5" style={{ color: "#B4BDD1" }}>{s.resultBody(correctCount, s.quiz.length)}</p>
          <button onClick={restart} className="restart-btn px-4 py-2 rounded-lg text-sm flex items-center gap-2 mx-auto" style={{ border: "1px solid #1E2A44", color: "#8590A6" }}>
            <RotateCcw size={14} /> {s.restart}
          </button>
        </div>
      )}
    </div>
  );
}

// ---------- shadow IA checklist ----------

function ShadowIAView({ onComplete }) {
  const { t } = useLang();
  const s = t.shadowia;
  const [checked, setChecked] = useState({});

  const toggle = (i) => {
    const next = { ...checked, [i]: !checked[i] };
    setChecked(next);
    const goodDone = s.checklist.filter((item, idx) => !item.bad && next[idx]).length;
    const badAvoided = s.checklist.filter((item, idx) => item.bad && !next[idx]).length;
    const totalGood = s.checklist.filter(it => !it.bad).length;
    const totalBad = s.checklist.filter(it => it.bad).length;
    const score = Math.round(((goodDone + badAvoided) / (totalGood + totalBad)) * 100);
    onComplete({ score, lastRun: Date.now() });
  };

  return (
    <div>
      <ModuleHeader icon={CloudOff} color="#E9738F" title={t.modules.shadowia} subtitle={s.subtitle} />
      <div className="space-y-3">
        {s.checklist.map((item, i) => (
          <button key={i} onClick={() => toggle(i)} className="w-full text-left p-4 rounded-lg flex items-start gap-3" style={{ background: "#131B2E", border: `1px solid ${checked[i] ? (item.bad ? "#E94F4F66" : "#3ED59866") : "#1E2A44"}` }}>
            <div className="mt-0.5 shrink-0">
              {checked[i]
                ? <CheckCircle2 size={18} style={{ color: item.bad ? "#E94F4F" : "#3ED598" }} />
                : <div className="w-[18px] h-[18px] rounded-full" style={{ border: "1.5px solid #4A5674" }} />
              }
            </div>
            <div className="text-sm" style={{ color: "#E8ECF4" }}>
              {item.text}
              {checked[i] && item.bad && <div className="mt-1 text-xs" style={{ color: "#E94F4F" }}>{s.riskWarning}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
