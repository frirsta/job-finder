'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProfile, fetchJobs } from '@/lib/api'
import Link from 'next/link'

export default function CreateProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    job_title: '',
    skills: '',
    experience_level: 'mid',
    location: '',
    cv_text: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate form
      if (!formData.name.trim() || !formData.job_title.trim() || !formData.skills.trim() || !formData.location.trim()) {
        throw new Error('Please fill in all required fields')
      }

      // Create profile
      const profile = await createProfile(formData)
      
      // Fetch jobs in the background
      await fetchJobs()

      // Redirect to results page
      router.push(`/results/${profile.id}`)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="container py-12">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Build Your Profile
          </h1>
          <p className="text-gray-600">
            Tell us about yourself so we can find the perfect job matches.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="input"
              required
            />
          </div>

          {/* Job Title */}
          <div className="mb-6">
            <label htmlFor="job_title" className="block text-sm font-semibold text-gray-900 mb-2">
              Current/Desired Job Title *
            </label>
            <input
              type="text"
              id="job_title"
              name="job_title"
              value={formData.job_title}
              onChange={handleChange}
              placeholder="e.g., Senior Python Developer, React Engineer"
              className="input"
              required
            />
          </div>

          {/* Skills */}
          <div className="mb-6">
            <label htmlFor="skills" className="block text-sm font-semibold text-gray-900 mb-2">
              Skills (comma-separated) *
            </label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g., Python, JavaScript, React, FastAPI, PostgreSQL"
              className="input"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Separate each skill with a comma
            </p>
          </div>

          {/* Experience Level */}
          <div className="mb-6">
            <label htmlFor="experience_level" className="block text-sm font-semibold text-gray-900 mb-2">
              Experience Level *
            </label>
            <select
              id="experience_level"
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              className="input"
            >
              <option value="junior">Junior (0-2 years)</option>
              <option value="mid">Mid-level (2-5 years)</option>
              <option value="senior">Senior (5+ years)</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-6">
            <label htmlFor="location" className="block text-sm font-semibold text-gray-900 mb-2">
              Location / Preference *
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Stockholm, Remote, EU"
              className="input"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              City, region, or preference like "Remote"
            </p>
          </div>

          {/* CV Text (Optional) */}
          <div className="mb-8">
            <label htmlFor="cv_text" className="block text-sm font-semibold text-gray-900 mb-2">
              CV / Additional Info (Optional)
            </label>
            <textarea
              id="cv_text"
              name="cv_text"
              value={formData.cv_text}
              onChange={handleChange}
              placeholder="Paste your CV or tell us about your background..."
              className="input resize-none h-32"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Finding Your Matches...' : 'Find My Job Matches'}
          </button>

          <p className="text-sm text-gray-500 text-center mt-4">
            Already have a profile? <Link href="/results" className="text-blue-600 hover:underline">View results</Link>
          </p>
        </form>

        {/* Info Box */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">⚡ Quick Matching</h3>
            <p className="text-gray-600 text-sm">
              Our algorithm analyzes your profile against thousands of jobs in seconds.
            </p>
          </div>
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🎯 Accuracy Focused</h3>
            <p className="text-gray-600 text-sm">
              Each match includes a score and explanation of why it fits you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
