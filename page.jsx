'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Find Jobs That <span className="text-blue-600">Match Your Profile</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Stop applying to every job listing. Our intelligent matching system 
            ranks opportunities based on your skills, experience, and preferences.
            Get quality matches tailored just for you.
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link href="/create-profile" className="btn btn-primary text-lg">
              Start Matching
            </Link>
            <button className="btn btn-secondary text-lg" onClick={() => alert('Learn more at our docs')}>
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white rounded-lg -mx-4 px-4 mb-24">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Build Your Profile</h3>
            <p className="text-gray-600">
              Enter your job title, skills, experience level, and preferences. 
              Takes less than 2 minutes.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Smart Matching</h3>
            <p className="text-gray-600">
              Our algorithm analyzes thousands of jobs and ranks them 
              based on how well they fit your profile.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-blue-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Apply with Confidence</h3>
            <p className="text-gray-600">
              See match scores and explanations for each role. 
              Focus only on the best opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto mb-12">
          <div>
            <div className="text-5xl font-bold text-blue-600 mb-2">50K+</div>
            <p className="text-gray-600">Jobs Analyzed Daily</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-blue-600 mb-2">95%</div>
            <p className="text-gray-600">Match Accuracy</p>
          </div>
          <div>
            <div className="text-5xl font-bold text-blue-600 mb-2">10K+</div>
            <p className="text-gray-600">Users Matched</p>
          </div>
        </div>

        <Link href="/create-profile" className="btn btn-primary text-lg inline-block">
          Get Started Now
        </Link>
      </section>
    </div>
  )
}
