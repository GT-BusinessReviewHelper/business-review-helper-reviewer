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
    <div className="min-h-screen bg-[#F8F9FC] flex flex-col items-center font-sans">
      <main className="w-full max-w-md px-5 py-8 flex flex-col items-center">
        
        {/* BRH Header */}
        <header className="flex items-center gap-2 self-start mb-10">
          <div className="w-8 h-8 flex flex-col items-center justify-center">
            <img src="/brh-logo.png" alt="BRH Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] leading-tight text-gray-900 tracking-tight">BRH</span>
            <span className="text-[9px] font-semibold text-gray-500 tracking-wide uppercase">BUSINESS REVIEW HELPER</span>
          </div>
        </header>

        {/* Main Heading */}
        <div className="text-center mb-8">
          <h1 className="text-[32px] font-bold leading-tight text-gray-900 mb-2">
            How was your<br />
            <span className="text-[#3261FF]">Experience</span>?
          </h1>
          <p className="text-sm text-gray-600 font-medium">One tap is all it takes.</p>
        </div>

        {/* Rating Section Title */}
        <h2 className="text-sm font-bold text-gray-900 mb-3">Rate your Experience</h2>

        {/* Rating Card */}
        <div className="w-full bg-[#0A061C] rounded-[32px] overflow-hidden relative shadow-sm mb-12">
          <div className="h-[130px] relative w-full">
            {/* Sparkles decoration (static placeholder) */}
            {selectedRating === null && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32">
                <svg viewBox="0 0 100 100" className="absolute -left-4 -top-2 w-8 h-8 text-yellow-400 fill-current">
                  <path d="M50 0 L55 35 L90 40 L55 45 L50 80 L45 45 L10 40 L45 35 Z" />
                </svg>
                <svg viewBox="0 0 100 100" className="absolute -right-6 top-0 w-12 h-12 text-yellow-400 fill-current">
                   <path d="M50 0 L58 30 L90 35 L58 40 L50 70 L42 40 L10 35 L42 30 Z" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Wavy transition */}
          <div className="absolute top-[90px] left-0 w-full overflow-hidden leading-none z-0">
            <svg viewBox="0 0 400 50" preserveAspectRatio="none" className="w-full h-[50px] fill-white block">
              <path d="M0,50 L0,30 Q50,-10 100,20 T200,10 T300,20 T400,20 L400,50 Z" />
            </svg>
          </div>

          <div className="bg-white pt-8 pb-6 px-4 relative z-10 flex flex-col items-center">
            {/* Emoji container */}
            <div className="absolute -top-[70px] w-36 h-36 flex items-center justify-center z-20">
              {selectedRating === null ? (
                <div className="w-24 h-24 rounded-full shadow-[0_4px_20px_rgba(255,165,0,0.4)] flex items-center justify-center text-5xl bg-gradient-to-b from-yellow-300 to-orange-500">
                  😊
                </div>
              ) : (
                <img src={`/emoji-${selectedRating}.png`} alt={ratingLabels[selectedRating - 1]} className="w-full h-full object-contain drop-shadow-xl" />
              )}
            </div>
            
            {/* Stars */}
            <div className="flex justify-between w-full max-w-[280px] mt-10 relative z-30">
              {[0, 1, 2, 3, 4].map((starIndex) => {
                const isSelected = selectedRating !== null && (starIndex + 1) <= selectedRating;
                return (
                  <div 
                    key={starIndex} 
                    className="flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-90"
                    onClick={() => setSelectedRating(starIndex + 1)}
                  >
                    {isSelected ? (
                      <svg className="w-7 h-7 text-yellow-400 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 1.5l3.09 6.26 6.91 1.01-5 4.87 1.18 6.88L12 17.27l-6.18 3.25 1.18-6.88-5-4.87 6.91-1.01L12 1.5z" />
                      </svg>
                    ) : (
                      <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                    <span className="text-[10px] text-gray-500 font-medium">{ratingLabels[starIndex]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Choose your Review Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-blue-50 text-[#3261FF] text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 mb-3">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z"/>
            </svg>
            AI-assisted
          </div>
          <h2 className="text-[28px] font-bold leading-tight text-gray-900 mb-2">
            Choose your<br />
            <span className="text-[#3261FF]">Review</span>
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            Pick the review that best<br />
            describes your experience.
          </p>
        </div>

        {/* Review Options */}
        <div className="w-full flex flex-col gap-3 mb-6">
          {reviewOptions.map((review, index) => {
            const isSelected = selectedReview === index;
            return (
              <button
                key={index}
                onClick={() => setSelectedReview(index)}
                className={`w-full text-left px-5 py-4 rounded-[28px] text-[13px] leading-snug transition-all duration-200 border
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
        <div className="w-full bg-[#EBF1FF] border border-blue-100 rounded-2xl p-4 flex gap-3 items-start mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#3261FF] flex-shrink-0 flex items-center justify-center mt-0.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/>
              <path d="M12 7l1.5 3H17l-3 2.5 1 3.5-3-2-3 2 1-3.5-3-2.5h3.5z" fill="#3261FF" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-gray-900">Select a review to continue</h3>
            <p className="text-[11px] leading-tight text-gray-600 mt-0.5">
              Your selected review will be copied and you&apos;ll be<br />
              redirected to the review platform.
            </p>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          className={`w-full py-4 rounded-[20px] font-bold text-lg transition-colors duration-200
            ${selectedReview !== null 
              ? 'bg-[#3261FF] text-white shadow-md' 
              : 'bg-[#B0B3BC] text-white'
            }`}
          disabled={selectedReview === null}
        >
          Continue
        </button>

        {/* Footer */}
        <p className="text-[10px] text-gray-500 mt-6 mb-4 text-center px-4">
          By continuing, you agree to our <a href="#" className="text-[#3261FF]">Terms & Conditions</a> and <a href="#" className="text-[#3261FF]">Privacy Policy</a>.
        </p>

      </main>
    </div>
  );
}
