
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { getDeveloperOAuthAuthorizationUrl } from './api/developerAuth';
import {
  createApplication, getApplicationActivity, getApplicationUsers,
  getApplications, getDashboardSummary, updateApplication,
} from './api/applications';
import { createApiKey, getApiKeys, revokeApiKey } from './api/apiKeys';
import { exchangeOAuth, sendOtp, startOAuth, verifyOtp } from './api/authentication';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Bell,
  X,
  ArrowRight,
  Sun,
  Moon,
  Menu,
  BookOpen,
  Check,
  Lock,
  Globe,
  Code,
  ShieldCheck,
  Key,
  Layers,
  Terminal,
  Copy,
  AlertTriangle,
  RefreshCw,
  Activity,
  Users,
  Clock,
  Play,
  Settings,
  LogOut,
  Plus,
  ExternalLink,
  Search,
  MoveRight,
  LogIn,
  UserPlus
} from 'lucide-react';

// Dynamic Smooth Scroll & Motion Styles Injector
const GlobalSmoothStyles = () => {
  return (
    <style>{`
      html {
        scroll-behavior: smooth;
      }
      
      /* Smooth GSAP Scroll Reveal Classes */
      .gsap-reveal {
        opacity: 0;
        transform: translateY(24px);
        transition: opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1), transform 0.75s cubic-bezier(0.16, 1, 0.3, 1);
        will-change: opacity, transform;
      }
      .gsap-reveal.is-revealed {
        opacity: 1;
        transform: translateY(0);
      }

      /* Hero Stagger Entrances */
      @keyframes fadeInUpSmooth {
        from {
          opacity: 0;
          transform: translate3d(0, 20px, 0);
        }
        to {
          opacity: 1;
          transform: translate3d(0, 0, 0);
        }
      }

      .animate-fade-in-up {
        animation: fadeInUpSmooth 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }

      /* Isolated SVG Element Motions with proper transform-box */
      .svg-isolated-anim {
        transform-box: fill-box;
        transform-origin: center center;
      }

      @keyframes floatKey {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-5px) rotate(3deg);
        }
      }

      @keyframes pulseGlow {
        0%, 100% {
          opacity: 0.25;
          transform: scale(0.98);
        }
        50% {
          opacity: 0.45;
          transform: scale(1.02);
        }
      }

      @keyframes steamDrift {
        0% {
          opacity: 0;
          transform: translateY(3px);
        }
        50% {
          opacity: 0.85;
        }
        100% {
          opacity: 0;
          transform: translateY(-8px);
        }
      }

      @keyframes connectorFlow {
        from {
          stroke-dashoffset: 24;
        }
        to {
          stroke-dashoffset: 0;
        }
      }

      @keyframes successBadgePulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.06);
        }
      }

      .doodle-key-anim {
        transform-box: fill-box;
        transform-origin: center center;
        animation: floatKey 4s ease-in-out infinite;
      }

      .doodle-steam-drift {
        transform-box: fill-box;
        transform-origin: center bottom;
        animation: steamDrift 2.6s ease-in-out infinite;
      }

      .doodle-pulse-check {
        transform-box: fill-box;
        transform-origin: center center;
        animation: successBadgePulse 3.2s ease-in-out infinite;
      }

      .doodle-flow-line {
        stroke-dasharray: 6 6;
        animation: connectorFlow 1.2s linear infinite;
      }

      .ambient-glow-anim {
        animation: pulseGlow 5s ease-in-out infinite;
      }

      /* Custom Premium Scrollbar */
      ::-webkit-scrollbar {
        width: 7px;
        height: 7px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: rgba(160, 160, 160, 0.25);
        border-radius: 999px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #FFC400;
      }
    `}</style>
  );
};

const AnimatedCounter = ({ targetValue, duration = 1200, prefix = "", suffix = "" }) => {
  const [current, setCurrent] = useState(0);
  const targetNum = typeof targetValue === 'number' ? targetValue : parseInt(targetValue.toString().replace(/[^0-9]/g, '')) || 0;

  useEffect(() => {
    let startTimestamp = null;
    let frameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(easeProgress * targetNum));

      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [targetNum, duration]);

  const formatted = current.toLocaleString();
  return <span>{prefix}{formatted}{suffix}</span>;
};

// Hand-crafted SVG Doodle Art for the Hero Section
const DeveloperDoodleArt = ({ isDark = false }) => {
  return (
    <div className="relative w-full max-w-lg mx-auto select-none group">
      {/* Soft Ambient Backdrop Glow */}
      <div className={`absolute -inset-3 rounded-3xl filter blur-2xl ambient-glow-anim transition-all duration-700 pointer-events-none ${
        isDark ? 'bg-[#FFC400]/15' : 'bg-[#FFC400]/25'
      }`}></div>

      {/* Main Doodle Canvas (Grounded & Stable) */}
      <div className={`relative rounded-2xl border p-6 md:p-7 backdrop-blur-md transition-all duration-300 shadow-xl overflow-hidden ${
        isDark
          ? 'bg-zinc-900/90 border-zinc-800 shadow-black/40 text-zinc-100'
          : 'bg-white/95 border-zinc-200 shadow-zinc-200/60 text-zinc-900'
      }`}>
        
        {/* Floating Doodle Decorative Elements */}
        <div className="absolute top-4 left-6 text-[#FFC400] opacity-90">
          <Sparkles className="w-4 h-4" />
        </div>
        
        {/* Top Annotation Badge */}
        <div className={`absolute top-4 right-5 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wide border shadow-sm transition-transform duration-300 group-hover:scale-105 ${
          isDark
            ? 'bg-[#FFC400] text-black border-[#FFC400]'
            : 'bg-black text-[#FFC400] border-zinc-900'
        }`}>
          ⚡ LESS BOILERPLATE
        </div>

        {/* Illustrated SVG Doodle Art Workspace */}
        <svg
          viewBox="0 0 460 350"
          className="w-full h-auto drop-shadow-sm mt-3"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid Background */}
          <pattern id="doodle-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={isDark ? "#3f3f46" : "#e4e4e7"} />
          </pattern>
          <rect width="460" height="350" fill="url(#doodle-grid)" opacity="0.35" />

          {/* Hand-Drawn Connection Arrow: Client to Backend */}
          <path
            d="M95 85 Q 145 42 205 70"
            stroke="#FFC400"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="doodle-flow-line"
          />
          <polygon points="210,72 200,64 204,76" fill="#FFC400" />

          {/* Sticky Note: "POST /auth/otp/send" */}
          <g transform="translate(108, 26) rotate(-2)">
            <rect
              x="0"
              y="0"
              width="126"
              height="24"
              rx="6"
              fill={isDark ? "#18181b" : "#fef08a"}
              stroke={isDark ? "#3f3f46" : "#facc15"}
              strokeWidth="1.5"
            />
            <text
              x="63"
              y="16"
              textAnchor="middle"
              fontFamily="monospace"
              fontSize="9.5"
              fontWeight="bold"
              fill={isDark ? "#FFC400" : "#713f12"}
            >
              POST /otp/send/
            </text>
          </g>

          {/* Doodle Laptop / Terminal (Left Node) */}
          <g transform="translate(25, 72)">
            {/* Screen border */}
            <rect
              x="0"
              y="0"
              width="115"
              height="76"
              rx="7"
              fill={isDark ? "#18181b" : "#27272a"}
              stroke={isDark ? "#3f3f46" : "#18181b"}
              strokeWidth="2"
            />
            {/* Terminal Top Bar */}
            <rect x="0" y="0" width="115" height="15" rx="7" fill={isDark ? "#27272a" : "#18181b"} />
            <circle cx="10" cy="7.5" r="2.2" fill="#f87171" />
            <circle cx="17" cy="7.5" r="2.2" fill="#fbbf24" />
            <circle cx="24" cy="7.5" r="2.2" fill="#34d399" />
            {/* Terminal Content */}
            <text x="10" y="30" fontFamily="monospace" fontSize="8" fill="#FFC400">&gt; signora.init()</text>
            <text x="10" y="44" fontFamily="monospace" fontSize="8" fill="#a1a1aa">✓ app_id ready</text>
            <text x="10" y="58" fontFamily="monospace" fontSize="8" fill="#34d399">✓ key secured</text>
            {/* Laptop Base */}
            <path
              d="M-12 76 L127 76 L118 85 L-3 85 Z"
              fill={isDark ? "#3f3f46" : "#d4d4d8"}
              stroke={isDark ? "#52525b" : "#a1a1aa"}
              strokeWidth="1.5"
            />
            <circle cx="57.5" cy="80.5" r="2.5" fill="#FFC400" />
          </g>

          {/* Coffee Mug with Smooth Steam Drift (Bottom Left) */}
          <g transform="translate(32, 195)">
            <path
              d="M10 20 L10 48 Q 10 55 23 55 L32 55 Q 45 55 45 48 L45 20 Z"
              fill={isDark ? "#27272a" : "#ffffff"}
              stroke={isDark ? "#71717a" : "#18181b"}
              strokeWidth="2"
            />
            {/* Mug Handle */}
            <path
              d="M45 25 C 57 25 57 44 45 44"
              fill="none"
              stroke={isDark ? "#71717a" : "#18181b"}
              strokeWidth="2"
            />
            {/* Mug Yellow Brand Stripe */}
            <rect x="11" y="29" width="33" height="7" fill="#FFC400" />
            {/* Flowing Steam Lines with drift */}
            <g className="doodle-steam-drift">
              <path
                d="M20 14 Q 24 8 20 2"
                fill="none"
                stroke="#FFC400"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M31 14 Q 35 8 31 2"
                fill="none"
                stroke="#FFC400"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          </g>

          {/* Centerpiece: Signora Vault Engine */}
          <g transform="translate(195, 78)">
            {/* Vault Body */}
            <rect
              x="0"
              y="0"
              width="142"
              height="142"
              rx="22"
              fill={isDark ? "#09090b" : "#18181b"}
              stroke="#FFC400"
              strokeWidth="2.2"
              className="drop-shadow-[0_8px_20px_rgba(255,196,0,0.18)]"
            />
            
            {/* Inner Plate */}
            <rect x="12" y="12" width="118" height="118" rx="15" fill={isDark ? "#18181b" : "#27272a"} />

            {/* Central Mini Ribbon Logo */}
            <g transform="translate(45, 23) scale(0.39)">
            <circle
  cx="60"
  cy="50"
  r="73"
  fill="white"
/>

<image
  href="/favicon.png"
  x="14"
  y="1"
  width="82"
  height="106"
  preserveAspectRatio="xMidYMid meet"
/>
 
            </g>

            {/* Feature Badges */}
            <g transform="translate(18, 80)">
              <rect x="0" y="0" width="48" height="17" rx="4" fill="#FFC400" />
              <text x="24" y="11.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#000000">OTP ✓</text>

              <rect x="54" y="0" width="52" height="17" rx="4" fill={isDark ? "#27272a" : "#3f3f46"} />
              <text x="80" y="11.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#ffffff">OAuth ✓</text>
            </g>

            <g transform="translate(18, 103)">
              <rect x="0" y="0" width="48" height="17" rx="4" fill={isDark ? "#27272a" : "#3f3f46"} />
              <text x="24" y="11.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#ffffff">JWT ✓</text>

              <rect x="54" y="0" width="52" height="17" rx="4" fill="#FFC400" />
              <text x="80" y="11.5" textAnchor="middle" fontSize="8.5" fontWeight="bold" fill="#000000">API Key ✓</text>
            </g>
          </g>

          {/* Floating Key (With Safe Isolated Transform Animation) */}
          <g transform="translate(365, 40)" className="doodle-key-anim svg-isolated-anim">
            <circle cx="15" cy="15" r="11" fill="#FFC400" stroke={isDark ? "#000000" : "#18181b"} strokeWidth="1.8" />
            <circle cx="15" cy="15" r="3.5" fill={isDark ? "#18181b" : "#ffffff"} />
            <rect x="24" y="12" width="24" height="6" rx="2" fill="#FFC400" stroke={isDark ? "#000000" : "#18181b"} strokeWidth="1.8" />
            <rect x="38" y="18" width="4" height="6" fill="#FFC400" stroke={isDark ? "#000000" : "#18181b"} strokeWidth="1.4" />
            <rect x="44" y="18" width="4" height="4.5" fill="#FFC400" stroke={isDark ? "#000000" : "#18181b"} strokeWidth="1.4" />
          </g>

          {/* Mobile Client Node (Right Node) */}
          <g transform="translate(355, 145)">
            <rect
              x="0"
              y="0"
              width="66"
              height="110"
              rx="13"
              fill={isDark ? "#18181b" : "#ffffff"}
              stroke={isDark ? "#52525b" : "#18181b"}
              strokeWidth="2"
            />
            {/* Top speaker */}
            <rect x="23" y="6" width="20" height="2.5" rx="1.2" fill={isDark ? "#3f3f46" : "#d4d4d8"} />
            {/* Screen */}
            <rect x="6" y="15" width="54" height="82" rx="7" fill={isDark ? "#27272a" : "#f4f4f5"} />
            
            {/* Animated Pulsing Check Badge */}
            <g className="doodle-pulse-check svg-isolated-anim">
              <circle cx="33" cy="42" r="13" fill="#10b981" />
              <path d="M27 42 L31 46 L39 37" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <text x="33" y="70" textAnchor="middle" fontSize="7" fontWeight="bold" fill={isDark ? "#ffffff" : "#18181b"}>
              AUTHENTICATED
            </text>
            <text x="33" y="81" textAnchor="middle" fontSize="6.5" fill="#71717a">
              Token Issued
            </text>
          </g>

          {/* Flow Line to Mobile Client */}
          <path
            d="M340 148 Q 365 125 365 142"
            stroke="#FFC400"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="doodle-flow-line"
          />

          {/* Sticky Note: Multi-Application Guarantee */}
          <g transform="translate(135, 238) rotate(3)">
            <rect
              x="0"
              y="0"
              width="145"
              height="50"
              rx="4"
              fill={isDark ? "#27272a" : "#fef9c3"}
              stroke={isDark ? "#3f3f46" : "#fde047"}
              strokeWidth="1.5"
            />
            <text x="10" y="18" fontSize="8.5" fontWeight="bold" fill={isDark ? "#FFC400" : "#854d0e"}>
              📌 Multi-Application Guarantee
            </text>
            <text x="10" y="30" fontSize="7.5" fill={isDark ? "#d4d4d8" : "#713f12"}>
              • Zero cross-app leakage
            </text>
            <text x="10" y="41" fontSize="7.5" fill={isDark ? "#d4d4d8" : "#713f12"}>
              • TLS 1.3 + Ed25519 signatures
            </text>
          </g>

          {/* Small cloud symbol */}
          <g transform="translate(298, 274)">
            <path
              d="M10 22 A 10 10 0 0 1 27 13 A 14 14 0 0 1 52 16 A 10 10 0 0 1 58 28 L10 28 Z"
              fill={isDark ? "#3f3f46" : "#f4f4f5"}
              stroke={isDark ? "#71717a" : "#18181b"}
              strokeWidth="1.5"
            />
            <polygon points="30,24 25,32 30,32 27,40 37,29 32,29" fill="#FFC400" />
          </g>
        </svg>

        {/* Footer Micro Bar */}
        <div className={`mt-3 pt-3 border-t flex items-center justify-between text-xs font-mono ${
          isDark ? 'border-zinc-800 text-zinc-400' : 'border-zinc-100 text-zinc-600'
        }`}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Django REST 2.4 Active</span>
          </div>
          <span className="text-[#FFC400] font-semibold">Latency ~32ms</span>
        </div>
      </div>
    </div>
  );
};

