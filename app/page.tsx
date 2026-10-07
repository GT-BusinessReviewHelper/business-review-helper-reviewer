'use client';

import React, { useState, useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Large pool of review texts — simulates what the backend would return
// ---------------------------------------------------------------------------
const REVIEW_POOL = [
  "Had a wonderful experience! The service was excellent, the staff was friendly, and everything was handled smoothly.",
  "Really impressed with the overall experience. Great service, great quality, and a team that genuinely cares about its customers.",
  "Absolutely loved my experience! Everything was smooth, professional, and well managed from start to finish.",
  "A great experience overall. Friendly service, excellent quality, and definitely an experience I'd be happy to recommend.",
  "Excellent experience from beginning to end. The service was quick, professional, and exactly what I was looking for.",
  "Outstanding service from start to finish! The team was professional, attentive, and went above and beyond expectations.",
  "Highly recommend this place! Every detail was handled with care, and the quality exceeded my expectations.",
  "Fantastic experience all around. The communication was clear, the work was top-notch, and the results speak for themselves.",
  "Incredible experience! Professional, efficient, and genuinely committed to customer satisfaction. Will definitely return.",
  "Five stars without hesitation. The team delivered exceptional results and made the whole process stress-free and enjoyable.",
  "Truly exceptional service. From the moment I arrived, everything felt seamless and tailored to my needs.",
  "A refreshing experience compared to others I've had. The attention to detail and care shown was remarkable.",
  "I couldn't be more satisfied with the outcome. Professional, courteous, and committed to excellence in every way.",
  "The whole experience was smooth and enjoyable. The team's dedication and expertise really shone through.",
  "Wonderful from beginning to end. The staff were knowledgeable, friendly, and made sure everything was perfect.",
  "What a fantastic team! They went above and beyond to make sure I was happy with every aspect of the service.",
  "Can't say enough good things about this experience. Polished, professional, and genuinely impressive from start to finish.",
  "Exceptional quality and care at every step. This is exactly the kind of service experience I was hoping for.",
  "Loved every moment of the experience. The team was warm, efficient, and delivered beyond what I expected.",
  "Top-tier service all the way. If you're looking for reliability and excellence, look no further.",
  "Every part of the experience felt thoughtful and well-organized. Truly a cut above the rest.",
  "I was blown away by the level of professionalism. Prompt, precise, and genuinely pleasant to work with.",
  "Simply the best experience I've had in a long time. Will be recommending to everyone I know.",
  "Couldn't be more pleased with the outcome. The team made everything feel easy and stress-free.",
  "A seamless experience from start to finish. The attention to detail here is something else entirely.",
  "Impressive quality and even more impressive service. Exceeded every expectation I had walking in.",
  "The team here truly goes the extra mile. I left feeling valued and completely satisfied.",
  "Remarkable experience! Professional, fast, and friendly — everything you could ask for in great service.",
  "Brilliant all round. The quality, care, and communication were all exemplary. Highly recommend.",
  "One of the best service experiences I've had. Smooth, efficient, and genuinely a pleasure.",
  "Phenomenal team and outstanding results. I felt in safe hands throughout the entire process.",
  "The level of care and attention I received here was unparalleled. Truly remarkable service.",
  "An absolutely flawless experience. Professional, warm, and incredibly well-executed.",
  "Outstanding from the very first interaction. The team clearly takes pride in delivering quality.",
  "Service that genuinely exceeded expectations. I'm so glad I chose this experience.",
  "Superb experience! The team's expertise and warmth made every step of the process a pleasure.",
  "Hands down the best experience in this category. Polished, professional and genuinely caring.",
  "From start to finish, everything was handled with precision and kindness. Highly impressed.",
  "Stellar results and an even better experience. I'll be back without a second thought.",
  "Exceptional, efficient, and genuinely enjoyable. This team really knows what they're doing.",
];

// ---------------------------------------------------------------------------
// The FIRST set is always exactly these 4 reviews
// ---------------------------------------------------------------------------
const FIXED_FIRST_SET = [
  "Had a wonderful experience! The service was excellent, the staff was friendly, and everything was handled smoothly.",
  "Really impressed with the overall experience. Great service, great quality, and a team that genuinely cares about its customers.",
  "Absolutely loved my experience! Everything was smooth, professional, and well managed from start to finish.",
  "A great experience overall. Friendly service, excellent quality, and definitely an experience I'd be happy to recommend.",
];

// Pick the next 4 reviews from the pool in fixed order, skipping already-used indices
function generateReviewSet(usedIndices: Set<number>): {
  reviews: string[];
  newUsedIndices: Set<number>;
} {
  let available = REVIEW_POOL.map((_, i) => i).filter(i => !usedIndices.has(i));
  if (available.length < 4) available = REVIEW_POOL.map((_, i) => i).filter(i => i >= 4); // recycle only 4+
  const picked = available.slice(0, 4);
  return {
    reviews: picked.map(i => REVIEW_POOL[i]),
    newUsedIndices: new Set<number>([...usedIndices, ...picked]),
  };
}

export default function ReviewerPage() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loaderStep, setLoaderStep] = useState(0);
  const [toast, setToast] = useState<{ id: number; message: string; submessage?: string } | null>(null);

  // Dynamic review sets
  const [loadedSets, setLoadedSets] = useState<string[][]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [usedReviewIndices, setUsedReviewIndices] = useState<Set<number>>(new Set());

  // Generate new set loading state (only for the Generate button)
  const [isGeneratingNewSet, setIsGeneratingNewSet] = useState(false);
  const [switchLoaderStep, setSwitchLoaderStep] = useState(0);

  // Mobile/tablet slide index (0 = cards 0-1 of set 0, 1 = cards 2-3 of set 0, 2 = cards 0-1 of set 1, etc.)
  const [mobileSlide, setMobileSlide] = useState(0);

  // Per-card copied state: key = `${setIndex}-${cardIndex}`
  const [copiedCards, setCopiedCards] = useState<Set<string>>(new Set());

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchStepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);
  const ratingCardRef = useRef<HTMLDivElement | null>(null);
  const ratingScrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const loaderSteps = [
    'Analysing your rating…',
    'Generating reviews…',
    'Personalising results…',
  ];

  const switchLoaderTexts = ['Analysing…', 'Generating…'];

  const showToast = (message: string, submessage?: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ id: Date.now(), message, submessage });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleSelectReview = async (index: number) => {
    setSelectedReview(index);
    const text = loadedSets[currentSetIndex]?.[index] ?? '';
    await copyToClipboard(text);
    showToast('Review copied to clipboard!', 'Your selected review is ready to paste.');
    // Show tick on the copy icon for this card
    const cardKey = `${currentSetIndex}-${index}`;
    setCopiedCards(prev => new Set([...prev, cardKey]));
    setTimeout(() => {
      setCopiedCards(prev => {
        const next = new Set(prev);
        next.delete(cardKey);
        return next;
      });
    }, 2500);
  };

  // Handle copy icon click on a card — also selects & highlights the card
  const handleCopyCard = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedReview(index);
    const cardKey = `${currentSetIndex}-${index}`;
    const text = loadedSets[currentSetIndex]?.[index] ?? '';
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedCards(prev => new Set([...prev, cardKey]));
      showToast('Review copied to clipboard!', 'Your review is ready to paste.');
      setTimeout(() => {
        setCopiedCards(prev => {
          const next = new Set(prev);
          next.delete(cardKey);
          return next;
        });
      }, 2500);
    }
  };

  const handleContinue = async () => {
    if (selectedReview === null) return;
    const text = loadedSets[currentSetIndex]?.[selectedReview] ?? '';
    await copyToClipboard(text);
    showToast('Review copied to clipboard!', 'Redirecting to the review platform…');
  };

  const handleStarClick = (rating: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (stepRef.current) clearInterval(stepRef.current);
    if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
    if (switchStepRef.current) clearInterval(switchStepRef.current);

    setSelectedRating(rating);
    setSelectedReview(null);
    setCurrentSetIndex(0);
    setMobileSlide(0);
    setIsGeneratingNewSet(false);
    setIsGenerating(true);
    setLoaderStep(0);

    // Scroll immediately when star is clicked while loader is active across all devices
    setTimeout(() => {
      ratingScrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);

    let step = 0;
    stepRef.current = setInterval(() => {
      step = (step + 1) % 3;
      setLoaderStep(step);
    }, 1000);

    timerRef.current = setTimeout(() => {
      if (stepRef.current) clearInterval(stepRef.current);
      setLoadedSets([FIXED_FIRST_SET]);
      // Mark indices 0-3 as used so Generate never repeats these reviews
      setUsedReviewIndices(new Set([0, 1, 2, 3]));
      setIsGenerating(false);
    }, 3000);
  };

  // Generate button clicked: Only the button shows loading state with disabled styling.
  // Existing reviews remain visible, and no skeleton loader is shown.
  const handleGenerateSet = () => {
    if (isGeneratingNewSet) return;
    setIsGeneratingNewSet(true);
    setSwitchLoaderStep(0);

    const result = generateReviewSet(usedReviewIndices);
    const newSet = result.reviews;
    const newUsedIndices = result.newUsedIndices;

    let step = 0;
    switchStepRef.current = setInterval(() => {
      step = (step + 1) % 2;
      setSwitchLoaderStep(step);
    }, 750);

    switchTimerRef.current = setTimeout(() => {
      if (switchStepRef.current) clearInterval(switchStepRef.current);
      setLoadedSets(prev => {
        const nextSets = [...prev, newSet];
        const newIdx = nextSets.length - 1;
        setCurrentSetIndex(newIdx);
        setMobileSlide(newIdx * 2);
        return nextSets;
      });
      setUsedReviewIndices(newUsedIndices);
      setSelectedReview(null);
      setIsGeneratingNewSet(false);
    }, 1600);
  };

  // Navigate Next set (Desktop): If at the last set, wraps back to the first set (0).
  const handleNextSet = () => {
    if (loadedSets.length <= 1) return;
    const nextIdx = currentSetIndex < loadedSets.length - 1 ? currentSetIndex + 1 : 0;
    setCurrentSetIndex(nextIdx);
    setMobileSlide(nextIdx * 2);
    setSelectedReview(null);
  };

  // Navigate Previous set (Desktop): Enabled only when currentSetIndex > 0.
  const handlePrevSet = () => {
    if (currentSetIndex > 0) {
      const prevIdx = currentSetIndex - 1;
      setCurrentSetIndex(prevIdx);
      setMobileSlide(prevIdx * 2);
      setSelectedReview(null);
    }
  };

  // Jump directly to an already-generated set dot (Desktop).
  const handleDotClick = (setIdx: number) => {
    if (setIdx !== currentSetIndex && setIdx >= 0 && setIdx < loadedSets.length && !isGeneratingNewSet) {
      setCurrentSetIndex(setIdx);
      setMobileSlide(setIdx * 2);
      setSelectedReview(null);
    }
  };

  // Mobile/Tablet 2-card slide navigation:
  const handleMobilePrevSlide = () => {
    if (mobileSlide > 0) {
      const newSlide = mobileSlide - 1;
      setMobileSlide(newSlide);
      setCurrentSetIndex(Math.floor(newSlide / 2));
      setSelectedReview(null);
    }
  };

  const handleMobileNextSlide = () => {
    const totalSlides = loadedSets.length * 2;
    if (totalSlides <= 1) return;
    const newSlide = mobileSlide < totalSlides - 1 ? mobileSlide + 1 : 0;
    setMobileSlide(newSlide);
    setCurrentSetIndex(Math.floor(newSlide / 2));
    setSelectedReview(null);
  };

  const handleMobileDotClick = (slideIdx: number) => {
    if (slideIdx !== mobileSlide && !isGeneratingNewSet) {
      setMobileSlide(slideIdx);
      setCurrentSetIndex(Math.floor(slideIdx / 2));
      setSelectedReview(null);
    }
  };

  // Preload all emoji images for instant switching on rapid clicks & cleanup on unmount
  useEffect(() => {
    const emojiList = [
      '/emoji-default.png',
      '/emoji-1.png',
      '/emoji-2.png',
      '/emoji-3.png',
      '/emoji-4.png',
      '/emoji-5.png',
    ];
    emojiList.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (stepRef.current) clearInterval(stepRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (switchTimerRef.current) clearTimeout(switchTimerRef.current);
      if (switchStepRef.current) clearInterval(switchStepRef.current);
    };
  }, []);

  const reviewOptions = loadedSets[currentSetIndex] ?? [];
  const ratingLabels = ['Poor', 'Fair', 'Good', 'Great', 'Amazing'];

  // Mobile / Tablet calculation: 2 cards per slide, 2 dots per set
  const totalMobileSlides = loadedSets.length * 2;
  const currentSetForMobile = loadedSets[Math.floor(mobileSlide / 2)] ?? [];
  const mobileCardOffset = (mobileSlide % 2) * 2;
  const currentMobileCards = currentSetForMobile.slice(mobileCardOffset, mobileCardOffset + 2);
  const mobileCardStartIndex = mobileCardOffset;

  // Show "Choose your Review" only when star selected AND not loading
  const showChooseSection = selectedRating !== null && !isGenerating;

  // Copy icon SVG
  const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );

  // Copied checkmark SVG
  const CopiedIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const SkeletonCards = ({ count = 1 }: { count?: number }) => (
    <div className="w-full grid grid-cols-1 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full px-4 sm:px-5 py-5 sm:py-6 rounded-[20px] sm:rounded-[24px] border border-gray-100 bg-white overflow-hidden relative min-h-[140px]"
          aria-hidden="true"
        >
          <div className="h-3 rounded-full bg-gray-100 mb-2.5 w-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.5s_infinite] bg-[length:200%_100%]" />
          </div>
          <div className="h-3 rounded-full bg-gray-100 mb-2.5 w-5/6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.5s_infinite_0.2s] bg-[length:200%_100%]" />
          </div>
          <div className="h-3 rounded-full bg-gray-100 w-3/4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-[shimmer_1.5s_infinite_0.4s] bg-[length:200%_100%]" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#F8F9FC] flex flex-col items-center font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
        <div className="absolute -left-24 top-[28%] h-[28rem] w-[28rem] rounded-full bg-[#3261FF]/[0.06] blur-3xl" />
        <div className="absolute -right-28 bottom-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[#3261FF]/[0.08] blur-3xl" />
      </div>

      {/* BRH Header — positioned at top-left of the page */}
      <header className="w-full flex items-center justify-start px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-4 sm:pt-6 md:pt-7 lg:pt-8 z-20 shrink-0">
        <a href='https://brh.geloratech.com/' target='_blank'>
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-11 md:h-11 lg:w-12 lg:h-12 flex flex-col items-center justify-center shrink-0">

              <img src="/brh-logo.png" alt="BRH Logo" className="w-full h-full object-contain" />

            </div>
            <div className="flex flex-col min-w-0 justify-center">
              <span className="font-extrabold text-[15px] sm:text-base md:text-lg lg:text-xl leading-tight text-gray-900 tracking-tight">BRH</span>
              <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs font-bold text-gray-500 tracking-wider uppercase leading-tight mt-0.5">BUSINESS REVIEW HELPER</span>
            </div>
          </div>
        </a>
      </header>

      <main className="relative z-10 w-full min-w-0 max-w-[30rem] md:max-w-[33.75rem] lg:max-w-[52rem] xl:max-w-[56rem] px-4 sm:px-6 xl:px-8 pt-2 sm:pt-4 md:pt-4 pb-6 sm:pb-10 flex flex-col items-center my-auto lg:my-0">
        {/* Main Heading */}
        <div className="text-center mb-5 sm:mb-6 md:mb-7 w-full">
          <h1 className="text-[28px] sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold leading-tight text-gray-900 mb-2">
            How was your<br />
            <span className="text-[#3261FF]">Experience</span>?
          </h1>
          <p className="text-sm text-gray-600 font-medium">One tap is all it takes.</p>
        </div>

        <h2 className="text-sm font-bold text-gray-900 mb-3">Rate your Experience</h2>

        {/* Rating Card */}
        <div ref={ratingCardRef} className="w-full min-w-0 max-w-[30rem] md:max-w-[32rem] lg:max-w-[36rem] bg-[#05031C] rounded-[28px] sm:rounded-[36px] overflow-hidden relative shadow-[0px_4px_30px_rgba(0,0,0,0.25)] mb-4 sm:mb-5">
          {/* Scroll anchor: aligns viewport so top of star card is off-screen and 4 review cards fit cleanly in view */}
          <div
            ref={ratingScrollAnchorRef}
            className="absolute top-[5.65rem] sm:top-[5.25rem] md:top-[6.25rem] left-0 w-full pointer-events-none"
            aria-hidden="true"
          />

          {/* Dark top section */}
          <div className="h-[8.5rem] sm:h-[9.5rem] md:h-[10.5rem] relative w-full bg-[#05031C]" />

          {/* Smooth multi-crest wave separating dark sky and white bottom section (matches Image 2) */}
          <div className="absolute top-[6.5rem] sm:top-[7.5rem] md:top-[8.5rem] left-0 w-full overflow-hidden leading-none z-0 pointer-events-none">
            <svg viewBox="0 0 400 50" preserveAspectRatio="none" className="w-full h-[50px] fill-white block">
              <path d="M 0,28 C 20,28 35,10 55,10 C 75,10 90,28 110,28 C 130,28 145,10 165,10 C 185,10 200,28 220,28 C 240,28 260,10 280,10 C 300,10 315,28 335,28 C 352,28 362,12 375,12 C 385,12 393,17 400,22 L 400,50 L 0,50 Z" />
            </svg>
          </div>

          {/* White bottom section */}
          <div className="bg-white pt-6 sm:pt-7 pb-5 sm:pb-6 px-3 sm:px-4 relative z-10 flex flex-col items-center">
            {/* 3D Emoji (default cute emoji with sparkles/beams, or selected rating emoji) */}
            <div className="absolute -top-[4rem] sm:-top-[4.5rem] md:-top-[5rem] w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center z-20 pointer-events-none">
              {/* Default Emoji */}
              <img
                src="/emoji-default.png"
                alt="Default Rating Emoji"
                loading="eager"
                decoding="sync"
                className={`absolute inset-0 w-full h-full object-contain drop-shadow-xl transition-all duration-150 ${
                  selectedRating === null
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75 pointer-events-none'
                }`}
              />
              {/* Star Rating Emojis (1 to 5) - Pre-rendered for 0ms instantaneous response on rapid clicks */}
              {[1, 2, 3, 4, 5].map((ratingVal) => (
                <img
                  key={ratingVal}
                  src={`/emoji-${ratingVal}.png`}
                  alt={ratingLabels[ratingVal - 1]}
                  loading="eager"
                  decoding="sync"
                  className={`absolute inset-0 w-full h-full object-contain drop-shadow-xl transition-all duration-150 ${
                    selectedRating === ratingVal
                      ? 'opacity-100 scale-100 animate-[emojiPop_0.25s_cubic-bezier(0.34,1.56,0.64,1)]'
                      : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                />
              ))}
            </div>

            {/* Stars row */}
            <div
              className="flex justify-between items-start w-full min-w-0 max-w-none sm:max-w-sm mt-8 sm:mt-10 relative z-30"
              role="group"
              aria-label="Rate your experience"
            >
              {[0, 1, 2, 3, 4].map((starIndex) => {
                const isFilled = selectedRating !== null && (starIndex + 1) <= selectedRating;
                const isPressed = selectedRating === starIndex + 1;
                return (
                  <button
                    key={starIndex}
                    type="button"
                    aria-label={`${ratingLabels[starIndex]}, ${starIndex + 1} of 5`}
                    aria-pressed={isPressed}
                    onClick={() => handleStarClick(starIndex + 1)}
                    className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-[4.5rem] min-h-11 py-1 cursor-pointer transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 rounded-lg"
                  >
                    {isFilled ? (
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFC02C] drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="#FFC02C" stroke="#FFC02C" strokeWidth={1} aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[#FFC02C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="#FFC02C" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    <span className="text-[10px] sm:text-[11px] text-gray-900 font-normal leading-tight text-center w-full truncate">
                      {ratingLabels[starIndex]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Choose your Review Section — only visible when star selected AND not loading */}
        {showChooseSection && (
          <div ref={reviewSectionRef} className="flex flex-col items-center text-center mb-3 sm:mb-4 w-full">
            <div className="bg-blue-50 text-[#3261FF] text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 mb-2">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
              </svg>
              AI-assisted
            </div>
            <h2 className="text-[24px] sm:text-[28px] md:text-3xl font-bold leading-tight text-gray-900 mb-1.5">
              Choose your<br />
              <span className="text-[#3261FF]">Review</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              Pick the review that best describes your experience.
            </p>
          </div>
        )}

        {/* AI Loader — shown while generating */}
        {isGenerating && (
          <div ref={reviewSectionRef} className="w-full min-w-0 flex flex-col items-center justify-center gap-4 mb-5 sm:mb-6 py-8 min-h-[460px]" aria-live="polite" aria-label="Generating reviews">
            {/* Animated spinner ring */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 animate-spin" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                <circle cx="24" cy="24" r="20" stroke="#EBF1FF" strokeWidth="4" />
                <path d="M44 24a20 20 0 00-20-20" stroke="#3261FF" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#3261FF]" aria-hidden="true">
                  <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
                </svg>
              </div>
            </div>
            {/* Cycling loader text */}
            <p className="text-sm font-semibold text-[#3261FF] transition-all duration-300">
              {loaderSteps[loaderStep]}
            </p>
            {/* Skeleton placeholder cards */}
            <SkeletonCards />
          </div>
        )}

        {/* Review Options — shown after generation completes */}
        {/* Review Options — shown after initial generation completes */}
        {!isGenerating && selectedRating !== null && loadedSets.length > 0 && (
          <div className="w-full min-w-0 flex flex-col gap-4 mb-5 sm:mb-6">
            {/* ── DESKTOP (lg+): 2×2 grid, Nav: Prev (left) | Dots (centered) | Next (right), Generate below ── */}
            <div className="hidden lg:block w-full min-w-0">
              <div className="w-full min-w-0 grid grid-cols-2 gap-4">
                {reviewOptions.map((review, index) => {
                  const isSelected = selectedReview === index;
                  const cardKey = `${currentSetIndex}-${index}`;
                  const isCopied = copiedCards.has(cardKey);
                  return (
                    <button
                      key={`${currentSetIndex}-${index}`}
                      type="button"
                      onClick={() => handleSelectReview(index)}
                      aria-pressed={isSelected}
                      className={`w-full min-w-0 text-left px-4 sm:px-5 py-3.5 sm:py-4 rounded-[22px] sm:rounded-[24px] text-xs sm:text-sm leading-relaxed transition-all duration-200 border-2 break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 relative min-h-[112px] sm:min-h-[120px]
                        ${isSelected
                          ? 'bg-blue-50/80 border-[#3261FF] text-gray-900 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                        }`}
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={isCopied ? 'Copied' : 'Copy review'}
                        onClick={(e) => handleCopyCard(index, e)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopyCard(index, e as unknown as React.MouseEvent); } }}
                        className={`absolute top-3 right-3 p-1.5 rounded-lg transition-all duration-200 z-10 cursor-pointer
                          ${isCopied
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-400 hover:text-[#3261FF] hover:bg-blue-50'
                          }`}
                      >
                        {isCopied ? <CopiedIcon /> : <CopyIcon />}
                      </span>
                      <span className="block pr-7">{review}</span>
                    </button>
                  );
                })}
              </div>

              {/* Desktop navigation bar: Prev | Dots (centered) | Next */}
              <div className="w-full relative flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={handlePrevSet}
                  disabled={currentSetIndex === 0 || isGeneratingNewSet}
                  aria-label="Previous set of reviews"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-[#3261FF] hover:text-[#3261FF] hover:bg-blue-50/60 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-white active:scale-95 shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                  Previous
                </button>

                {/* Set dots placed in exact horizontal center above Generate more */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 justify-center pointer-events-auto" role="tablist" aria-label="Review set pages">
                  {loadedSets.map((_, setIdx) => (
                    <button
                      key={setIdx}
                      type="button"
                      role="tab"
                      aria-selected={setIdx === currentSetIndex}
                      aria-label={`Review set ${setIdx + 1}`}
                      onClick={() => handleDotClick(setIdx)}
                      disabled={isGeneratingNewSet}
                      className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-1 shrink-0 ${setIdx === currentSetIndex
                        ? 'w-5 h-2.5 bg-[#3261FF]'
                        : 'w-2.5 h-2.5 bg-gray-300 hover:bg-[#3261FF]/50 cursor-pointer'
                        }`}
                    />
                  ))}
                </div>

                {/* Next button */}
                <button
                  type="button"
                  onClick={handleNextSet}
                  disabled={loadedSets.length <= 1 || isGeneratingNewSet}
                  aria-label="Next set of reviews"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:border-[#3261FF] hover:text-[#3261FF] hover:bg-blue-50/60 transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-white active:scale-95 shrink-0 cursor-pointer"
                >
                  Next
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 5l5 5-5 5" />
                  </svg>
                </button>
              </div>

              {/* Generate button (center) */}
              <div className="w-full flex justify-center mt-3">
                <button
                  type="button"
                  onClick={handleGenerateSet}
                  disabled={isGeneratingNewSet}
                  aria-label="Generate new set of reviews"
                  className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 active:scale-95 shrink-0
                    ${isGeneratingNewSet
                      ? 'bg-blue-50/70 text-[#3261FF]/60 border border-[#3261FF]/25 cursor-not-allowed'
                      : 'bg-blue-50/80 hover:bg-[#3261FF] text-[#3261FF] hover:text-white border border-[#3261FF]/30 hover:border-[#3261FF] cursor-pointer'
                    }`}
                >
                  {isGeneratingNewSet ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-[#3261FF]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>{switchLoaderTexts[switchLoaderStep]}</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                        <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
                      </svg>
                      <span>Generate more</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── MOBILE & TABLET (< lg): 2 cards stacked full-width, Dots above, Action row (Prev | Generate | Next) below ── */}
            <div className="lg:hidden w-full min-w-0 flex flex-col gap-3">
              {/* Two cards stacked in full width (no side arrows) */}
              <div className="w-full flex flex-col gap-2.5">
                {currentMobileCards.map((review, i) => {
                  const realIndex = mobileCardStartIndex + i;
                  const isSelected = selectedReview === realIndex;
                  const currentSetForCard = Math.floor(mobileSlide / 2);
                  const cardKey = `${currentSetForCard}-${realIndex}`;
                  const isCopied = copiedCards.has(cardKey);
                  return (
                    <button
                      key={`${currentSetForCard}-${realIndex}`}
                      type="button"
                      onClick={() => handleSelectReview(realIndex)}
                      aria-pressed={isSelected}
                      className={`w-full min-w-0 text-left px-4 py-3 sm:py-3.5 rounded-[18px] sm:rounded-[20px] text-[13.5px] sm:text-base leading-relaxed transition-all duration-200 border-2 break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 relative
                        ${isSelected
                          ? 'bg-blue-50/80 border-[#3261FF] text-gray-900 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
                        }`}
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label={isCopied ? 'Copied' : 'Copy review'}
                        onClick={(e) => handleCopyCard(realIndex, e)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopyCard(realIndex, e as unknown as React.MouseEvent); } }}
                        className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-1.5 rounded-lg transition-all duration-200 z-10 cursor-pointer
                          ${isCopied
                            ? 'text-green-600 bg-green-50'
                            : 'text-gray-400 hover:text-[#3261FF] hover:bg-blue-50'
                          }`}
                      >
                        {isCopied ? <CopiedIcon /> : <CopyIcon />}
                      </span>
                      <span className="block font-medium w-full pr-7">{review}</span>
                    </button>
                  );
                })}
              </div>

              {/* Set dots indicator — 2 dots per set (1 dot per 2-card slide), centered ABOVE the buttons */}
              <div className="flex items-center justify-center gap-1.5 my-1" role="tablist" aria-label="Review slide pages">
                {Array.from({ length: totalMobileSlides }).map((_, slideIdx) => (
                  <button
                    key={slideIdx}
                    type="button"
                    role="tab"
                    aria-selected={slideIdx === mobileSlide}
                    aria-label={`Review page ${slideIdx + 1}`}
                    onClick={() => handleMobileDotClick(slideIdx)}
                    disabled={isGeneratingNewSet}
                    className={`rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] ${slideIdx === mobileSlide
                      ? 'w-5 h-2 bg-[#3261FF]'
                      : 'w-2 h-2 bg-gray-300 hover:bg-[#3261FF]/50 cursor-pointer'
                      }`}
                  />
                ))}
              </div>

              {/* Action row: Prev slide arrow | Generate more (center) | Next slide arrow */}
              <div className="w-full flex items-center justify-between gap-2 sm:gap-3">
                {/* Left arrow — navigate to previous 2-card slide */}
                <button
                  type="button"
                  onClick={handleMobilePrevSlide}
                  disabled={mobileSlide === 0 || isGeneratingNewSet}
                  aria-label="Previous reviews"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-gray-200 bg-white text-gray-600 hover:border-[#3261FF] hover:text-[#3261FF] hover:bg-blue-50/60 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-white active:scale-95 shrink-0 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M13 15l-5-5 5-5" />
                  </svg>
                </button>

                {/* Generate more button — center */}
                <button
                  type="button"
                  onClick={handleGenerateSet}
                  disabled={isGeneratingNewSet}
                  aria-label="Generate more reviews"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 sm:py-3 px-4 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 active:scale-95
                    ${isGeneratingNewSet
                      ? 'bg-blue-50/70 text-[#3261FF]/60 border border-[#3261FF]/25 cursor-not-allowed'
                      : 'bg-blue-50/80 hover:bg-[#3261FF] text-[#3261FF] hover:text-white border border-[#3261FF]/30 hover:border-[#3261FF] cursor-pointer'
                    }`}
                >
                  {isGeneratingNewSet ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-[#3261FF] shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>{switchLoaderTexts[switchLoaderStep]}</span>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                        <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
                      </svg>
                      <span>Generate more</span>
                    </>
                  )}
                </button>

                {/* Right arrow — navigate to next 2-card slide (wraps to first slide on last) */}
                <button
                  type="button"
                  onClick={handleMobileNextSlide}
                  disabled={totalMobileSlides <= 1 || isGeneratingNewSet}
                  aria-label="Next reviews"
                  className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border border-gray-200 bg-white text-gray-600 hover:border-[#3261FF] hover:text-[#3261FF] hover:bg-blue-50/60 transition-all duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:bg-white active:scale-95 shrink-0 cursor-pointer"
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M7 5l5 5-5 5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Information Card */}
        {selectedRating && (
          <div className="w-full min-w-0 bg-[#EBF1FF] border border-blue-100 rounded-2xl p-3.5 sm:p-4 flex gap-3 items-start mb-6 sm:mb-8 transition-colors duration-200">
            <div className="w-8 h-8 rounded-lg bg-[#3261FF] flex-shrink-0 flex items-center justify-center mt-0.5">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
                <path d="M12 7l1.5 3H17l-3 2.5 1 3.5-3-2-3 2 1-3.5-3-2.5h3.5z" fill="#3261FF" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-bold text-gray-900">
                {selectedReview !== null ? "Review selected & copied!" : "Select a review to continue"}
              </h3>
              <p className="text-[11px] sm:text-xs leading-snug text-gray-600 mt-0.5">
                {selectedReview !== null
                  ? "Your review is copied to your clipboard. Click Continue to go to the review platform."
                  : "Your selected review will be copied and you'll be redirected to the review platform."}
              </p>
            </div>
          </div>
        )}

        {/* Continue Button */}
        {selectedRating && (
          <button
            type="button"
            onClick={handleContinue}
            className={`w-full lg:w-auto lg:min-w-[20rem] lg:px-16 min-h-12 py-3.5 sm:py-4 rounded-[20px] font-bold text-base sm:text-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2
            ${selectedReview !== null
                ? 'bg-[#3261FF] hover:bg-[#2545D8] text-white shadow-md cursor-pointer active:scale-[0.99]'
                : 'bg-[#B0B3BC] text-white cursor-not-allowed'
              }`}
            disabled={selectedReview === null}
          >
            Continue
          </button>
        )}

        {/* Footer */}
        {selectedRating && (
          <p className="text-[10px] sm:text-xs text-gray-500 mt-5 sm:mt-6 mb-4 text-center px-2 sm:px-4 leading-relaxed">
            By continuing, you agree to our <a href="https://brh.geloratech.com/terms" target="_blank" className="text-[#3261FF]">Terms & Conditions</a> and <a href="https://brh.geloratech.com/privacy" target="_blank" className="text-[#3261FF]">Privacy Policy</a>.
          </p>
        )}
      </main>

      {/* Top Right Toast Notification with Standard Project Colors and 5s Running Progress Bar */}
      {toast && (
        <aside
          key={toast.id}
          role="status"
          aria-live="polite"
          className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 flex flex-col rounded-2xl bg-white text-[#05031C] shadow-[0_12px_36px_-6px_rgba(5,3,28,0.15),0_4px_16px_-2px_rgba(49,87,255,0.12)] border border-[#3157FF]/20 overflow-hidden w-[calc(100vw-2rem)] sm:w-auto sm:min-w-[320px] sm:max-w-md animate-[toastSlideIn_0.25s_cubic-bezier(0.16,1,0.3,1)]"
        >
          <div className="flex items-center gap-3 p-3.5 sm:p-4 pr-3">
            {/* Standard Project Brand Blue Icon Badge */}
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] border border-[#3157FF]/20 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-[#3157FF]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs sm:text-sm font-semibold text-[#05031C] leading-tight">
                {toast.message}
              </span>
              {toast.submessage && (
                <span className="text-[11px] sm:text-xs text-gray-500 leading-tight mt-0.5">
                  {toast.submessage}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setToast(null)}
              aria-label="Dismiss notification"
              className="text-gray-400 hover:text-[#05031C] p-1.5 rounded-lg transition-colors ml-auto shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Running progress bar for 5 seconds using project standard brand blue #3157FF */}
          <div className="w-full h-1 bg-[#EEF2FF] overflow-hidden">
            <div
              className="h-full bg-[#3157FF] origin-left"
              style={{
                animation: 'toastProgress 5s linear forwards',
              }}
            />
          </div>
        </aside>
      )}
    </div>
  );
}
