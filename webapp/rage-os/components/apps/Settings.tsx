'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'display',   bn: '🖥️ প্রদর্শন',     en: '🖥️ Display' },
  { id: 'wallpaper', bn: '🖼️ ওয়ালপেপার',   en: '🖼️ Wallpaper' },
  { id: 'sound',     bn: '🔊 শব্দ',           en: '🔊 Sound' },
  { id: 'language',  bn: '🌐 ভাষা',           en: '🌐 Language' },
  { id: 'privacy',   bn: '🕵️ গোপনীয়তা',    en: '🕵️ Privacy' },
  { id: 'updates',   bn: '🔄 আপডেট',         en: '🔄 Updates' },
  { id: 'about',     bn: 'ℹ️ সম্পর্কে',      en: 'ℹ️ About' },
]

// ─── Toggle helper ────────────────────────────────────────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${on ? 'bg-[#34c759]' : 'bg-gray-300'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

// ─── Row helper ───────────────────────────────────────────────────────────────
function Row({ label, desc, children }: { label: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-3 last:mb-0">
      <div className="flex-1 pr-3">
        <p className="text-xs font-medium desktop-text">{label}</p>
        <p className="text-[10px] text-[#6e6e73]">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

export default function Settings() {
  const [cat, setCat] = useState('display')
  const [toast, setToast] = useState<string | null>(null)
  const [isEnglish, setIsEnglish] = useState(false)
  const [globeClicks, setGlobeClicks] = useState(0)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Helper: translate based on mode
  const t = (bn: string, en: string) => isEnglish ? en : bn

  function toastT(bn: string, en: string) {
    showToast(t(bn, en))
  }

  function handleGlobeClick(e: React.MouseEvent) {
    e.stopPropagation()
    setCat('language')
    const next = globeClicks + 1
    setGlobeClicks(next)
    if (next >= 5) {
      setIsEnglish((prev) => !prev)
      setGlobeClicks(0)
      showToast(
        isEnglish
          ? '🔒 SECRET LOCKED: Settings has been forced back to Bengali.'
          : '🔓 SECRET UNLOCKED: Language switched to English. How did you figure that out?'
      )
    } else {
      showToast(
        isEnglish
          ? `🌐 ${5 - next} more clicks to lock back to Bengali...`
          : `🌐 ${5 - next} আরও ক্লিক করুন... (আপনি কী খুঁজছেন?)`
      )
    }
  }

  // display toggles
  const [rotated,    setRotated]    = useState(false)
  const [turbо,      setTurbo]      = useState(false)
  const [autoSave,   setAutoSave]   = useState(true)
  const [notifs,     setNotifs]     = useState(true)

  // sound
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') return Number(localStorage.getItem('rage_volume') ?? 80)
    return 80
  })
  const [muted, setMuted] = useState(false)

  // privacy
  const [dataShare,  setDataShare]  = useState(true)
  const [location,   setLocation]   = useState(false)
  const [camera,     setCamera]     = useState(true)

  // updates
  const [updateProgress, setUpdateProgress] = useState<number | null>(null)
  const [autoUpdate, setAutoUpdate] = useState(true)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  function saveVolume(v: number) {
    setVolume(v)
    localStorage.setItem('rage_volume', String(v))
  }

  function startUpdate() {
    if (updateProgress !== null) return
    setUpdateProgress(0)
    let p = 0
    const iv = setInterval(() => {
      p += Math.floor(Math.random() * 12) + 3
      if (p >= 100) {
        clearInterval(iv)
        setUpdateProgress(null)
        toastT(
          'আপডেট সম্পূর্ণ ব্যর্থ হয়েছে। আপনার কম্পিউটার এখন আরও খারাপ।',
          'Update failed completely. Your computer is now objectively worse.'
        )
      } else {
        setUpdateProgress(p)
      }
    }, 280)
  }

  function openWallpaperPicker() {
    window.dispatchEvent(new CustomEvent('rage-open-wallpaper'))
    toastT(
      'ওয়ালপেপার পিকার খোলা হচ্ছে... (হয়তো)',
      'Opening wallpaper picker... allegedly.'
    )
  }

  // ─── Section renderers ──────────────────────────────────────────────────────

  function renderDisplay() {
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">
          {t('সমস্ত পরিবর্তন স্থায়ী এবং অপরিবর্তনীয়। শুভকামনা।', 'All changes are permanent and irreversible. Best of luck.')}
        </p>
        <Row label={t('স্ক্রিন ১৮০° ঘোরান', 'Rotate Screen 180°')} desc={t('একটি নতুন দৃষ্টিভঙ্গি। আপনার মাথা কাত করুন।', 'A fresh perspective. Please tilt your head.')}>
          <Toggle on={rotated} onToggle={() => { setRotated(r => !r); showToast(t('স্ক্রিন ঘুরছে... মাথা ঘোরাও।', 'Screen rotated. Please tilt your neck at 180°.')) }} />
        </Row>
        <Row label={t('টার্বো মোড™', 'Turbo Mode™')} desc={t('সব কিছু ১০ গুণ ধীর করে, প্রতিশ্রুতি অনুযায়ী।', 'Makes everything 10x slower, as promised.')}>
          <Toggle on={turbо} onToggle={() => { setTurbo(t2 => !t2); showToast(turbо ? t('টার্বো বন্ধ। এখন শুধু ধীর।', 'Turbo OFF. Now merely slow.') : t('টার্বো চালু। এখন অত্যন্ত ধীর।', 'Turbo ON. Now catastrophically slow.')) }} />
        </Row>
        <Row label={t('অটো-সেভ ডকুমেন্ট', 'Auto-save Documents')} desc={t('আপনার কাজ স্বয়ংক্রিয়ভাবে মুছে দেয়।', 'Automatically deletes your work.')}>
          <Toggle on={autoSave} onToggle={() => { setAutoSave(a => !a); showToast(autoSave ? t('অটো-সেভ বন্ধ। আপনার সব কাজ মুছে গেছে 😊', 'Auto-save OFF. Everything you\'ve ever written is gone. 😊') : t('অটো-সেভ চালু। চিন্তা করবেন না, কিছুই কাজ করে না।', 'Auto-save ON. Still does nothing useful.')) }} />
        </Row>
        <Row label={t('বিজ্ঞপ্তি সক্রিয় করুন', 'Enable Notifications')} desc={t('প্রতি সেকেন্ডে ৪০০টি বিজ্ঞপ্তি পান।', 'Receive 400 notifications per second.')}>
          <Toggle on={notifs} onToggle={() => { setNotifs(n => !n); showToast(notifs ? t('বিজ্ঞপ্তি বন্ধ।', 'Notifications OFF. The void is now quieter.') : t('এখন প্রতি মিলিসেকেন্ডে বিজ্ঞপ্তি পাবেন।', 'You now receive one notification per millisecond.')) }} />
        </Row>
        <Row label={t('রেজোলিউশন ৪K করুন', 'Set Resolution to 4K')} desc={t('শুধুমাত্র ৪৭ বার রিস্টার্ট করলে কাজ করবে।', 'Only works after exactly 47 restarts.')}>
          <button
            onClick={() => showToast(t('রেজোলিউশন পরিবর্তন করা হয়েছে। দয়া করে ৪৭ বার রিস্টার্ট দিন।', 'Resolution changed. Please restart 47 times to apply.'))}
            className="text-[10px] bg-[#007aff] text-white px-2 py-1 rounded"
          >{t('প্রয়োগ করুন', 'Apply')}</button>
        </Row>
      </>
    )
  }

  function renderWallpaper() {
    const wallpapers = [
      { bn: 'ডিফল্ট', en: 'Default', style: 'linear-gradient(160deg,#dde3ec,#c8d0da)' },
      { bn: 'ডার্ক স্পেস', en: 'Dark Space', style: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
      { bn: 'সূর্যাস্ত', en: 'Sunset', style: 'linear-gradient(135deg,#f093fb,#f5576c)' },
      { bn: 'সমুদ্র', en: 'Ocean', style: 'linear-gradient(135deg,#667eea,#764ba2)' },
      { bn: 'বন', en: 'Forest', style: 'linear-gradient(135deg,#11998e,#38ef7d)' },
    ]
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">
          {t(
            'এই ছবিগুলি দেখতে পাচ্ছেন? কোনোটিই সত্যিকারের কাজ করে না।',
            'See these previews? Most of them exist purely to waste your time.'
          )}
        </p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {wallpapers.map((w) => (
            <button
              key={w.en}
              onClick={() => showToast(t(`"${w.bn}" নির্বাচিত। কিন্তু কিছুই বদলাবে না।`, `"${w.en}" selected. Absolutely nothing will change.`))}
              className="rounded-lg overflow-hidden border-2 border-transparent hover:border-[#007aff] transition-colors"
              style={{ height: 48, background: w.style }}
              title={t(w.bn, w.en)}
            />
          ))}
        </div>
        <button
          onClick={openWallpaperPicker}
          className="w-full text-xs bg-[#007aff] text-white rounded-lg py-1.5 font-medium"
        >
          {t('ওয়ালপেপার পিকার খুলুন (এটি সত্যিই কাজ করে)', 'Open Wallpaper Picker (this one actually works)')}
        </button>
        <p className="text-[10px] text-[#6e6e73] mt-1 text-center">
          {t('উপরের বোতামটি একমাত্র কার্যকর বৈশিষ্ট্য।', 'The button above is the only feature here with dignity.')}
        </p>
      </>
    )
  }

  function renderSound() {
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">
          {t('ভলিউম বাড়ালে কমে যায়। এটি একটি বৈশিষ্ট্য, বাগ নয়।', 'Increasing volume lowers it. This is a feature, not a bug.')}
        </p>
        <div className="mb-4">
          <div className="flex justify-between text-[10px] text-[#6e6e73] mb-1">
            <span>{t('ভলিউম', 'Volume')}: {100 - volume}% {t('(বাস্তবে', '(actual')} {volume}%)</span>
            <span>{volume > 60 ? t('🔇 প্রায় নীরব', '🔇 almost silent') : t('🔊 কানফাটানো', '🔊 eardrum destruction')}</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => saveVolume(Number(e.target.value))}
            className="w-full accent-[#007aff]"
          />
          <p className="text-[10px] text-[#6e6e73] mt-0.5">
            {t('স্লাইডার বামে → আরও জোরে। ডানে → নীরব।', 'Slider left → louder. Slider right → silence.')}
          </p>
        </div>
        <Row label={t('নিঃশব্দ মোড', 'Mute Mode')} desc={t('সক্রিয় করলে ভলিউম ম্যাক্সে যাবে।', 'Enabling this sets volume to maximum.')}>
          <Toggle on={muted} onToggle={() => { setMuted(m => !m); toastT('নিঃশব্দ বন্ধ। এখন শুধু সামান্য কানফাটানো।', 'Mute disabled. Now merely slightly deafening.'); if (!muted) setVolume(100) }} />
        </Row>
        <Row label={t('সিস্টেম সাউন্ড ইফেক্ট', 'System Sound Effects')} desc={t('প্রতিটি ক্লিকে একটি বিরক্তিকর বিপ শুনুন।', 'Hear an irritating beep on every click.')}>
          <Toggle on={true} onToggle={() => toastT('সিস্টেম সাউন্ড বন্ধ করা যাবে না। এটি আইনে নিষিদ্ধ।', 'System sounds cannot be disabled. This is forbidden by law.')} />
        </Row>
      </>
    )
  }

  function renderLanguage() {
    if (isEnglish) {
      return (
        <>
          <p className="text-[10px] text-[#6e6e73] mb-3">
            Congratulations on finding the secret. English is now available. (Don&apos;t tell anyone.)
          </p>
          <div className="mb-3">
            <p className="text-[10px] font-medium desktop-text mb-1">Current Language</p>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-2 py-1.5 text-xs font-semibold text-green-700">
              English 🔓 (Secret Mode Active)
            </div>
          </div>
          <p className="text-[10px] font-medium desktop-text mb-1">Lock back to Bengali</p>
          <button
            onClick={() => {
              setIsEnglish(false)
              setGlobeClicks(0)
              showToast('বাংলায় ফিরে আসা হয়েছে। আপনার ইংরেজি সুবিধা বাতিল।')
            }}
            className="w-full text-xs bg-red-500 text-white rounded-lg py-1.5 mb-2"
          >
            🔒 Re-lock to Bengali (irreversible... maybe)
          </button>
          <p className="text-[10px] text-[#6e6e73] text-center italic">
            Click the 🌐 five more times to toggle again.
          </p>
        </>
      )
    }

    const langs = ['বাংলা (বাধ্যতামূলক)', 'English (অক্ষম)', 'हिन्दी (অক্ষম)', 'தமிழ் (অক্ষম)', '中文 (অক্ষম)']
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">শুধুমাত্র বাংলা সমর্থিত। অন্য ভাষা নির্বাচন করার চেষ্টা করলে ডিভাইস বিস্ফোরিত হবে।</p>
        <div className="mb-3">
          <p className="text-[10px] font-medium desktop-text mb-1">বর্তমান ভাষা</p>
          <div className="bg-[#007aff]/10 border border-[#007aff]/30 rounded-lg px-2 py-1.5 text-xs font-semibold text-[#007aff]">
            বাংলা ✓ (পরিবর্তন করা নিষিদ্ধ)
          </div>
        </div>
        <p className="text-[10px] font-medium desktop-text mb-1">অন্যান্য ভাষা</p>
        <div className="space-y-1">
          {langs.slice(1).map((l) => (
            <button
              key={l}
              onClick={() => showToast('অ্যাক্সেস অস্বীকৃত। শুধুমাত্র বাংলা সমর্থিত। আপনার ডিভাইস ব্লক করা হয়েছে।')}
              className="w-full text-left text-xs px-2 py-1.5 rounded-lg bg-gray-100 text-gray-400 line-through"
            >
              🔒 {l}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[#6e6e73] mt-3 text-center italic">আপনি সেটিংস খুললেই বাংলায় রূপান্তর হয়। এটি আমাদের পেটেন্ট করা প্রযুক্তি।</p>
      </>
    )
  }

  function renderPrivacy() {
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">
          {t('আপনার গোপনীয়তা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। (আমরা সব বিক্রি করি।)', 'Your privacy matters deeply to us. We sell all of it anyway.')}
        </p>
        <Row label={t('ডেটা শেয়ার করুন', 'Share My Data')} desc={t('আপনার সব তথ্য সর্বোচ্চ দরদাতার কাছে বিক্রি করা হচ্ছে।', 'All your data is sold to the highest bidder.')}>
          <Toggle on={dataShare} onToggle={() => { setDataShare(d => !d); toastT('ডেটা শেয়ার বন্ধ। আগেই সব বিক্রি হয়ে গেছে। 😊', 'Data sharing disabled. Unfortunately it was already sold. 😊') }} />
        </Row>
        <Row label={t('লোকেশন ট্র্যাকিং', 'Location Tracking')} desc={t('আপনার অবস্থান মঙ্গলগ্রহে পাঠানো হচ্ছে।', 'Your location is being transmitted to Mars.')}>
          <Toggle on={location} onToggle={() => { setLocation(l => !l); toastT('লোকেশন ট্র্যাকিং বন্ধ। তবে আমরা আগেই জানি।', 'Location tracking disabled. We already know where you are.') }} />
        </Row>
        <Row label={t('ক্যামেরা অ্যাক্সেস', 'Camera Access')} desc={t('ক্যামেরা ইতোমধ্যে চালু আছে। এই টগল সাজসজ্জার জন্য।', 'The camera is already on. This toggle is decorative.')}>
          <Toggle on={camera} onToggle={() => { setCamera(c => !c); toastT('ক্যামেরা ইতোমধ্যে সর্বদা চালু থাকে। এই বোতাম শুধু অনুভূতির জন্য।', 'The camera stays on regardless. This button exists for emotional support only.') }} />
        </Row>
        <button
          onClick={() => toastT('কুকিজ সফলভাবে খাওয়া হয়েছে। আপনার সেশন মুছে গেছে। লগ আউট হয়ে যাচ্ছে... (না, সত্যিই না)', 'Cookies successfully consumed. Your session has been erased. Logging out... not really.')}
          className="w-full text-xs bg-red-500 text-white rounded-lg py-1.5 mt-2 font-medium"
        >
          {t('🍪 সমস্ত কুকিজ মুছুন (বিপজ্জনক)', '🍪 Delete All Cookies (dangerous)')}
        </button>
      </>
    )
  }

  function renderUpdates() {
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">
          {t('প্রতিটি আপডেট সিস্টেমকে আরও খারাপ করে। আমাদের প্রতিশ্রুতি।', 'Every update makes the system worse. That is our promise.')}
        </p>
        <Row label={t('স্বয়ংক্রিয় আপডেট', 'Automatic Updates')} desc={t('৪৭টি রিস্টার্ট ছাড়া প্রযোজ্য নয়।', 'Will not apply without 47 restarts.')}>
          <Toggle on={autoUpdate} onToggle={() => { setAutoUpdate(a => !a); toastT('অটো-আপডেট বন্ধ। আপনি ম্যানুয়ালি ব্যর্থ হতে পারেন।', 'Auto-updates disabled. You may now fail manually.') }} />
        </Row>
        <div className="mb-3">
          <p className="text-xs font-medium desktop-text mb-0.5">{t('বর্তমান সংস্করণ', 'Current Version')}</p>
          <p className="text-[10px] text-[#6e6e73]">{t('RageOS ৪২.০.১ (অস্থির বিটা — সর্বদা)', 'RageOS 42.0.1 (unstable beta forever)')}</p>
        </div>
        {updateProgress !== null ? (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-[#6e6e73] mb-1">
              <span>{t('আপডেট হচ্ছে... ব্যর্থতায়', 'Updating... toward failure')}</span>
              <span>{updateProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#007aff] h-2 rounded-full transition-all"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-[#6e6e73] mt-1">{t('দয়া করে অপেক্ষা করুন... এটি ব্যর্থ হওয়া পর্যন্ত।', 'Please wait... until it fails completely.')}</p>
          </div>
        ) : (
          <button
            onClick={startUpdate}
            className="w-full text-xs bg-[#007aff] text-white rounded-lg py-1.5 font-medium"
          >
            {t('🔄 এখন আপডেট করুন (ব্যর্থ হবে)', '🔄 Update Now (will fail)')}
          </button>
        )}
        <button
          onClick={() => toastT('আপডেট বাতিল করা হয়েছে। তবে ক্ষতি ইতোমধ্যে হয়ে গেছে।', 'Update cancelled. The damage was already done.')}
          className="w-full text-xs bg-gray-200 text-gray-600 rounded-lg py-1.5 mt-1.5"
        >
          {t('আপডেট বাতিল করুন (কোনো লাভ নেই)', 'Cancel Update (pointless)')}
        </button>
      </>
    )
  }

  function renderAbout() {
    const rows = isEnglish
      ? [
          ['Operating System', 'RageOS 42.0 (permanently unstable)'],
          ['Processor', 'Your disappointment × 3.7 GHz'],
          ['RAM', 'Insufficient (always)'],
          ['Storage', 'Full of garbage'],
          ['Battery', '2% (for the past 6 hours)'],
          ['Serial Number', 'RAGE-XXXX-DEAD-BEEF'],
          ['User', 'Suspicious'],
          ['IP Address', 'Publicly leaked'],
          ['License', 'Expired 3 years ago'],
        ]
      : [
          ['অপারেটিং সিস্টেম', 'RageOS ৪২.০ (চিরকাল অস্থির)'],
          ['প্রসেসর', 'আপনার হতাশা × ৩.৭ GHz'],
          ['RAM', 'অপর্যাপ্ত (সর্বদা)'],
          ['স্টোরেজ', 'পরিপূর্ণ — আবর্জনা দিয়ে'],
          ['ব্যাটারি', '২% (গত ৬ ঘণ্টা ধরে)'],
          ['সিরিয়াল নম্বর', 'RAGE-XXXX-DEAD-BEEF'],
          ['ব্যবহারকারী', 'সন্দেহজনক'],
          ['আইপি ঠিকানা', 'প্রকাশ্যে শেয়ার করা হয়েছে'],
          ['লাইসেন্স', 'মেয়াদোত্তীর্ণ (৩ বছর আগে)'],
        ]
    return (
      <>
        <p className="text-[10px] text-[#6e6e73] mb-3">{t('আপনার সিস্টেম সম্পর্কে সব জানুন — সব মিথ্যা।', 'Learn everything about your system. None of it is true.')}</p>
        <div className="space-y-2 text-xs">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-black/5 pb-1">
              <span className="text-[#6e6e73]">{k}</span>
              <span className="font-medium desktop-text text-right max-w-48">{v}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => toastT('ডায়াগনস্টিক চালানো হয়েছে। ফলাফল: সব কিছু ভেঙে গেছে।', 'Diagnostics complete. Result: everything is broken.')}
          className="w-full text-xs bg-gray-200 text-gray-600 rounded-lg py-1.5 mt-3"
        >
          {t('🔍 ডায়াগনস্টিক চালান (অকেজো)', '🔍 Run Diagnostics (useless)')}
        </button>
      </>
    )
  }

  const renderers: Record<string, () => React.ReactNode> = {
    display:   renderDisplay,
    wallpaper: renderWallpaper,
    sound:     renderSound,
    language:  renderLanguage,
    privacy:   renderPrivacy,
    updates:   renderUpdates,
    about:     renderAbout,
  }

  return (
    <div className="flex relative" style={{ width: 500, height: 400 }}>
      {/* Sidebar */}
      <div className="w-36 shrink-0 border-r border-black/10 pt-1 pr-2">
        <p className="text-[9px] text-[#6e6e73] px-2 mb-1 font-medium tracking-wide">
          {t('সেটিংস', 'Settings')}
        </p>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={`w-full text-left text-xs px-2 py-1.5 rounded-lg mb-0.5 ${
              cat === c.id
                ? 'bg-[#007aff] text-white font-medium'
                : 'desktop-text hover:bg-black/5'
            }`}
          >
            {c.id === 'language' ? (
              <>
                <span
                  onClick={handleGlobeClick}
                  className="cursor-pointer select-none"
                  title={globeClicks > 0 ? `${5 - globeClicks} more...` : ''}
                >
                  🌐
                </span>
                {' '}{isEnglish ? 'Language' : 'ভাষা'}
                {globeClicks > 0 && (
                  <span className="ml-1 text-[9px] opacity-60">{'·'.repeat(globeClicks)}</span>
                )}
              </>
            ) : (
              isEnglish ? c.en.slice(3) && c.en : c.bn
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 pl-3 overflow-auto pb-10">
        <p className="text-sm font-semibold desktop-text mb-1">
          {CATEGORIES.find(c => c.id === cat)?.[isEnglish ? 'en' : 'bn'] ?? ''}
        </p>
        {renderers[cat]?.()}
      </div>

      {/* Toast */}
      {toast && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded-lg max-w-72 text-center z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
