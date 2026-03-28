'use client'

import { useState } from 'react'

interface OnboardingProps {
  onComplete: () => void
}

const SLIDES = [
  {
    icon: '🗺️',
    title: 'Find Waste Disposal Points',
    description: 'Discover nearby locations where you can properly dispose of your waste.',
  },
  {
    icon: '🧭',
    title: 'Get Directions',
    description: 'Tap any location to get turn-by-turn directions via Google Maps.',
  },
  {
    icon: '🤝',
    title: 'Help Your Community',
    description: 'Add new spots and update status to help others find proper disposal points.',
  },
]

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1)
    } else {
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  const slide = SLIDES[currentSlide]
  const isLastSlide = currentSlide === SLIDES.length - 1

  return (
    <div className="fixed inset-0 z-[3000] bg-background flex flex-col">
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSkip}
          className="text-muted text-sm hover:text-white transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Icon */}
        <div className="text-7xl mb-8">{slide.icon}</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-4">{slide.title}</h1>

        {/* Description */}
        <p className="text-muted text-lg max-w-sm">{slide.description}</p>
      </div>

      {/* Bottom section */}
      <div className="p-6 pb-10">
        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {SLIDES.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-colors"
        >
          {isLastSlide ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  )
}
