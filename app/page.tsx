'use client';

import React, { useState } from 'react';

export default function ReviewerPage() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const reviewOptions = [
    "Had a wonderful experience! The service was excellent, the staff was friendly, and everything was handled smoothly.",
    "Really impressed with the overall experience. Great service, great quality, and a team that genuinely cares about its customers.",
    "Absolutely loved my experience! Everything was smooth, professional, and well managed from start to finish.",
    "A great experience overall. Friendly service, excellent quality, and definitely an experience I'd be happy to recommend.",
    "Excellent experience from beginning to end. The service was quick, professional, and exactly what I was looking for."
  ];

  const ratingLabels = ["Poor", "Fair", "Good", "Great", "Amazing"];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#F8F9FC] flex flex-col items-center font-sans">
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
        <div className="absolute -left-24 top-[28%] h-[28rem] w-[28rem] rounded-full bg-[#3261FF]/[0.06] blur-3xl" />
        <div className="absolute -right-28 bottom-[-6rem] h-[34rem] w-[34rem] rounded-full bg-[#3261FF]/[0.08] blur-3xl" />
      </div>

      <main className="relative z-10 w-full min-w-0 max-w-[30rem] md:max-w-[33.75rem] lg:max-w-[52rem] xl:max-w-[56rem] px-4 sm:px-6 xl:px-8 py-6 sm:py-7 md:py-8 lg:py-10 flex flex-col items-center">

        {/* BRH Header */}
        <header className="flex items-center gap-2 self-start mb-6 sm:mb-8 md:mb-8">
          <div className="w-8 h-8 sm:w-9 sm:h-9 flex flex-col items-center justify-center shrink-0">
            <img src="/brh-logo.png" alt="BRH Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-[15px] sm:text-base leading-tight text-gray-900 tracking-tight">BRH</span>
            <span className="text-[9px] sm:text-[10px] font-semibold text-gray-500 tracking-wide uppercase">BUSINESS REVIEW HELPER</span>
          </div>
        </header>

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
        <div className="w-full min-w-0 max-w-[30rem] md:max-w-[32rem] lg:max-w-[36rem] bg-[#0A061C] rounded-[24px] sm:rounded-[32px] overflow-hidden relative shadow-sm mb-8 sm:mb-10">
          <div className="h-[6.5rem] sm:h-[7.5rem] md:h-[8.125rem] relative w-full">
            {selectedRating === null && (
              <div className="absolute top-8 sm:top-10 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-24 sm:h-32">
                <svg viewBox="0 0 100 100" className="absolute -left-4 -top-2 w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 fill-current">
                  <path d="M50 0 L55 35 L90 40 L55 45 L50 80 L45 45 L10 40 L45 35 Z" />
                </svg>
                <svg viewBox="0 0 100 100" className="absolute -right-6 top-0 w-9 h-9 sm:w-12 sm:h-12 text-yellow-400 fill-current">
                   <path d="M50 0 L58 30 L90 35 L58 40 L50 70 L42 40 L10 35 L42 30 Z" />
                </svg>
              </div>
            )}
          </div>

          {/* Wavy transition */}
          <div className="absolute top-[4.5rem] sm:top-[5.25rem] md:top-[5.625rem] left-0 w-full overflow-hidden leading-none z-0">
            <svg viewBox="0 0 400 50" preserveAspectRatio="none" className="w-full h-[50px] fill-white block">
              <path d="M0,50 L0,30 Q50,-10 100,20 T200,10 T300,20 T400,20 L400,50 Z" />
            </svg>
          </div>

          <div className="bg-white pt-8 pb-5 sm:pb-6 px-3 sm:px-4 relative z-10 flex flex-col items-center">
            {/* Emoji container */}
            <div className="absolute -top-14 sm:-top-16 md:-top-[70px] w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center z-20">
              {selectedRating === null ? (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shadow-[0_4px_20px_rgba(255,165,0,0.4)] flex items-center justify-center text-4xl sm:text-5xl bg-gradient-to-b from-yellow-300 to-orange-500">
                  😊
                </div>
              ) : (
                <img src={`/emoji-${selectedRating}.png`} alt={ratingLabels[selectedRating - 1]} className="w-full h-full object-contain drop-shadow-xl" />
              )}
            </div>

            {/* Stars */}
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
                    onClick={() => setSelectedRating(starIndex + 1)}
                    className="flex flex-col items-center justify-start gap-1.5 sm:gap-2 min-w-0 flex-1 max-w-[4.5rem] min-h-11 py-1 cursor-pointer transition-transform active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2 rounded-lg"
                  >
                    {isFilled ? (
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 drop-shadow-sm shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 1.5l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.27l-6.18 3.25 1.18-6.88-5-4.87 6.91-1.01L12 1.5z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-medium leading-tight text-center w-full truncate">
                      {ratingLabels[starIndex]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Choose your Review Section */}
        <div className="flex flex-col items-center text-center mb-5 sm:mb-6 w-full">
          <div className="bg-blue-50 text-[#3261FF] text-[10px] sm:text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1 mb-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true">
              <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/>
            </svg>
            AI-assisted
          </div>
          <h2 className="text-[26px] sm:text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-2">
            Choose your<br />
            <span className="text-[#3261FF]">Review</span>
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Pick the review that best describes your experience.
          </p>
        </div>

        {/* Review Options */}
        <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3 lg:gap-4 mb-5 sm:mb-6">
          {reviewOptions.map((review, index) => {
            const isSelected = selectedReview === index;
            const isLast = index === reviewOptions.length - 1;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedReview(index)}
                aria-pressed={isSelected}
                className={`w-full h-full min-w-0 text-left px-4 sm:px-5 py-3.5 sm:py-4 rounded-[24px] sm:rounded-[28px] text-[13px] sm:text-sm leading-snug transition-all duration-200 border break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2
                  ${isLast ? 'lg:col-span-2' : ''}
                  ${isSelected
                    ? 'bg-blue-50/70 border-[#3261FF] text-gray-900 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                  }`}
              >
                {review}
              </button>
            );
          })}
        </div>

        {/* Information Card */}
        <div className="w-full min-w-0 bg-[#EBF1FF] border border-blue-100 rounded-2xl p-3.5 sm:p-4 flex gap-3 items-start mb-6 sm:mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#3261FF] flex-shrink-0 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
              <path d="M12 7l1.5 3H17l-3 2.5 1 3.5-3-2-3 2 1-3.5-3-2.5h3.5z" fill="#3261FF" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-sm font-bold text-gray-900">Select a review to continue</h3>
            <p className="text-[11px] sm:text-xs leading-snug text-gray-600 mt-0.5">
              Your selected review will be copied and you&apos;ll be redirected to the review platform.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="button"
          className={`w-full lg:w-auto lg:min-w-[20rem] lg:px-16 min-h-12 py-3.5 sm:py-4 rounded-[20px] font-bold text-base sm:text-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3261FF] focus-visible:ring-offset-2
            ${selectedReview !== null
              ? 'bg-[#3261FF] text-white shadow-md'
              : 'bg-[#B0B3BC] text-white cursor-not-allowed'
            }`}
          disabled={selectedReview === null}
        >
          Continue
        </button>

        {/* Footer */}
        <p className="text-[10px] sm:text-xs text-gray-500 mt-5 sm:mt-6 mb-4 text-center px-2 sm:px-4 leading-relaxed">
          By continuing, you agree to our <a href="#" className="text-[#3261FF]">Terms & Conditions</a> and <a href="#" className="text-[#3261FF]">Privacy Policy</a>.
        </p>

      </main>
    </div>
  );
}