// Dual-ribbon Signora Logo matching the reference brand image
const SignoraLogo = ({ showText = true, isDark = false, className = "" }) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {/* Animated Dual-Ribbon S Glyph */}
      <div className="relative w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
      <div className="w-full h-full rounded-md bg-[#FAFAF7] flex items-center justify-center">
  <img
    src="/favicon.png"
    alt="Signora Logo"
    className="w-full h-full object-contain"
  />
</div>
      </div>

      {/* Brand Typographic Wordmark & Tagline */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black tracking-tight text-xl sm:text-2xl leading-none transition-colors duration-300 ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}
            >
              Signora
            </span>
         
          </div>
          <span
            className={`text-[8px] sm:text-[9px] font-extrabold tracking-[0.24em] uppercase transition-colors duration-300 mt-0.5 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Authentication, Simplified.
          </span>
        </div>
      )}
    </div>
  );
};
const Toast = ({
  message,
  type = 'success',
  onClose,
  isDark = false,
  duration = 4100
}) => {

  useEffect(() => {
    const timer = setTimeout(onClose, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-fade-in text-sm backdrop-blur-md ${
      isDark
        ? 'bg-zinc-900/95 text-white border-zinc-800'
        : 'bg-zinc-950 text-white border-zinc-800'
    }`}>
      {type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#FFC400]" />}
      {type === 'error' && <XCircle className="w-4 h-4 text-rose-400" />}
      {type === 'info' && <Bell className="w-4 h-4 text-sky-400" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

const INITIAL_APPS = [
  {
    id: 'app_prod_991',
    name: 'MyShop',
    url: 'https://myshop.com',
    environment: 'Production',
    created: 'Sep 19, 2026',
    activeUsers: 1042,
    authSuccessRate: '99.8%',
  },
  {
    id: 'app_dev_314',
    name: 'Blog Platform',
    url: 'https://blog.example.com',
    environment: 'Development',
    created: 'Sep 14, 2026',
    activeUsers: 242,
    authSuccessRate: '98.5%',
  }
];

const INITIAL_API_KEYS = [
  {
    id: 'key_live_01',
    name: 'Production API Key',
    appId: 'app_prod_991',
    prefix: 'ak_live_••••••••3f9a',
    environment: 'Production',
    created: 'Sep 19, 2026',
    lastUsed: 'Never used',
    status: 'Active'
  },
  {
    id: 'key_test_02',
    name: 'Dev Backend Worker',
    appId: 'app_dev_314',
    prefix: 'ak_test_••••••••7d2c',
    environment: 'Development',
    created: 'Sep 15, 2026',
    lastUsed: '4 mins ago',
    status: 'Active'
  }
];

const INITIAL_USERS = [
  { id: 'usr_01', name: 'Alex Rivera', email: 'alex@example.com', appId: 'app_prod_991', method: 'OTP', status: 'Active', lastLogin: '2 min ago', created: 'Sep 18, 2026' },
  { id: 'usr_02', name: 'John Doe', email: 'john@example.com', appId: 'app_prod_991', method: 'Google', status: 'Active', lastLogin: '8 min ago', created: 'Sep 17, 2026' },
  { id: 'usr_03', name: 'Elena Chen', email: 'elena.c@github.dev', appId: 'app_prod_991', method: 'GitHub', status: 'Active', lastLogin: '18 min ago', created: 'Sep 16, 2026' },
  { id: 'usr_04', name: 'Marcus Vance', email: 'marcus@sample.org', appId: 'app_dev_314', method: 'OTP', status: 'Active', lastLogin: '1 hour ago', created: 'Sep 15, 2026' },
  { id: 'usr_05', name: 'Sara Miller', email: 'sara@miller.io', appId: 'app_prod_991', method: 'OTP', status: 'Active', lastLogin: '3 hours ago', created: 'Sep 12, 2026' }
];

const INITIAL_ACTIVITY = [
  { id: 'act_1', type: 'OTP', status: 'success', title: 'OTP verification successful', user: 'alex@example.com', time: '2 minutes ago', method: 'Email OTP', appId: 'app_prod_991' },
  { id: 'act_2', type: 'Google', status: 'success', title: 'Google OAuth authentication', user: 'john@example.com', time: '8 minutes ago', method: 'Google OAuth', appId: 'app_prod_991' },
  { id: 'act_3', type: 'OTP', status: 'failed', title: 'Invalid OTP entered', user: 'user@example.com', time: '12 minutes ago', method: 'Email OTP', appId: 'app_prod_991' },
  { id: 'act_4', type: 'GitHub', status: 'success', title: 'GitHub OAuth token exchange', user: 'developer@example.com', time: '18 minutes ago', method: 'GitHub OAuth', appId: 'app_prod_991' },
  { id: 'act_5', type: 'OTP', status: 'success', title: 'OTP generated & dispatched', user: 'marcus@sample.org', time: '1 hour ago', method: 'Email OTP', appId: 'app_dev_314' }
];
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { developer, isAuthenticated, loading: authLoading, logout, updateProfile } = useAuth();
  const initialDashboardTab = window.location.hash.startsWith('#dashboard-')
    ? window.location.hash.replace('#dashboard-', '')
    : null;
  // Theme State: 'light' | 'dark'
  const [theme, setTheme] = useState('light');
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation: 'landing' | 'docs' | 'pricing' | 'login' | 'signup' | 'dashboard'
  const [currentView, setCurrentView] = useState(() => (
    // A restored developer session must take precedence over an old saved
    // login/signup view, especially immediately after an OAuth handoff.
    initialDashboardTab || localStorage.getItem('signora_access_token')
      ? 'dashboard'
      : (localStorage.getItem('signora_view') || 'landing')
  ));
  const [dashboardTab, setDashboardTab] = useState(() => initialDashboardTab || localStorage.getItem('signora_dashboard_tab') || 'overview');
  const [selectedAppId, setSelectedAppId] = useState('app_prod_991');

  // Application Data States
  const [apps, setApps] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({
    metrics: { applications: 0, active_users: 0, successful_auth: 0, otp_verifications: 0 },
    chart: [],
    activity: [],
  });
  const [isDataLoading, setIsDataLoading] = useState(true);

  // UI Modals & Notifications
  const [toast, setToast] = useState(() => {
    const oauthSuccess =
      new URLSearchParams(window.location.search).get('oauth') === 'success';
  
    const notice = oauthSuccess
      ? 'OAuth authentication successful. Check Auth Activity.'
      : sessionStorage.getItem('signora_oauth_notice');
  
    if (!notice) return null;
  
    return {
      message: notice,
      type: 'success',
      duration: oauthSuccess ? 6000 : 4100,
    };
  });
  const [isCreateAppOpen, setIsCreateAppOpen] = useState(false);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [newlyCreatedRawKey, setNewlyCreatedRawKey] = useState(null);
  const [activeCodeLang, setActiveCodeLang] = useState('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [docsSection, setDocsSection] = useState('quickstart');

  // Developer Session User
  const [developerUser, setDeveloperUser] = useState({
    name: 'Manikanta',
    email: 'developer@email.com',
    avatar: 'M'
  });

  const activeDeveloperUser = developer ? {
    name: developer.username,
    email: developer.email,
    avatar: developer.username?.charAt(0).toUpperCase() || 'M',
    provider: developer.provider,
  } : developerUser;

  useEffect(() => {
    if (!isAuthenticated) return;
    const startedAt = Date.now();
    setIsDataLoading(true);
    Promise.all([getApplications(), getDashboardSummary()])
      .then(([applicationsData, summaryData]) => {
        const realApplications = applicationsData.applications;
        setApps(realApplications);
        setDashboardSummary(summaryData);
        setActivity(summaryData.activity);

        if (realApplications.length) {
          setSelectedAppId((currentId) => (
            realApplications.some((application) => application.id === currentId)
              ? currentId
              : realApplications[0].id
          ));
        }
      })
      .catch((error) => {
        console.error('Unable to load dashboard data:', error);
      }).finally(() => setTimeout(() => setIsDataLoading(false), Math.max(0, 1000 - (Date.now() - startedAt))));
  }, [isAuthenticated, dashboardTab]);

  useEffect(() => {
    if (!isAuthenticated || !selectedAppId || !apps.some((app) => app.id === selectedAppId)) return;
    const startedAt = Date.now();
    setIsDataLoading(true);
    Promise.all([
      getApiKeys(selectedAppId), getApplicationUsers(selectedAppId), getApplicationActivity(selectedAppId),
    ]).then(([keysData, usersData, activityData]) => {
      setApiKeys(keysData.api_keys);
      setUsers(usersData.users);
      setActivity(activityData.activity);
    }).catch((error) => console.error('Unable to load application data:', error))
      .finally(() => setTimeout(() => setIsDataLoading(false), Math.max(0, 1000 - (Date.now() - startedAt))));
  }, [isAuthenticated, selectedAppId, apps, dashboardTab]);

  useEffect(() => {
    // Dynamic load of GSAP and ScrollTrigger if not already present
    if (!window.gsap) {
      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
      gsapScript.async = true;
      gsapScript.onload = () => {
        const stScript = document.createElement('script');
        stScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
        stScript.async = true;
        stScript.onload = () => {
          if (window.gsap && window.ScrollTrigger) {
            window.gsap.registerPlugin(window.ScrollTrigger);
          }
        };
        document.body.appendChild(stScript);
      };
      document.body.appendChild(gsapScript);
    }
  }, []);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    // Remove only after the mounted app has consumed it. This survives React
    // StrictMode's development-only double initialization.
    if (toast?.message && sessionStorage.getItem('signora_oauth_notice') === toast.message) {
      sessionStorage.removeItem('signora_oauth_notice');
    }
    if (new URLSearchParams(window.location.search).has('oauth')) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
    }
  }, [toast]);

  const currentApp = useMemo(() => {
    return apps.find(a => a.id === selectedAppId) || apps[0] || {
      id: '', name: 'No application selected', environment: '—',
    };
  }, [apps, selectedAppId]);

  useEffect(() => { localStorage.setItem('signora_view', currentView); }, [currentView]);
  useEffect(() => {
    localStorage.setItem('signora_dashboard_tab', dashboardTab);
    if (currentView === 'dashboard') window.history.replaceState(null, '', `/#dashboard-${dashboardTab}`);
  }, [currentView, dashboardTab]);
  useEffect(() => {
    if (!authLoading && currentView === 'dashboard' && !isAuthenticated) setCurrentView('login');
  }, [authLoading, currentView, isAuthenticated]);
  useEffect(() => {
    const syncDashboardRoute = () => {
      const tab = window.location.hash.startsWith('#dashboard-')
        ? window.location.hash.replace('#dashboard-', '')
        : null;
      if (tab) {
        setDashboardTab(tab);
        setCurrentView('dashboard');
      }
    };
    window.addEventListener('hashchange', syncDashboardRoute);
    syncDashboardRoute();
    return () => window.removeEventListener('hashchange', syncDashboardRoute);
  }, []);

  if (window.location.pathname === '/oauth/callback') {
    return <EndUserOAuthCallback />;
  }
  if (window.location.pathname === '/oauth/developer-callback') {
    return <DeveloperOAuthCallback />;
  }

  if (authLoading) return <DashboardShimmer isDark={isDark} />;
  if (currentView === 'dashboard' && !isAuthenticated) return <DashboardShimmer isDark={isDark} />;

  return (
    <div className={`min-h-screen font-sans antialiased selection:bg-[#FFC400] selection:text-black transition-colors duration-500 ${
      isDark ? 'bg-[#0c0c0e] text-zinc-100' : 'bg-[#FAFAF7] text-zinc-900'
    }`}>
      {/* Global Smooth Scrolling Styles */}
      <GlobalSmoothStyles />

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} isDark={isDark} />}

      {/* View Routing */}
      {currentView === 'landing' && (
        <LandingPageView
          onNavigate={(view) => setCurrentView(view)}
          onOpenDashboard={() => setCurrentView('dashboard')}
          activeCodeLang={activeCodeLang}
          setActiveCodeLang={setActiveCodeLang}
          copiedCode={copiedCode}
          setCopiedCode={setCopiedCode}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {currentView === 'docs' && (
        <DocumentationView
          onNavigate={(view) => setCurrentView(view)}
          docsSection={docsSection}
          setDocsSection={setDocsSection}
          showToast={showToast}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {currentView === 'pricing' && (
        <PricingView
          onNavigate={(view) => setCurrentView(view)}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {(currentView === 'login' || currentView === 'signup') && (
        <AuthModalView
          mode={currentView}
          onNavigate={(view) => setCurrentView(view)}
          onAuthSuccess={(authMode, user) => {
            if (user) {
              setDeveloperUser({
                name: user.username,
                email: user.email,
                avatar: user.username?.charAt(0).toUpperCase() || 'M',
              });
            }
            showToast(
              authMode === 'login'
                ? 'Welcome back to Signora!'
                : 'Account created successfully!'
            );
          
            setCurrentView('dashboard');
          }}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {currentView === 'dashboard' && (
        <DashboardLayout
          developerUser={activeDeveloperUser}
          currentTab={dashboardTab}
          setTab={setDashboardTab}
          apps={apps}
          selectedApp={currentApp}
          setSelectedAppId={setSelectedAppId}
          onLogout={() => {
            logout();
            setApps([]);
            setApiKeys([]);
            setUsers([]);
            setActivity([]);
            showToast('Signed out successfully.', 'info');
            setCurrentView('landing');
          }}
          onOpenCreateApp={() => setIsCreateAppOpen(true)}
          onOpenCreateKey={() => setIsCreateKeyOpen(true)}
          onUpdateApplication={async (applicationId, changes) => {
            const response = await updateApplication(applicationId, changes);
            setApps((current) => current.map((app) => app.id === applicationId ? response.application : app));
            showToast('Application settings updated.');
          }}
          onUpdateDeveloper={updateProfile}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          users={users}
          setUsers={setUsers}
          activity={activity}
          dashboardSummary={dashboardSummary}
          isDataLoading={isDataLoading}
          setActivity={setActivity}
          showToast={showToast}
          onNavigate={setCurrentView}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
      )}

      {/* Create Application Modal */}
      {isCreateAppOpen && (
        <CreateApplicationModal
          isDark={isDark}
          onClose={() => setIsCreateAppOpen(false)}
          onCreate={async (newApp) => {
            const response = await createApplication(newApp);
            setApps((current) => [response.application, ...current]);
            setSelectedAppId(response.application.id);
            setIsCreateAppOpen(false);
            showToast(`Application "${response.application.name}" created.`);
          }}
        />
      )}

      {/* Create API Key Modal */}
      {isCreateKeyOpen && (
        <CreateApiKeyModal
          isDark={isDark}
          currentApp={currentApp}
          onClose={() => {
            setIsCreateKeyOpen(false);
            setNewlyCreatedRawKey(null);
          }}
          newlyCreatedRawKey={newlyCreatedRawKey}
          setNewlyCreatedRawKey={setNewlyCreatedRawKey}
          onCreateKey={async (name) => {
            const response = await createApiKey(currentApp.id, { name });
            setApiKeys((current) => [response.api_key, ...current]);
            setNewlyCreatedRawKey(response.api_key.key);
            showToast('API key generated successfully!');
          }}
        />
      )}
    </div>
  );
}

function DeveloperOAuthCallback() {
  const { completeOAuthLogin } = useAuth();
  const [message, setMessage] = useState('Completing secure developer sign-in…');
  const exchanged = useRef(false);
  useEffect(() => {
    if (exchanged.current) return;
    exchanged.current = true;
    const code = new URLSearchParams(window.location.search).get('exchange');
    if (!code) return setMessage('OAuth sign-in could not be completed: exchange code is missing.');
    completeOAuthLogin(code).then(() => {
      localStorage.setItem('signora_view', 'dashboard');
      localStorage.setItem('signora_dashboard_tab', 'overview');
      // Replace the OAuth callback/history entry so browser back-forward cache
      // cannot restore the pre-login signup modal after authentication.
      window.location.replace('/#dashboard-overview');
    }).catch(() => setMessage('OAuth sign-in could not be completed. The exchange may have expired.'));
  }, [completeOAuthLogin]);
  return <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] text-zinc-100 px-6"><div className="text-center space-y-3"><RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#FFC400]" /><p className="text-sm">{message}</p></div></div>;
}

function EndUserOAuthCallback() {
  const [message, setMessage] = useState('Completing secure OAuth sign-in…');

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('exchange');
    if (!code) {
      setMessage('OAuth sign-in could not be completed: exchange code is missing.');
      return;
    }
    exchangeOAuth(code).then((data) => {
      // The opaque code is removed immediately. These end-user tokens are kept
      // only for this browser session and never placed in a URL.
      sessionStorage.setItem('signora_end_user_tokens', JSON.stringify(data.tokens));
      // This status marker is not a credential and survives SPA remounts. It
      // is removed immediately after the dashboard toast is initialized.
      window.location.replace('/?oauth=success#dashboard-playground');
    }).catch(() => setMessage('OAuth sign-in could not be completed. The exchange may have expired.'));
  }, []);

  return <div className="min-h-screen flex items-center justify-center bg-[#0c0c0e] text-zinc-100 px-6"><div className="text-center space-y-3"><RefreshCw className="w-6 h-6 mx-auto animate-spin text-[#FFC400]" /><p className="text-sm">{message}</p></div></div>;
}

function LandingPageView({ onNavigate, onOpenDashboard, activeCodeLang, setActiveCodeLang, copiedCode, setCopiedCode, isDark, toggleTheme }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth IntersectionObserver for scroll-reveal animations across cards and sections
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const revealElements = document.querySelectorAll('.gsap-reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const codeSnippets = {
    curl: `curl -X POST https://signoratoken.vercel.app/api/v1/auth/otp/send/ \\
  -H "X-API-Key: ak_live_79a29e19b5c391" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"alex@example.com"}'`,
    javascript: `import axios from 'axios';

// Call Signora directly from your trusted Backend
const response = await axios.post('https://signoratoken.vercel.app/api/v1/auth/otp/send/', {
  email: 'alex@example.com'
}, {
  headers: {
    'X-API-Key': process.env.SIGNORA_API_KEY
  }
});

console.log(response.data.message); // "OTP sent successfully."`,
    python: `import os
import requests

# Backend invocation with Signora Secret Key
res = requests.post(
    "https://signoratoken.vercel.app/api/v1/auth/otp/send/",
    headers={"X-API-Key": os.environ["SIGNORA_API_KEY"]},
    json={"email": "alex@example.com"}
)

print(res.json()) # {'success': True, 'message': 'OTP sent successfully.'}`
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0c0c0e]' : 'bg-[#FAFAF7]'}`}>
      {/* Top Banner Notice */}
      <div className={`text-xs py-2 px-4 text-center border-b flex items-center justify-center gap-2 transition-colors ${
        isDark ? 'bg-zinc-950 text-zinc-300 border-zinc-800/80' : 'bg-zinc-900 text-zinc-300 border-zinc-800'
      }`}>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFC400] text-black">
          NEW
        </span>
        <span>Signora v2.4 Django REST Auth Engine is Live with Multi-Application Scoping.</span>
        <button onClick={() => onNavigate('docs')} className="underline hover:text-white font-medium ml-1">
          Explore Docs &rarr;
        </button>
      </div>

      {/* Sticky Navbar with Theme Switcher */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled
            ? isDark
              ? 'bg-[#0c0c0e]/90 backdrop-blur-md border-b border-zinc-800/90 shadow-lg py-3'
              : 'bg-white/95 backdrop-blur-md border-b border-zinc-200/80 shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => onNavigate('landing')}>
            <SignoraLogo showText={true} isDark={isDark} />
          </div>

          <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}>
            <a href="#features" className={`transition-colors duration-200 hover:text-[#FFC400]`}>Product</a>
            <a href="#how-it-works" className={`transition-colors duration-200 hover:text-[#FFC400]`}>How It Works</a>
            <a href="#developer-guide" className={`transition-colors duration-200 hover:text-[#FFC400]`}>Developers</a>
            <button onClick={() => onNavigate('docs')} className={`transition-colors duration-200 hover:text-[#FFC400]`}>
              Documentation
            </button>
            <button onClick={() => onNavigate('pricing')} className={`transition-colors duration-200 hover:text-[#FFC400]`}>
              Pricing
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2 rounded-xl border transition-all duration-300 hover:rotate-12 ${
                isDark
                  ? 'bg-zinc-900 border-zinc-800 text-[#FFC400] hover:bg-zinc-800'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => onNavigate('login')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isDark
                  ? 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100'
              }`}
            >
              Log in
            </button>

            <button
              onClick={() => onNavigate('signup')}
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-zinc-950 bg-[#FFC400] hover:bg-[#F0B800] rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border ${
                isDark ? 'border-zinc-800 text-[#FFC400]' : 'border-zinc-200 text-zinc-700'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-b px-6 py-4 space-y-3 transition-all duration-300 animate-fade-in-up ${
            isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200'
          }`}>
            <button onClick={() => { onNavigate('docs'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Documentation</button>
            <button onClick={() => { onNavigate('pricing'); setMobileMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Pricing</button>
            <div className={`pt-3 border-t flex flex-col gap-2 ${isDark ? 'border-zinc-800' : 'border-zinc-100'}`}>
              <button onClick={() => onNavigate('login')} className={`w-full py-2.5 text-center text-sm font-medium border rounded-lg ${
                isDark ? 'border-zinc-800 text-white' : 'border-zinc-300 text-zinc-900'
              }`}>Log in</button>
              <button onClick={() => onNavigate('signup')} className="w-full py-2.5 text-center text-sm font-semibold bg-[#FFC400] text-black rounded-lg">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION WITH SMOOTH ENTRANCE AND DOODLE ART */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        {/* Subtle Decorative Background Dots */}
        <div className={`absolute inset-0 pointer-events-none [background-size:24px_24px] opacity-60 ${
          isDark
            ? 'bg-[radial-gradient(#27272a_1px,transparent_1px)]'
            : 'bg-[radial-gradient(#E5E7EB_1px,transparent_1px)]'
        }`}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Smoothly Animated Hero Typography */}
            <div className="lg:col-span-7 space-y-6 animate-fade-in-up">


              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] ${
                isDark ? 'text-white' : 'text-zinc-950'
              }`}>
                Authentication, <br />
                <span className="relative inline-block">
                  simplified.
                  <span className="absolute bottom-1 left-0 w-full h-3 bg-[#FFC400]/40 -z-10 rounded-sm"></span>
                </span>
              </h1>

              <p className={`text-lg sm:text-xl font-medium max-w-xl ${
                isDark ? 'text-zinc-300' : 'text-zinc-700'
              }`}>
                You build the product. We handle authentication.
              </p>

              <p className={`text-base max-w-xl leading-relaxed ${
                isDark ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                Add secure authentication to your application with a single integration. Support OTP, Google, GitHub, secure tokens, and application-level API keys without building authentication infrastructure yourself.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('signup')}
                  className="group inline-flex items-center gap-2.5 px-6 py-3.5 text-base font-semibold text-zinc-950 bg-[#FFC400] hover:bg-[#F0B800] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Building
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5" />
                </button>
                <button
                  onClick={() => onNavigate('docs')}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 text-base font-semibold border rounded-xl shadow-sm transition-all duration-300 transform hover:-translate-y-1 ${
                    isDark
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-800'
                      : 'bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  Read Documentation
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Django REST Powered
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Multi-Application Isolation
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" /> Zero Frontend Leakage
                </span>
              </div>
            </div>

            {/* Right Column: Hero Doodle Art Visual */}
            <div className="lg:col-span-5 animate-fade-in-up transition-transform duration-500">
              <DeveloperDoodleArt isDark={isDark} />
            </div>
          </div>
        </div>
      </section>

      {/* HOW SIGNORA WORKS */}
      <section id="how-it-works" className={`py-20 border-y transition-colors duration-500 ${
        isDark ? 'bg-zinc-950 border-zinc-800/80' : 'bg-white border-zinc-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3 gsap-reveal">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFC400] bg-black px-3 py-1 rounded-full">
              Seamless Integration
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              How Signora Works
            </h2>
            <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              Set up multi-Application, enterprise-grade authentication in less than five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { num: '01', title: 'Create an application', desc: 'Register your application inside the Signora dashboard and configure your custom domain and callbacks.' },
              { num: '02', title: 'Get your API key', desc: 'Generate a secure application-level API key (ak_live_...) for your backend.' },
              { num: '03', title: 'Integrate Signora', desc: "Connect your backend to Signora's Django REST endpoints with our lightweight SDKs or direct HTTP calls." },
              { num: '04', title: 'Authenticate your users', desc: 'Let your end users sign in effortlessly using passwordless Email OTP, Google OAuth, or GitHub.' },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{ transitionDelay: `${idx * 120}ms` }}
                className={`p-6 rounded-2xl border transition-all duration-500 group hover:-translate-y-2 hover:shadow-xl gsap-reveal ${
                  isDark
                    ? 'bg-zinc-900/60 border-zinc-800 hover:border-[#FFC400]'
                    : 'bg-[#FAFAF7] border-zinc-200 hover:border-[#FFC400]'
                }`}
              >
                <div className="text-2xl font-black text-zinc-400 group-hover:text-[#FFC400] transition-colors duration-300 mb-3">{step.num}</div>
                <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>{step.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Interactive Flow Visual Ribbon */}
          <div className={`mt-12 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-mono border gsap-reveal ${
            isDark ? 'bg-zinc-900/90 border-zinc-800 text-white' : 'bg-zinc-950 border-zinc-800 text-white'
          }`}>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FFC400]"></span>
              <span className="text-zinc-400">ARCHITECTURAL PIPELINE:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-zinc-300">
              <span className="px-2 py-1 bg-zinc-800/80 rounded border border-zinc-700">Developer</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="px-2 py-1 bg-zinc-800/80 rounded border border-zinc-700">Create App</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="px-2 py-1 bg-zinc-800/80 rounded border border-zinc-700 text-[#FFC400]">X-API-Key</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="px-2 py-1 bg-zinc-800/80 rounded border border-zinc-700">Your Backend</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="px-2 py-1 bg-zinc-800/80 rounded border border-zinc-700 font-semibold text-white">Signora REST</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="px-2 py-1 bg-emerald-950/80 text-emerald-300 rounded border border-emerald-800">End User JWT</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center space-y-3 mb-16 gsap-reveal">
            <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-[#FFC400]' : 'text-zinc-600'}`}>Enterprise Primitives</span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Authentication Features Built for Scale
            </h2>
            <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              All the modern login and identity methods your users expect, pre-configured out of the box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Lock, title: 'Email OTP', desc: 'Passwordless authentication using cryptographically secure 6-digit one-time passwords with automated rate limiting and expiry guards.' },
              { icon: Globe, title: 'Google OAuth', desc: 'Let your users authenticate effortlessly with their Google credentials. Handles token exchange, profile ingestion, and verified emails.' },
              { icon: Code, title: 'GitHub OAuth', desc: 'Developer-friendly GitHub social authentication tailored for developer platforms, open-source communities, and technical tools.' },
              { icon: ShieldCheck, title: 'Secure Tokens (JWT)', desc: 'Receive standardized, digitally signed JWT tokens upon successful verification. Complete with automated token refresh cycles.' },
              { icon: Key, title: 'Application API Keys', desc: 'Securely identify and authorize your backend application with Signora using cryptographically hashed, prefix-labeled API keys.' },
              { icon: Layers, title: 'Multi-Application Users', desc: 'Complete data isolation. Users registered under Application A are completely separated from Application B, with strict zero-leakage boundaries.' },
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div
                  key={idx}
                  style={{ transitionDelay: `${idx * 90}ms` }}
                  className={`p-7 rounded-2xl border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 space-y-4 gsap-reveal ${
                    isDark
                      ? 'bg-zinc-900/80 border-zinc-800 hover:border-[#FFC400]/80'
                      : 'bg-white border-zinc-200/90 hover:border-[#FFC400]/80'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-[#FFC400]/20 flex items-center justify-center text-[#FFC400] transition-transform duration-300 group-hover:scale-110">
                    <IconComp className="w-6 h-6 text-current" />
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-950'}`}>{feat.title}</h3>
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* DEVELOPER INTEGRATION & CODE EDITOR */}
      <section id="developer-guide" className="py-20 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left explanation */}
            <div className="lg:col-span-5 space-y-6 gsap-reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-medium bg-zinc-900 border border-zinc-800 text-[#FFC400]">
                <Terminal className="w-3.5 h-3.5" />
                REST API Integration
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Integrate in minutes, <br />
                not weeks.
              </h2>

              <p className="text-zinc-400 text-base leading-relaxed">
                Signora exposes clean, idiomatic REST endpoints backed by Django. No complex heavyweight client bundles required—communicate straight from your backend worker or API server.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-zinc-800 text-[#FFC400] mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Zero SDK lock-in</div>
                    <div className="text-xs text-zinc-400">Use native fetch, Axios, Python requests, or standard HTTP libraries.</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded bg-zinc-800 text-[#FFC400] mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-200">Standardized Response Schema</div>
                    <div className="text-xs text-zinc-400">Consistent JSON responses with explicit error codes and structured tokens.</div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => onNavigate('docs')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#FFC400] hover:text-white transition-colors duration-200"
                >
                  Explore API Reference <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive Code Editor */}
            <div className="lg:col-span-7 gsap-reveal">
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden transition-all duration-500 hover:border-zinc-700">
                <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <div className="w-3 h-3 rounded-full bg-zinc-700"></div>
                    <span className="text-xs text-zinc-400 font-mono ml-2">POST /api/v1/auth/otp/send/</span>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                    {['curl', 'javascript', 'python'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveCodeLang(lang)}
                        className={`px-2.5 py-1 rounded font-mono capitalize transition-all duration-200 ${
                          activeCodeLang === lang
                            ? 'bg-[#FFC400] text-black font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        {lang === 'javascript' ? 'JavaScript' : lang === 'curl' ? 'cURL' : 'Python'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 font-mono text-xs sm:text-sm text-zinc-300 leading-relaxed overflow-x-auto relative">
                  <button
                    onClick={() => copyToClipboard(codeSnippets[activeCodeLang])}
                    className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs transition border border-zinc-700"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied ✓</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <pre className="text-zinc-200">{codeSnippets[activeCodeLang]}</pre>
                </div>

                <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      HTTP/1.1 200 OK
                    </span>
                    <span>Content-Type: application/json</span>
                  </div>
                  <pre className="font-mono text-xs text-emerald-400 bg-zinc-900/80 p-3 rounded-lg border border-zinc-800 overflow-x-auto">
{`{
  "success": true,
  "message": "OTP sent successfully.",
  "application": "MyShop (Production)",
  "expires_in": 300
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* API KEY SECURITY ARCHITECTURE */}
      <section className={`py-20 border-b transition-colors duration-500 ${
        isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14 gsap-reveal">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-[#FFC400] border border-[#FFC400]/30">
              <AlertTriangle className="w-4 h-4 text-[#FFC400]" />
              Developer Security Architecture
            </div>
            <h2 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              Your API key connects your application to Signora.
            </h2>
            <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>
              Your API key is a secret credential and should <strong>only</strong> be used from your application's backend server. Never expose it to browsers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Anti-Pattern */}
            <div className={`p-6 rounded-2xl border space-y-4 transition-all duration-500 hover:-translate-y-1 gsap-reveal ${
              isDark ? 'bg-rose-950/20 border-rose-900/50' : 'bg-rose-50/50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-500" />  Don't do this
                </span>
                <span className="text-xs font-mono text-rose-400">Frontend Risk</span>
              </div>

              <p className={`text-xs ${isDark ? 'text-rose-200' : 'text-rose-900'}`}>
                Never embed raw Signora API keys inside client-side React, Vue, HTML, or mobile apps:
              </p>

              <div className={`p-4 rounded-xl font-mono text-xs overflow-x-auto shadow-sm border ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-rose-300' : 'bg-white border-rose-200 text-rose-800'
              }`}>
                <span className="text-zinc-500">// In React component:</span>
                <br />
                <span className="text-rose-400 line-through">
                  const API_KEY = "ak_live_98a41bc...";
                </span>
                <br />
                <span className="text-zinc-500">// Leaks your secret key to DevTools network tab!</span>
              </div>
            </div>

            {/* Recommended */}
            <div className={`p-6 rounded-2xl border space-y-4 transition-all duration-500 hover:-translate-y-1 gsap-reveal ${
              isDark ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50/50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Do this (Server Proxy)
                </span>
                <span className="text-xs font-mono text-emerald-400">Secure Pattern</span>
              </div>

              <p className={`text-xs ${isDark ? 'text-emerald-200' : 'text-emerald-950'}`}>
                Route requests through your backend server where your API key is stored safely:
              </p>

              <div className={`p-4 rounded-xl font-mono text-xs shadow-sm space-y-1 border ${
                isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-white border-emerald-200 text-zinc-800'
              }`}>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Client App</span>
                  <span>&rarr;</span>
                  <span className="font-bold text-[#FFC400]">Your Backend API</span>
                  <span>&rarr;</span>
                  <span className="font-bold text-white">Signora</span>
                </div>
                <div className="pt-2 text-[11px] text-emerald-400">
                  process.env.SIGNORA_API_KEY (kept on server)
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION */}
      <section className="py-24 bg-zinc-950 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-6 gsap-reveal">
          <SignoraLogo showText={false} isDark={true} className="h-12 w-12 mx-auto" />
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to simplify your authentication?
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            You build the product. We handle authentication. Get your API keys in less than 60 seconds.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('signup')}
              className="px-7 py-3.5 text-base font-bold text-zinc-950 bg-[#FFC400] hover:bg-[#F0B800] rounded-xl shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              Start Building &rarr;
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="px-6 py-3.5 text-base font-semibold text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Read the Docs
            </button>
          </div>
        </div>
      </section>

      {/* LANDING FOOTER */}
      <footer className={`border-t py-12 transition-colors duration-500 ${
        isDark ? 'bg-zinc-950 border-zinc-800 text-zinc-400' : 'bg-white border-zinc-200 text-zinc-600'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <SignoraLogo showText={true} isDark={isDark} />
          <div className="flex items-center gap-6 text-sm">
            <button onClick={() => onNavigate('docs')} className="hover:text-[#FFC400] transition-colors">Documentation</button>
            <button onClick={() => onNavigate('pricing')} className="hover:text-[#FFC400] transition-colors">Pricing</button>
            <a href="#how-it-works" className="hover:text-[#FFC400] transition-colors">Architecture</a>
            <span>© 2026 Signora Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PricingView({ onNavigate, isDark, toggleTheme }) {
  return (
    <div className={`min-h-screen transition-colors ${isDark ? 'bg-[#0c0c0e] text-zinc-100' : 'bg-[#FAFAF7] text-zinc-900'}`}>
      <div className={`border-b sticky top-0 z-30 transition-colors ${
        isDark ? 'bg-zinc-950/80 border-zinc-800 backdrop-blur' : 'bg-white/80 border-zinc-200 backdrop-blur'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => onNavigate('landing')}>
            <SignoraLogo isDark={isDark} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border ${isDark ? 'border-zinc-800 text-[#FFC400]' : 'border-zinc-200 text-zinc-700'}`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={() => onNavigate('landing')} className="text-sm font-medium hover:text-[#FFC400]">
              Home
            </button>
            <button onClick={() => onNavigate('docs')} className="text-sm font-medium hover:text-[#FFC400]">
              Docs
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="px-4 py-2 text-sm font-semibold bg-[#FFC400] text-black rounded-lg hover:bg-[#F0B800]"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FFC400] bg-black px-3 py-1 rounded-full">
            Transparent Pricing
          </span>
          <h1 className="text-4xl font-extrabold">Simple, predictable plans</h1>
          <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Start free in development, scale without friction when you deploy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className={`p-8 rounded-2xl border shadow-sm space-y-6 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div>
              <h3 className="text-xl font-bold">Developer</h3>
              <p className="text-xs text-zinc-400 mt-1">For hobbyists and staging applications.</p>
            </div>
            <div className="text-4xl font-extrabold">₹0 <span className="text-sm font-normal text-zinc-500">/mo</span></div>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Up to 1,000 Active Users</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 2 Applications</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Email OTP + OAuth</li>
            </ul>
            <button onClick={() => onNavigate('signup')} className={`w-full py-2.5 font-semibold text-sm rounded-lg border transition ${
              isDark ? 'border-zinc-700 hover:bg-zinc-800 text-white' : 'border-zinc-300 hover:bg-zinc-50'
            }`}>
              Start Free
            </button>
          </div>

          <div className="p-8 rounded-2xl bg-zinc-950 text-white border-2 border-[#FFC400] shadow-xl space-y-6 relative">
            <div className="absolute -top-3 right-6 bg-[#FFC400] text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Startup Pro</h3>
              <p className="text-xs text-zinc-400 mt-1">For growing SaaS products with production load.</p>
            </div>
            <div className="text-4xl font-extrabold text-white">₹500 <span className="text-sm font-normal text-zinc-400">/mo</span></div>
            <ul className="space-y-3 text-sm text-zinc-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FFC400]" /> Up to 25,000 Active Users</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FFC400]" /> Unlimited Applications</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FFC400]" /> Custom Email Delivery Domains</li>
            </ul>
            <button onClick={() => onNavigate('signup')} className="w-full py-2.5 font-bold text-sm rounded-lg bg-[#FFC400] text-black hover:bg-[#F0B800]">
              Deploy with Pro
            </button>
          </div>

          <div className={`p-8 rounded-2xl border shadow-sm space-y-6 ${
            isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
          }`}>
            <div>
              <h3 className="text-xl font-bold">Enterprise</h3>
              <p className="text-xs text-zinc-400 mt-1">For dedicated compliance & custom requirements.</p>
            </div>
            <div className="text-4xl font-extrabold">Custom</div>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Dedicated Single-Application Cluster</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom SAML / SSO Providers</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> SOC2 & HIPAA compliance pack</li>
            </ul>
            <button onClick={() => onNavigate('signup')} className={`w-full py-2.5 font-semibold text-sm rounded-lg border transition ${
              isDark ? 'border-zinc-700 hover:bg-zinc-800 text-white' : 'border-zinc-300 hover:bg-zinc-50'
            }`}>
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentationView({ onNavigate, docsSection, setDocsSection, showToast, isDark, toggleTheme }) {
  const apiExamples = {
    send_otp: ['POST', '/api/v1/auth/otp/send/', '{"email":"customer@example.com","name":"Customer"}'],
    verify_otp: ['POST', '/api/v1/auth/otp/verify/', '{"email":"customer@example.com","otp":"123456"}'],
    introspect: ['POST', '/api/v1/auth/introspect/', '{"token":"END_USER_ACCESS_TOKEN"}\n\nHeader: X-API-Key: YOUR_APPLICATION_API_KEY\n\nSuccess: {"active":true,"user":{"id":"…","email":"customer@example.com","application_id":"…"}}\nInvalid token: {"active":false,"message":"Invalid or expired access token."}'],
    oauth_google: ['GET', '/api/v1/auth/oauth/google/start/', 'Send X-API-Key, then redirect the browser to authorization_url in the response.'],
    oauth_github: ['GET', '/api/v1/auth/oauth/github/start/', 'Send X-API-Key, then redirect the browser to authorization_url in the response.'],
    app_create: ['POST', '/api/v1/applications/', '{"name":"Storefront","website_url":"https://example.com","environment":"production"}'],
    app_list: ['GET', '/api/v1/applications/', 'Send Authorization: Bearer <developer-access-token>.'],
    app_update: ['PATCH', '/api/v1/applications/<application-id>/', '{"name":"Updated Storefront"}'],
    dev_signup: ['POST', '/api/v1/accounts/signup/', '{"username":"developer","email":"developer@example.com","password":"at-least-8-characters"}'],
    dev_login: ['POST', '/api/v1/accounts/login/', '{"email":"developer@example.com","password":"your-password"}'],
    dev_refresh: ['POST', '/api/v1/accounts/token/refresh/', '{"refresh":"<refresh-token>"}'],
  };
  const docTopics = [
    {
      group: 'Getting Started',
      items: [
        { id: 'intro', label: 'Introduction' },
        { id: 'quickstart', label: 'Quick Start' },
        { id: 'auth_concepts', label: 'Authentication Architecture' },
        { id: 'api_keys', label: 'API Keys & Secrets' }
      ]
    },
    {
      group: 'Developer Authentication',
      items: [
        { id: 'dev_signup', label: 'Developer Signup' },
        { id: 'dev_login', label: 'Developer Login' },
        { id: 'dev_refresh', label: 'Refresh Token Flow' }
      ]
    },
    {
      group: 'Application Management',
      items: [
        { id: 'app_create', label: 'Create Application' },
        { id: 'app_list', label: 'List Applications' },
        { id: 'app_update', label: 'Update Application' }
      ]
    },
    {
      group: 'End User Authentication',
      items: [
        { id: 'send_otp', label: 'Send Email OTP' },
        { id: 'verify_otp', label: 'Verify Email OTP' },
        { id: 'introspect', label: 'Verify End User Access Token' },
        { id: 'oauth_google', label: 'Google OAuth Flow' },
        { id: 'oauth_github', label: 'GitHub OAuth Flow' }
      ]
    },
    {
      group: 'Security & Compliance',
      items: [
        { id: 'sec_keys', label: 'API Key Security Guide' },
        { id: 'sec_isolation', label: 'Multi-Application Isolation' },
        { id: 'sec_ratelimit', label: 'Rate Limiting Limits' }
      ]
    }
  ];

  const mutedText = isDark ? 'text-zinc-400' : 'text-zinc-600';
  const cardClass = isDark
    ? 'bg-zinc-900/70 border-zinc-800'
    : 'bg-zinc-50 border-zinc-200';
  const codeClass = 'rounded-xl bg-zinc-950 text-zinc-100 p-4 font-mono text-xs overflow-x-auto border border-zinc-800 whitespace-pre-wrap leading-relaxed';

  const SectionLabel = ({ children }) => (
    <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B88400] dark:text-[#FFC400] font-semibold bg-[#FFC400]/10 px-2.5 py-1 rounded">
      {children}
    </div>
  );

  const ArchitectureDiagram = () => (
    <div className={`rounded-2xl border p-5 sm:p-7 overflow-x-auto ${cardClass}`}>
      <div className="min-w-[570px] space-y-5">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em] text-zinc-500">
          <span>Authentication request path</span><span className="text-[#B88400]">server-to-server credential</span>
        </div>
        <div className="grid grid-cols-[1fr_56px_1.15fr_56px_1fr] items-center gap-2">
          <div className={`rounded-xl border p-4 ${isDark ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-200'}`}>
            <Globe className="w-5 h-5 text-[#D79F00] mb-2" />
            <div className="font-bold text-sm">Your client</div>
            <div className="text-xs text-zinc-500 mt-1">Browser or mobile app</div>
          </div>
          <div className="flex flex-col items-center text-[#D79F00]"><MoveRight className="w-6 h-6" /><span className="text-[9px] text-zinc-500 mt-1">sign in</span></div>
          <div className="rounded-xl border-2 border-[#FFC400] bg-[#FFC400]/10 p-4 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-[#B88400] mb-2" />
            <div className="font-bold text-sm">Your backend</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Holds <code>X-API-Key</code> in a secret store</div>
          </div>
          <div className="flex flex-col items-center text-[#D79F00]"><MoveRight className="w-6 h-6" /><span className="text-[9px] text-zinc-500 mt-1">authenticate</span></div>
          <div className={`rounded-xl border p-4 ${isDark ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-200'}`}>
            <Lock className="w-5 h-5 text-[#D79F00] mb-2" />
            <div className="font-bold text-sm">Signora API</div>
            <div className="text-xs text-zinc-500 mt-1">OTP, OAuth & tokens</div>
          </div>
        </div>
        <div className={`rounded-lg px-4 py-3 text-xs ${isDark ? 'bg-zinc-950 text-zinc-400' : 'bg-white text-zinc-600'}`}>
          The browser never receives your application key. It only receives the application session or end-user token your backend chooses to return.
        </div>
      </div>
    </div>
  );

  const TokenDiagram = () => (
    <div className={`rounded-2xl border p-5 sm:p-7 ${cardClass}`}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-center">
        <div className={`flex-1 rounded-xl p-4 border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}><Key className="w-5 h-5 mx-auto text-[#D79F00] mb-2" /><b className="text-sm">Application key</b><p className="text-xs text-zinc-500 mt-1">Identifies one application</p></div>
        <MoveRight className="w-5 h-5 shrink-0 mx-auto text-[#D79F00] rotate-90 sm:rotate-0" />
        <div className={`flex-1 rounded-xl p-4 border ${isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}><CheckCircle2 className="w-5 h-5 mx-auto text-emerald-500 mb-2" /><b className="text-sm">Verified user</b><p className="text-xs text-zinc-500 mt-1">OTP or OAuth succeeds</p></div>
        <MoveRight className="w-5 h-5 shrink-0 mx-auto text-[#D79F00] rotate-90 sm:rotate-0" />
        <div className="flex-1 rounded-xl p-4 border border-[#FFC400] bg-[#FFC400]/10"><Lock className="w-5 h-5 mx-auto text-[#B88400] mb-2" /><b className="text-sm">End-user tokens</b><p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">Carry the application scope</p></div>
      </div>
    </div>
  );

  const docsContent = {
    intro: (
      <div className="space-y-7">
        <SectionLabel><BookOpen className="w-3.5 h-3.5" /> INTRODUCTION</SectionLabel>
        <div><h1 className="text-3xl font-extrabold">Authentication that belongs to your product</h1><p className={`${mutedText} leading-relaxed mt-3`}>Signora gives each of your applications a separate authentication boundary. Use it to send passwordless email codes, start Google or GitHub sign-in, and issue end-user access and refresh tokens without building identity infrastructure from scratch.</p></div>
        <div className="grid sm:grid-cols-3 gap-3">
          {[['Create', 'Set up an application in the developer console.', Layers], ['Connect', 'Keep its API key on your backend.', Key], ['Authenticate', 'Use OTP or OAuth for your customers.', ShieldCheck]].map(([title, description, Icon]) => <div key={title} className={`border rounded-xl p-4 ${cardClass}`}><Icon className="w-5 h-5 text-[#D79F00] mb-3"/><h2 className="font-bold text-sm">{title}</h2><p className="text-xs text-zinc-500 leading-relaxed mt-1">{description}</p></div>)}
        </div>
        <div className={`border-l-2 border-[#FFC400] pl-4 py-2 text-sm rounded-r-lg ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-amber-50 text-zinc-700'}`}><strong>Two credentials, two jobs:</strong> developer tokens manage applications; application API keys start end-user authentication.</div>
        <h2 className="text-xl font-bold">Start here</h2>
        <ol className={`${mutedText} text-sm space-y-3 list-decimal list-inside`}><li>Create an application and generate a key.</li><li>Store the raw key in your server environment, not in frontend code.</li><li>Call the OTP or OAuth start endpoint with <code className="font-mono text-[#B88400]">X-API-Key</code>.</li><li>Verify the result and use the returned end-user tokens for your session.</li></ol>
      </div>
    ),
    auth_concepts: (
      <div className="space-y-7">
        <SectionLabel><ShieldCheck className="w-3.5 h-3.5" /> ARCHITECTURE</SectionLabel>
        <div><h1 className="text-3xl font-extrabold">Authentication architecture</h1><p className={`${mutedText} leading-relaxed mt-3`}>Signora separates your customer-facing client from the credential that authorizes authentication requests. Your backend is the trusted bridge.</p></div>
        <ArchitectureDiagram />
        <div className="grid sm:grid-cols-2 gap-4"><div><h2 className="font-bold">1. Authenticate the application</h2><p className={`${mutedText} text-sm mt-2 leading-relaxed`}>Signora hashes the supplied application key, finds its active application, and uses that application as the scope for the request.</p></div><div><h2 className="font-bold">2. Authenticate the user</h2><p className={`${mutedText} text-sm mt-2 leading-relaxed`}>OTP verification or an OAuth callback creates or locates the end user within that application, then issues end-user tokens.</p></div></div>
        <h2 className="text-xl font-bold">Credential and token boundary</h2><TokenDiagram />
        <div className={`border rounded-xl p-4 text-sm ${cardClass}`}><strong>Important:</strong> An end-user token is not a developer console token. Developer tokens manage resources; end-user tokens represent a signed-in customer for one application.</div>
      </div>
    ),
    api_keys: (
      <div className="space-y-7">
        <SectionLabel><Key className="w-3.5 h-3.5" /> CREDENTIALS</SectionLabel>
        <div><h1 className="text-3xl font-extrabold">API keys & secrets</h1><p className={`${mutedText} leading-relaxed mt-3`}>An API key identifies a single Signora application. Generate keys from that application’s Keys tab and use the key in the <code className="font-mono text-[#B88400]">X-API-Key</code> request header.</p></div>
        <div className={`border rounded-xl overflow-hidden ${cardClass}`}><div className="grid grid-cols-[130px_1fr] text-sm"><div className="p-4 font-semibold border-b border-r border-zinc-200 dark:border-zinc-800">Format</div><div className="p-4 border-b border-zinc-200 dark:border-zinc-800 font-mono text-xs">ak_live_… for production · ak_test_… otherwise</div><div className="p-4 font-semibold border-r border-zinc-200 dark:border-zinc-800">Storage</div><div className="p-4">Only a SHA-256 hash and a display prefix are retained.</div><div className="p-4 font-semibold border-t border-r border-zinc-200 dark:border-zinc-800">Visibility</div><div className="p-4 border-t border-zinc-200 dark:border-zinc-800">The complete raw key is returned once when created.</div></div></div>
        <div className={codeClass}>{`POST /api/v1/auth/otp/send/\nX-API-Key: ak_live_your_application_secret\nContent-Type: application/json\n\n{"email":"customer@example.com"}`}</div>
        <div className={`rounded-xl border p-4 ${isDark ? 'bg-amber-950/20 border-amber-900/50' : 'bg-amber-50 border-amber-200'}`}><div className="flex gap-3"><AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" /><p className="text-sm leading-relaxed">Copy the key into your secret manager immediately. If it is lost, create a new key and update the deployment; the original cannot be retrieved.</p></div></div>
      </div>
    ),
    sec_keys: (
      <div className="space-y-7">
        <SectionLabel><Lock className="w-3.5 h-3.5" /> SECURITY GUIDE</SectionLabel>
        <div><h1 className="text-3xl font-extrabold">API key security guide</h1><p className={`${mutedText} leading-relaxed mt-3`}>Treat an application key like a password for your authentication backend. Anyone holding a valid key can initiate authentication for that application.</p></div>
        <div className="grid sm:grid-cols-2 gap-4"><div className={`rounded-xl border p-5 ${isDark ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-emerald-50 border-emerald-200'}`}><CheckCircle2 className="w-5 h-5 text-emerald-600 mb-3"/><h2 className="font-bold">Do</h2><ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400"><li>Use environment variables or a secret manager.</li><li>Use separate keys for separate deployments.</li><li>Rotate a key after a suspected exposure.</li><li>Revoke retired keys from the console.</li></ul></div><div className={`rounded-xl border p-5 ${isDark ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-200'}`}><XCircle className="w-5 h-5 text-red-600 mb-3"/><h2 className="font-bold">Never</h2><ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400"><li>Commit a key to source control.</li><li>Embed it in browser or mobile code.</li><li>Put it in URLs, analytics, or error reports.</li><li>Log raw keys, tokens, codes, or secrets.</li></ul></div></div>
        <h2 className="text-xl font-bold">If a key is exposed</h2><ol className={`${mutedText} text-sm space-y-2 list-decimal list-inside`}><li>Revoke the affected key in the application’s Keys tab.</li><li>Create a replacement key and update the server-side secret.</li><li>Review key usage and deployment logs for unexpected activity.</li></ol>
      </div>
    ),
    sec_isolation: (
      <div className="space-y-7">
        <SectionLabel><Layers className="w-3.5 h-3.5" /> DATA BOUNDARIES</SectionLabel>
        <div><h1 className="text-3xl font-extrabold">Multi-application isolation</h1><p className={`${mutedText} leading-relaxed mt-3`}>Every API key resolves to exactly one application. That application is carried through end-user creation, OTP verification, OAuth exchange, token claims, activity, and resource access.</p></div>
        <div className={`rounded-2xl border p-5 sm:p-7 ${cardClass}`}><div className="grid sm:grid-cols-2 gap-4"><div className="rounded-xl border border-[#FFC400] bg-[#FFC400]/10 p-5"><div className="font-bold">Application A</div><div className="font-mono text-xs text-[#B88400] mt-1">ak_live_A…</div><div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Users A · OTPs A · activity A · tokens with application_id A</div></div><div className={`rounded-xl border p-5 ${isDark ? 'bg-zinc-950 border-zinc-700' : 'bg-white border-zinc-200'}`}><div className="font-bold">Application B</div><div className="font-mono text-xs text-zinc-500 mt-1">ak_live_B…</div><div className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Users B · OTPs B · activity B · tokens with application_id B</div></div></div><div className="mt-4 text-center text-xs font-medium text-red-600">A key from Application B cannot validate a token issued for Application A.</div></div>
        <div className={`border-l-2 border-[#FFC400] pl-4 py-2 text-sm rounded-r-lg ${isDark ? 'bg-zinc-900 text-zinc-300' : 'bg-amber-50 text-zinc-700'}`}><strong>Same email, separate identity:</strong> the same email address registered in two applications is represented as two independent end users.</div>
        <p className={`${mutedText} text-sm leading-relaxed`}>Developer management endpoints add another boundary: applications and their keys can only be accessed by their owner’s developer token.</p>
      </div>
    ),
    sec_ratelimit: (
      <div className="space-y-7">
        <SectionLabel><Activity className="w-3.5 h-3.5" /> ABUSE PROTECTION</SectionLabel>
        <div><h1 className="text-3xl font-extrabold">Rate limiting limits</h1><p className={`${mutedText} leading-relaxed mt-3`}>OTP delivery is protected against rapid resend requests. The limit is evaluated within the application and end-user boundary, so one application does not consume another application’s allowance.</p></div>
        <div className={`border rounded-2xl overflow-hidden ${cardClass}`}><div className="grid grid-cols-[1.25fr_.75fr_1fr] text-xs sm:text-sm"><div className="p-4 font-bold border-b border-zinc-200 dark:border-zinc-800">Operation</div><div className="p-4 font-bold border-b border-zinc-200 dark:border-zinc-800">Limit</div><div className="p-4 font-bold border-b border-zinc-200 dark:border-zinc-800">When exceeded</div><div className="p-4">Send email OTP</div><div className="p-4 font-mono">1 / 60 sec</div><div className="p-4">429 Too Many Requests</div></div></div>
        <p className={`${mutedText} text-sm leading-relaxed`}>The default resend window is configured as <code className="font-mono text-[#B88400]">OTP_RESEND_SECONDS=60</code>. A successful resend also invalidates the earlier active code. OTPs expire after 5 minutes and allow up to five verification attempts.</p>
        <div className={`rounded-xl border p-4 ${cardClass}`}><h2 className="font-bold text-sm">Handling 429 responses</h2><p className={`${mutedText} text-sm mt-2`}>Disable the resend button while waiting, show a countdown, and retry only after the window has elapsed. Do not automatically retry in a tight loop.</p></div>
      </div>
    ),
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors ${
      isDark ? 'bg-[#0c0c0e] text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      <header className={`border-b sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between transition-colors ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center gap-6">
          <div className="cursor-pointer" onClick={() => onNavigate('landing')}>
            <SignoraLogo isDark={isDark} />
          </div>
          <span className={`hidden sm:inline-block px-2.5 py-0.5 rounded text-xs font-mono font-medium ${
            isDark ? 'bg-zinc-900 text-zinc-400' : 'bg-zinc-100 text-zinc-700'
          }`}>
            v2.4 API Docs
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border ${isDark ? 'border-zinc-800 text-[#FFC400]' : 'border-zinc-200 text-zinc-700'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => onNavigate('landing')} className="hover:text-[#FFC400]">
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-3.5 py-1.5 text-xs font-bold bg-[#FFC400] text-black rounded-lg hover:bg-[#F0B800]"
          >
            Go to Console &rarr;
          </button>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <aside className={`w-64 border-r p-6 hidden md:block space-y-6 shrink-0 overflow-y-auto ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          {docTopics.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDocsSection(item.id)}
                    className={`block w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                      docsSection === item.id
                        ? 'bg-[#FFC400] text-black font-bold'
                        : isDark
                        ? 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                        : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <main className="flex-1 p-8 lg:p-12 overflow-y-auto max-w-3xl space-y-8 animate-fade-in">
          {docsContent[docsSection] ? docsContent[docsSection] : docsSection === 'quickstart' ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#FFC400] font-semibold bg-[#FFC400]/10 px-2.5 py-1 rounded">
                GETTING STARTED
              </div>
              <h1 className="text-3xl font-extrabold">Signora Quick Start</h1>
              <p className={isDark ? 'text-zinc-400 leading-relaxed' : 'text-zinc-600 leading-relaxed'}>
                Welcome to Signora! This tutorial guides you through creating an application, generating your live API key, and performing your first passwordless OTP verification cycle.
              </p>

              <div className={`border-l-2 border-[#FFC400] pl-4 py-2 text-sm rounded-r-lg ${
                isDark ? 'bg-zinc-900/60 text-zinc-300' : 'bg-amber-50/70 text-zinc-700'
              }`}>
                <strong>Prerequisite:</strong> You must have a free Signora developer account to access your backend API keys.
              </div>

              <h2 className="text-xl font-bold pt-4">Step 1: Obtain your X-API-Key</h2>
              <p className={isDark ? 'text-zinc-400 text-sm' : 'text-zinc-600 text-sm'}>
                Log into the Signora console, navigate to <strong>Applications</strong>, and generate an API key. Your secret key will follow the format <code className="bg-zinc-800 text-[#FFC400] px-1 py-0.5 rounded font-mono text-xs">ak_live_xxxxxxxxxxxx</code>.
              </p>

              <h2 className="text-xl font-bold pt-4">Step 2: Dispatch an OTP from your backend</h2>
              <p className={isDark ? 'text-zinc-400 text-sm' : 'text-zinc-600 text-sm'}>
                Execute a POST request to <code className="bg-zinc-800 text-zinc-300 px-1 py-0.5 rounded font-mono text-xs">/api/v1/auth/otp/send/</code> with the recipient email.
              </p>

              <div className="rounded-xl bg-zinc-950 text-white p-4 font-mono text-xs overflow-x-auto border border-zinc-800">
{`curl -X POST https://signoratoken.vercel.app/api/v1/auth/otp/send/ \\
  -H "X-API-Key: ak_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alex@example.com"}'`}
              </div>

              <h2 className="text-xl font-bold pt-4">Step 3: Verify the 6-Digit Code</h2>
              <div className="rounded-xl bg-zinc-950 text-white p-4 font-mono text-xs overflow-x-auto border border-zinc-800">
{`curl -X POST https://signoratoken.vercel.app/api/v1/auth/otp/verify/ \\
  -H "X-API-Key: ak_live_••••••••" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alex@example.com", "otp": "492015"}'`}
              </div>
            </div>
          ) : apiExamples[docsSection] ? (
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded">
                API REFERENCE • {docsSection.toUpperCase()}
              </div>
              <h1 className="text-3xl font-extrabold capitalize">
                {docsSection.replace('_', ' ')}
              </h1>
              <p className={isDark ? 'text-zinc-400' : 'text-zinc-600'}>Developer and application-management requests use <code>Authorization: Bearer &lt;access-token&gt;</code>. End-user authentication requests use <code>X-API-Key: &lt;application-key&gt;</code>.</p>
              <div className="rounded-xl bg-zinc-950 text-white p-4 font-mono text-xs overflow-x-auto border border-zinc-800 whitespace-pre-wrap">{`${apiExamples[docsSection][0]} ${apiExamples[docsSection][1]}\n\n${apiExamples[docsSection][2]}`}</div>
              <p className="text-sm text-zinc-400">The console’s Authentication Playground can send these live requests. Keep application API keys on a server in production.</p>
              <button
                onClick={() => {
                  setDocsSection('quickstart');
                  showToast('Navigated to Quick Start');
                }}
                className="text-xs font-semibold text-[#FFC400] underline"
              >
                &larr; Back to Quick Start Guide
              </button>
            </div>
          ) : (
            <div className="space-y-4"><h1 className="text-3xl font-extrabold capitalize">{docsSection.replace('_', ' ')}</h1><p className="text-zinc-400">See Quick Start and endpoint references for the implemented API workflow.</p></div>
          )}
        </main>
      </div>
    </div>
  );
}

function AuthModalView({ mode, onNavigate, onAuthSuccess, isDark, toggleTheme }) {
  const { login, signup } = useAuth();
  const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuth = async (provider) => {
    setIsLoading(true);

    try {
      const authorizationUrl = await getDeveloperOAuthAuthorizationUrl(provider);
      window.location.assign(authorizationUrl);
    } catch (error) {
      setIsLoading(false);
      alert(error.response?.data?.message || `Unable to start ${provider} sign-in.`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    setIsLoading(true);
  
    try {
      let data;

      if (mode === "login") {
        data = await login({
          email,
          password,
        });
      } else {
        data = await signup({
          username: name,
          email,
          password,
        });
      }
  
      setIsLoading(false);
  
      onAuthSuccess(mode, data.user);
    } catch (error) {
      console.error("Authentication failed:", error);
  
      setIsLoading(false);
  
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Authentication failed. Please check your credentials.";
  
      alert(message);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-6 py-12 transition-colors ${
      isDark ? 'bg-[#0c0c0e] text-zinc-100' : 'bg-[#FAFAF7] text-zinc-900'
    }`}>
      <div className="mb-8 cursor-pointer flex items-center gap-4">
        <div onClick={() => onNavigate('landing')}>
          <SignoraLogo showText={true} isDark={isDark} />
        </div>
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-xl border ${isDark ? 'border-zinc-800 text-[#FFC400]' : 'border-zinc-200 text-zinc-700'}`}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className={`w-full max-w-md rounded-2xl border shadow-xl p-8 space-y-6 transition-all animate-fade-in-up ${
        isDark ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-zinc-200/90'
      }`}>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            {mode === 'login' ? 'Welcome back.' : 'Create your Signora account.'}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            {mode === 'login'
              ? 'Enter your developer credentials to manage your auth infrastructure.'
              : 'Start authenticating users in less than 5 minutes with Django REST core.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Manikanta"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
                }`}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1.5">Work Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold">Password</label>
              {mode === 'login' && (
                <a href="#forgot" className="text-[11px] text-zinc-400 hover:text-[#FFC400]">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#FFC400] hover:bg-[#F0B800] text-zinc-950 font-bold text-sm shadow-sm transition flex items-center justify-center gap-2"
          >
          {isLoading ? (
  <RefreshCw className="w-4 h-4 animate-spin" />
) : mode === 'login' ? (
  <>
    Sign In
    <LogIn className="w-4 h-4" />
  </>
) : (
  <>
    Create Account
    <UserPlus className="w-4 h-4" />
  </>
)}
          </button>
        </form>

        <div className="relative flex items-center justify-center">
          <div className={`border-t w-full ${isDark ? 'border-zinc-800' : 'border-zinc-200'}`}></div>
          <span className={`px-3 text-[11px] uppercase font-mono ${isDark ? 'bg-zinc-900 text-zinc-500' : 'bg-white text-zinc-400'}`}>or</span>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleOAuth('google')}
          className={`w-full py-2.5 rounded-xl border font-medium text-xs transition flex items-center justify-center gap-2 ${
            isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-200' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
          }`}
        >
          <Globe className="w-4 h-4" />
          Continue with Google
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => handleOAuth('github')}
          className={`w-full py-2.5 rounded-xl border font-medium text-xs transition flex items-center justify-center gap-2 ${
            isDark ? 'border-zinc-700 hover:bg-zinc-800 text-zinc-200' : 'border-zinc-200 hover:bg-zinc-50 text-zinc-800'
          }`}
        >
          <Code className="w-4 h-4" />
          Continue with GitHub
        </button>

        <div className="text-center text-xs text-zinc-400">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('signup')}
                className="font-semibold text-[#FFC400] underline"
              >
                Create one &rarr;
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="font-semibold text-[#FFC400] underline"
              >
                Log in &rarr;
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardLayout({
  developerUser,
  currentTab,
  setTab,
  apps,
  selectedApp,
  setSelectedAppId,
  onLogout,
  onOpenCreateApp,
  onOpenCreateKey,
  onUpdateApplication,
  onUpdateDeveloper,
  apiKeys,
  setApiKeys,
  users,
  setUsers,
  activity,
  dashboardSummary,
  isDataLoading,
  setActivity,
  showToast,
  onNavigate,
  isDark,
  toggleTheme
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className={`min-h-screen flex transition-colors ${
      isDark ? 'bg-[#0c0c0e] text-zinc-100' : 'bg-[#FAFAF7] text-zinc-900'
    }`}>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-zinc-950 text-white flex-col justify-between hidden md:flex shrink-0 border-r border-zinc-800">
        <div className="p-6 space-y-8">
          <div className="cursor-pointer" onClick={() => onNavigate('landing')}>
            <SignoraLogo showText={true} isDark={true} />
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Active Scope</div>
            <select
              value={selectedApp.id}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-3 pr-8 text-xs font-semibold text-zinc-200 focus:outline-none focus:border-[#FFC400]"
            >
              {apps.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name} ({app.environment})
                </option>
              ))}
            </select>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'apps', label: 'Applications', icon: Layers },
              { id: 'keys', label: 'API Keys', icon: Key },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'activity', label: 'Auth Activity', icon: Clock },
              { id: 'playground', label: 'Auth Playground', icon: Play },
            ].map(item => {
              const IconC = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    currentTab === item.id
                      ? 'bg-[#FFC400] text-black font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <IconC className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-4 border-t border-zinc-900 space-y-1">
              <button
                onClick={() => onNavigate('docs')}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </button>

              <button
                onClick={() => setTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  currentTab === 'settings' ? 'bg-[#FFC400] text-black font-bold' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </nav>
        </div>

        {/* User Footer with Theme Toggle */}
        <div className="p-4 border-t border-zinc-900 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-900 text-xs text-zinc-300 hover:text-white"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#FFC400]" /> : <Moon className="w-3.5 h-3.5" />}
              {isDark ? 'Light Theme' : 'Dark Theme'}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">TOGGLE</span>
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FFC400] text-black font-bold flex items-center justify-center text-xs">
                {developerUser.provider === 'google' ? 'G' : developerUser.provider === 'github' ? <Code className="w-4 h-4" /> : (developerUser.avatar || 'M')}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-zinc-200 truncate">{developerUser.name}</div>
                <div className="text-[10px] text-zinc-500 truncate">{developerUser.email}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-zinc-500 hover:text-rose-400 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="md:hidden bg-zinc-950 text-white p-4 flex items-center justify-between border-b border-zinc-800">
          <SignoraLogo isDark={true} />
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1 text-[#FFC400]">
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="p-1 text-zinc-300">
              {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileNavOpen && (
          <div className="md:hidden bg-zinc-900 text-white p-4 space-y-2 border-b border-zinc-800">
            {['overview', 'apps', 'keys', 'users', 'activity', 'playground', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => { setTab(tab); setMobileNavOpen(false); }}
                className="block w-full text-left px-3 py-2 rounded text-sm capitalize font-medium"
              >
                {tab}
              </button>
            ))}
            <button onClick={onLogout} className="block w-full text-left px-3 py-2 text-rose-400 text-sm">
              Log Out
            </button>
          </div>
        )}

        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-6xl mx-auto w-full">
          {isDataLoading ? <DashboardShimmer isDark={isDark} /> : <>
          {currentTab === 'overview' && (
            <DashboardOverviewTab
              developerUser={developerUser}
              selectedApp={selectedApp}
              appsCount={apps.length}
              onOpenCreateApp={onOpenCreateApp}
              onOpenCreateKey={onOpenCreateKey}
              activity={activity}
              dashboardSummary={dashboardSummary}
              setTab={setTab}
              isDark={isDark}
            />
          )}

          {currentTab === 'apps' && (
            <DashboardAppsTab
              apps={apps}
              selectedApp={selectedApp}
              setSelectedAppId={setSelectedAppId}
              onOpenCreateApp={onOpenCreateApp}
              setTab={setTab}
              isDark={isDark}
            />
          )}

          {currentTab === 'keys' && (
            <DashboardKeysTab
              selectedApp={selectedApp}
              apiKeys={apiKeys}
              onOpenCreateKey={onOpenCreateKey}
              onRevokeKey={async (key) => {
                await revokeApiKey(selectedApp.id, key.id);
                setApiKeys((current) => current.map((item) => item.id === key.id ? { ...item, revoked: true } : item));
                showToast(`Key revoked: ${key.name}`, 'info');
              }}
              showToast={showToast}
              isDark={isDark}
            />
          )}

          {currentTab === 'users' && (
            <DashboardUsersTab
              selectedApp={selectedApp}
              users={users}
              showToast={showToast}
              isDark={isDark}
            />
          )}

          {currentTab === 'activity' && (
            <DashboardActivityTab
              selectedApp={selectedApp}
              activity={activity}
              isDark={isDark}
            />
          )}

          {currentTab === 'playground' && (
            <DashboardPlaygroundTab
              selectedApp={selectedApp}
              showToast={showToast}
              isDark={isDark}
            />
          )}

          {currentTab === 'settings' && (
            <DashboardSettingsTab
              selectedApp={selectedApp}
              developerUser={developerUser}
              onUpdateApplication={onUpdateApplication}
              onUpdateDeveloper={onUpdateDeveloper}
              showToast={showToast}
              isDark={isDark}
            />
          )}
          </>}
        </main>
      </div>
    </div>
  );
}

function DashboardShimmer({ isDark }) {
  const surface = isDark ? 'bg-zinc-800/70' : 'bg-zinc-200/80';
  return <div className="space-y-6 animate-pulse" aria-label="Loading dashboard data">
    <div className={`h-9 w-64 rounded ${surface}`} />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((item) => <div key={item} className={`h-36 rounded-2xl ${surface}`} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={`lg:col-span-2 h-72 rounded-2xl ${surface}`} />
      <div className={`h-72 rounded-2xl ${surface}`} />
    </div>
  </div>;
}

function formatRelativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

function DashboardOverviewTab({ developerUser, selectedApp, dashboardSummary, setTab, isDark }) {
  const { metrics, chart, activity } = dashboardSummary;
  const chartMaximum = Math.max(1, ...chart.map((item) => Math.max(item.success, item.failed)));

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good morning, {developerUser.name}.
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Here's what's happening across <strong className={isDark ? 'text-white' : 'text-zinc-800'}>{selectedApp.name}</strong> ({selectedApp.environment}).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTab('keys')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 ${
              isDark
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-200 hover:bg-zinc-800'
                : 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Generate API Key
          </button>
          <button
            onClick={() => setTab('apps')}
            className="px-3.5 py-2 text-xs font-bold bg-[#FFC400] text-black rounded-lg hover:bg-[#F0B800] shadow-sm flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Applications
          </button>
        </div>
      </div>

      {/* Numerical Stats Counters with smooth AnimatedCounter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { title: 'Applications', num: metrics.applications, sub: 'Active Applications' },
          { title: 'Active Users', num: metrics.active_users, sub: 'Active end users', isGood: true },
          { title: 'Successful Auth', num: metrics.successful_auth, sub: 'Verified OTP and OAuth logins', isGood: true },
          { title: 'OTP Verifications', num: metrics.otp_verifications, sub: 'Verified OTP requests' },
        ].map((stat, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl border shadow-sm space-y-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
              isDark ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200/90 hover:border-zinc-300'
            }`}
          >
            <div className="text-xs font-semibold text-zinc-400">{stat.title}</div>
            <div className="text-3xl font-extrabold tracking-tight">
              <AnimatedCounter targetValue={stat.num} prefix={stat.prefix || ""} />
            </div>
            <div className={`text-[11px] ${stat.isGood ? 'text-emerald-500 font-medium' : 'text-zinc-500'}`}>
              {stat.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Chart & Activity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`lg:col-span-8 p-6 rounded-2xl border shadow-sm space-y-4 ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Authentication Activity</h3>
              <p className="text-xs text-zinc-400">Successful vs Failed authentication requests</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FFC400]"></span> Successful
              </span>
              <span className="flex items-center gap-1.5 text-zinc-400">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-600"></span> Failed / Blocked
              </span>
            </div>
          </div>

          <div className="h-44 w-full pt-4 flex items-end justify-between gap-3">
            {chart.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full max-w-[36px] flex flex-col items-center gap-1 h-full justify-end">
                  <div
                    style={{ height: `${(item.failed / chartMaximum) * 100}%` }}
                    className="w-full rounded-t bg-zinc-600 group-hover:bg-rose-400 transition-all duration-500"
                  ></div>
                  <div
                    style={{ height: `${(item.success / chartMaximum) * 100}%` }}
                    className="w-full rounded-t bg-[#FFC400] group-hover:bg-[#e6b000] transition-all duration-500"
                  ></div>
                </div>
                <span className="text-[11px] font-mono text-zinc-400">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`lg:col-span-4 p-6 rounded-2xl border shadow-sm space-y-4 flex flex-col justify-between ${
          isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold">Live Event Feed</h3>
              <button onClick={() => setTab('activity')} className="text-xs text-[#FFC400] font-semibold hover:underline">
                View All
              </button>
            </div>

            <div className="space-y-3">
              {!activity.length && (
                <p className="text-xs text-zinc-400">No authentication activity yet.</p>
              )}
              {activity.map((evt) => (
                <div key={evt.id} className="flex items-start gap-2.5 pb-2.5 border-b border-zinc-800/40 last:border-0 transition-colors hover:bg-zinc-800/10 rounded p-1">
                  {evt.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                  )}
                  <div className="overflow-hidden text-xs">
                    <div className="font-semibold truncate">{evt.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{evt.user}</div>
                    <div className="text-[10px] text-zinc-500 font-mono">{formatRelativeTime(evt.created_at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setTab('playground')}
            className="w-full py-2.5 rounded-xl bg-zinc-950 text-[#FFC400] hover:bg-black font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 border border-zinc-800 hover:border-[#FFC400]"
          >
            <Play className="w-3.5 h-3.5" />
            Open Auth Test Playground &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

function DashboardAppsTab({ apps, selectedApp, setSelectedAppId, onOpenCreateApp, setTab, isDark }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Applications</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage your isolated Application applications, URLs, and environments.
          </p>
        </div>
        <button
          onClick={onOpenCreateApp}
          className="px-4 py-2 text-xs font-bold bg-[#FFC400] text-black rounded-lg hover:bg-[#F0B800] shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Create Application
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {apps.map((app) => {
          const isCurrent = app.id === selectedApp.id;
          return (
            <div
              key={app.id}
              className={`p-6 rounded-2xl border transition-all duration-300 shadow-sm space-y-4 ${
                isCurrent
                  ? 'border-2 border-[#FFC400]'
                  : isDark ? 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700' : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{app.name}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#FFC400] text-black">
                        ACTIVE CONTEXT
                      </span>
                    )}
                  </div>
                  <a
                    href={app.website_url || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-400 hover:text-[#FFC400] flex items-center gap-1 mt-0.5"
                  >
                    {app.website_url || 'No website URL'} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  app.environment === 'production'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {app.environment}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2 border-y border-zinc-800/40 text-xs">
                <div>
                  <span className="text-zinc-400">Created:</span>
                  <div className="font-semibold">{new Date(app.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Environment:</span>
                  <div className="font-semibold capitalize">{app.environment}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setTab('overview');
                  }}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition"
                >
                  Open Application &rarr;
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DashboardKeysTab({ selectedApp, apiKeys, onOpenCreateKey, onRevokeKey, showToast, isDark }) {
  const copyKey = (val) => {
    navigator.clipboard.writeText(val);
    showToast('Key prefix copied to clipboard.');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">API Keys</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Secure credentials used by your backend to communicate with Signora APIs for {selectedApp.name}.
          </p>
        </div>
        <button
          onClick={onOpenCreateKey}
          className="px-4 py-2 text-xs font-bold bg-[#FFC400] text-black rounded-lg hover:bg-[#F0B800] shadow-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Create API Key
        </button>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className={`p-4 border-b flex items-center justify-between text-xs font-semibold ${
          isDark ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-600'
        }`}>
          <span>Active Application Keys ({apiKeys.length})</span>
          <span className="font-normal">Scoped to: {selectedApp.name}</span>
        </div>

        <div className="divide-y divide-zinc-800/40">
          {apiKeys.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs">
              No API keys generated yet. Create one to integrate your backend.
            </div>
          ) : (
            apiKeys.map((key) => (
              <div key={key.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">{key.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${key.revoked ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {key.revoked ? 'Revoked' : 'Active'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                      {selectedApp.environment}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-400">
                    <span>{key.key_prefix}</span>
                    <button onClick={() => copyKey(key.key_prefix)} className="hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-xs text-zinc-400">
                  <div>
                    <span className="block text-[10px] text-zinc-500">Created</span>
                    <span>{new Date(key.created_at).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-500">Last Used</span>
                    <span>{key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never used'}</span>
                  </div>
                  {!key.revoked && <button
                    onClick={() => onRevokeKey(key)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Revoke Key
                  </button>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardUsersTab({ selectedApp, users, isDark }) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Application Users</h1>
          <p className="text-xs text-zinc-400 mt-1">
            End users registered strictly under <strong className={isDark ? 'text-white' : 'text-zinc-800'}>{selectedApp.name}</strong>. Multi-Application isolation.
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`pl-9 pr-4 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
              isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-300'
            }`}
          />
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm overflow-hidden ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`uppercase tracking-wider font-mono border-b ${
              isDark ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-500'
            }`}>
              <tr>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Auth Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Last Login</th>
                <th className="px-6 py-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-zinc-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className={isDark ? 'hover:bg-zinc-800/40 transition' : 'hover:bg-zinc-50 transition'}>
                    <td className="px-6 py-4 font-semibold">{u.name}</td>
                    <td className="px-6 py-4 font-mono text-zinc-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                        'bg-[#FFC400]/20 text-[#FFC400]'
                      }`}>
                        End user
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 font-medium ${u.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span> {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{u.last_login_at ? formatRelativeTime(u.last_login_at) : 'Never'}</td>
                    <td className="px-6 py-4 text-zinc-500 font-mono">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DashboardActivityTab({ selectedApp, activity, isDark }) {
  const [filter, setFilter] = useState('All');

  const filtered = activity.filter(a => {
    if (filter === 'All') return true;
    if (filter === 'OTP') return a.event.startsWith('otp_');
    if (filter === 'OAuth') return a.event.startsWith('oauth_');
    if (filter === 'Success') return a.status === 'success';
    if (filter === 'Failed') return a.status === 'failed';
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Authentication Activity</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time audit log of OTP and OAuth verification events for {selectedApp.name}.
          </p>
        </div>

        <div className={`flex flex-wrap items-center gap-1.5 p-1 rounded-xl border text-xs ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
        }`}>
          {['All', 'OTP', 'OAuth', 'Success', 'Failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-[#FFC400] text-black font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className={`rounded-2xl border shadow-sm divide-y divide-zinc-800/40 overflow-hidden ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        {filtered.map((item) => (
          <div key={item.id} className="p-5 flex items-start justify-between gap-4 hover:bg-zinc-800/20 transition">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                item.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {item.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5">
                <div className="text-sm font-bold">{item.title}</div>
                <div className="text-xs text-zinc-400 font-mono">{item.user}</div>
              </div>
            </div>
            <span className="text-xs font-mono text-zinc-500 shrink-0">
              {formatRelativeTime(item.created_at)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPlaygroundTab({ selectedApp, showToast, isDark }) {
  const [playTab, setPlayTab] = useState('otp');
  const [testEmail, setTestEmail] = useState('alex@example.com');
  const [applicationKey, setApplicationKey] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '', '', '']);
  const [responseLog, setResponseLog] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const otpInputRefs = useRef([]);

  const fillOtp = (value, startIndex = 0) => {
    const digits = value.replace(/\D/g, '').slice(0, 6 - startIndex).split('');
    if (!digits.length) return;
    const next = [...enteredOtp];
    digits.forEach((digit, offset) => { next[startIndex + offset] = digit; });
    setEnteredOtp(next);
    const focusIndex = Math.min(startIndex + digits.length, 5);
    requestAnimationFrame(() => otpInputRefs.current[focusIndex]?.focus());
  };

  const handleOtpChange = (event, index) => {
    const value = event.target.value;
    if (value.length > 1) return fillOtp(value, index);
    if (value && !/^\d$/.test(value)) return;
    const next = [...enteredOtp];
    next[index] = value;
    setEnteredOtp(next);
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === 'Backspace' && !enteredOtp[index] && index > 0) {
      event.preventDefault();
      const next = [...enteredOtp];
      next[index - 1] = '';
      setEnteredOtp(next);
      otpInputRefs.current[index - 1]?.focus();
    }
    if (event.key === 'ArrowLeft' && index > 0) otpInputRefs.current[index - 1]?.focus();
    if (event.key === 'ArrowRight' && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleSendOtp = async () => {
    if (!applicationKey.trim()) return alert('Paste an active application API key to continue.');
    setIsProcessing(true);
    try {
      const response = await sendOtp({ apiKey: applicationKey, email: testEmail });
      setIsProcessing(false);
      setOtpSent(true);
      setResponseLog(response);
      showToast('OTP dispatched to ' + testEmail);
    } catch (error) {
      setResponseLog(error.response?.data || { message: error.message });
      alert(error.response?.data?.message || 'OTP request failed.');
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!applicationKey.trim()) return alert('Paste an active application API key to continue.');
    setIsProcessing(true);
    try {
      const response = await verifyOtp({ apiKey: applicationKey, email: testEmail, otp: enteredOtp.join('') });
      setIsProcessing(false);
      setResponseLog(response);
      showToast('User verified and End User JWT issued!');
    } catch (error) {
      setResponseLog(error.response?.data || { message: error.message });
      alert(error.response?.data?.message || 'OTP verification failed.');
      setIsProcessing(false);
    }
  };

  const handleOAuth = async () => {
    if (!applicationKey.trim()) return alert('Paste an active application API key to continue.');
    setIsProcessing(true);
    try {
      const response = await startOAuth({ apiKey: applicationKey, provider: playTab });
      setResponseLog(response);
      window.location.assign(response.authorization_url);
    } catch (error) {
      setResponseLog(error.response?.data || { message: error.message });
      alert(error.response?.data?.message || `Unable to start ${playTab} OAuth.`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-extrabold">Authentication Playground</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Test Signora's Django REST endpoints live directly from your console without writing code.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-6 p-6 rounded-2xl border shadow-sm space-y-6 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div className="flex items-center gap-2 border-b border-zinc-800/40 pb-3">
            {['otp', 'google', 'github'].map(tab => (
              <button
                key={tab}
                onClick={() => { setPlayTab(tab); setResponseLog(null); setOtpSent(false); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                  playTab === tab ? 'bg-[#FFC400] text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab === 'otp' ? 'Email OTP' : tab === 'google' ? 'Google OAuth' : 'GitHub OAuth'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5">Application API Key</label>
            <input type="password" value={applicationKey} onChange={(e) => setApplicationKey(e.target.value)} placeholder="ak_test_… or ak_live_…"
              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'}`} />
            <p className="mt-1.5 text-[10px] text-zinc-500">The key is used only for this request and is never saved.</p>
          </div>

          {playTab === 'otp' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold mb-1.5">End-User Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className={`flex-1 px-3.5 py-2 rounded-xl border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                      isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
                    }`}
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-[#FFC400] hover:bg-[#F0B800] text-black text-xs font-bold rounded-xl transition"
                  >
                    Send OTP
                  </button>
                </div>
              </div>

              {otpSent && (
                <div className={`p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-amber-50/80 border-amber-200'
                }`}>
                  <div className="text-xs font-semibold">
                    Enter the 6-digit code sent to {testEmail}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {enteredOtp.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(element) => { otpInputRefs.current[idx] = element; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={idx === 0 ? 'one-time-code' : 'off'}
                        maxLength={6}
                        value={digit}
                        onChange={(event) => handleOtpChange(event, idx)}
                        onKeyDown={(event) => handleOtpKeyDown(event, idx)}
                        onPaste={(event) => { event.preventDefault(); fillOtp(event.clipboardData.getData('text'), idx); }}
                        className={`w-10 h-12 text-center text-lg font-bold font-mono rounded-lg border focus:ring-2 focus:ring-[#FFC400] focus:outline-none ${
                          isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-300'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={isProcessing}
                    className="w-full py-2.5 bg-[#FFC400] hover:bg-[#F0B800] text-black font-bold text-xs rounded-lg transition"
                  >
                    Verify & Issue JWT &rarr;
                  </button>
                </div>
              )}
            </div>
          )}

          {playTab !== 'otp' && (
            <div className="p-6 text-center space-y-3 text-zinc-400 text-xs">
              <Globe className="w-8 h-8 mx-auto text-zinc-500" />
              <div>Start a real {playTab.toUpperCase()} authorization flow for {selectedApp.name}.</div>
              <button
                onClick={handleOAuth}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg bg-[#FFC400] text-black font-bold text-xs"
              >
                Continue with {playTab === 'google' ? 'Google' : 'GitHub'}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-6 rounded-2xl bg-zinc-950 border border-zinc-800 p-5 font-mono text-xs text-zinc-300 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-zinc-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-[#FFC400]" />
                Response Inspector
              </span>
              <span className="text-[10px] text-zinc-500">JSON Payload</span>
            </div>

            <div className="py-4">
              {responseLog ? (
                <pre className="text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(responseLog, null, 2)}
                </pre>
              ) : (
                <div className="text-zinc-600 italic py-12 text-center">
                  Trigger an action on the left to inspect the live Django REST JSON response.
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 text-[10px] text-zinc-500 flex items-center justify-between">
            <span>Django REST Response Gateway</span>
            <span className="text-[#FFC400]">Status: 200 OK</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSettingsTab({ selectedApp, developerUser, onUpdateApplication, onUpdateDeveloper, showToast, isDark }) {
  const [developerName, setDeveloperName] = useState(developerUser.name);
  const [appName, setAppName] = useState(selectedApp.name);
  const [appUrl, setAppUrl] = useState(selectedApp.website_url || '');

  useEffect(() => {
    setAppName(selectedApp.name);
    setAppUrl(selectedApp.website_url || '');
  }, [selectedApp]);

  useEffect(() => setDeveloperName(developerUser.name), [developerUser.name]);

  return (
    <div className="space-y-8 animate-fade-in-up max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold">Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage developer profile, application credentials, and Application configuration.
        </p>
      </div>

      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <h3 className="text-base font-bold">Developer Account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Developer Name</label>
            <input
              type="text"
              value={developerName}
              onChange={(e) => setDeveloperName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-300'
              }`}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Email Address</label>
            <input
              type="email"
              disabled
              defaultValue={developerUser.email}
              className="w-full px-3 py-2 rounded-lg border border-zinc-800 bg-zinc-800/40 text-zinc-500"
            />
          </div>
        </div>
      </div>

      <button onClick={async () => {
        try {
          await onUpdateDeveloper({ username: developerName });
          showToast('Developer profile changes applied.');
        } catch (error) { alert(error.response?.data?.message || 'Unable to update developer profile.'); }
      }} className="px-4 py-2 text-xs font-bold rounded-lg bg-[#FFC400] text-black hover:bg-[#F0B800] transition">Save Developer Profile</button>

      <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
        isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold">Application: {selectedApp.name}</h3>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {selectedApp.environment}
          </span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">Application Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-300'
              }`}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Production URL</label>
            <input
              type="text"
              value={appUrl}
              onChange={(e) => setAppUrl(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-300'
              }`}
            />
          </div>
        </div>

        <button
          onClick={async () => {
            try {
              await onUpdateApplication(selectedApp.id, {
                name: appName,
                website_url: appUrl || null,
              });
            } catch (error) {
              alert(error.response?.data?.message || 'Unable to update application settings.');
            }
          }}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-[#FFC400] text-black hover:bg-[#F0B800] transition"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function CreateApplicationModal({ onClose, onCreate, isDark }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [env, setEnv] = useState('Production');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreate({ name, website_url: url || null, environment: env.toLowerCase() });
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to create application.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 space-y-6 ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Create Application</h3>
            <p className="text-xs text-zinc-400">Register a new isolated multi-Application application.</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1.5">Application Name</label>
            <input
              type="text"
              required
              placeholder="e.g. MyShop, FinTrack"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-300'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">Website URL</label>
            <input
              type="url"
              placeholder="https://myshop.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-300'
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1.5">Environment</label>
            <div className="grid grid-cols-2 gap-3">
              {['Development', 'Production'].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEnv(item)}
                  className={`py-2 px-3 rounded-xl border font-semibold text-xs transition text-center ${
                    env === item
                      ? 'border-[#FFC400] bg-[#FFC400]/20 text-[#FFC400] font-bold'
                      : isDark ? 'border-zinc-800 text-zinc-400 hover:border-zinc-700' : 'border-zinc-200 text-zinc-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#FFC400] hover:bg-[#F0B800] text-black font-bold text-xs rounded-xl transition"
            >
              {isSubmitting ? 'Creating…' : 'Create Application →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateApiKeyModal({ currentApp, onClose, newlyCreatedRawKey, setNewlyCreatedRawKey, onCreateKey, isDark }) {
  const [keyName, setKeyName] = useState('Backend Primary Key');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await onCreateKey(keyName || 'API Key');
    } catch (error) {
      alert(error.response?.data?.message || 'Unable to generate API key.');
    }
  };

  const copySecret = () => {
    if (!newlyCreatedRawKey) return;
    navigator.clipboard.writeText(newlyCreatedRawKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-6 ${
        isDark ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Generate API Key</h3>
            <p className="text-xs text-zinc-400">Scoped to {currentApp.name} ({currentApp.environment})</p>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!newlyCreatedRawKey ? (
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1.5">Key Friendly Name</label>
              <input
                type="text"
                required
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Production Backend Worker"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#FFC400] ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white' : 'border-zinc-300'
                }`}
              />
            </div>

            <p className="text-zinc-400 leading-relaxed">
              This secret credential will be authorized to execute authentication requests on behalf of <strong>{currentApp.name}</strong>.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#FFC400] hover:bg-[#F0B800] text-black font-bold text-xs rounded-xl transition"
              >
                Generate Secret Key &rarr;
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5 animate-fade-in">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-[#FFC400]/30 text-[#FFC400] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-[#FFC400]" />
                Important Security Notice
              </div>
              <p className="text-xs text-zinc-300">
                Your API key will only be shown once. Store it securely in your backend environment variables before leaving this page.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 text-white font-mono text-xs flex items-center justify-between border border-zinc-800">
              <span className="text-[#FFC400] select-all break-all">{newlyCreatedRawKey}</span>
              <button
                onClick={copySecret}
                className="ml-3 shrink-0 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white flex items-center gap-1.5 transition text-xs font-sans"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied ✓' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#FFC400] hover:bg-[#F0B800] text-black font-bold text-xs rounded-xl transition"
              >
                I've saved my key &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
