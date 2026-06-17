import './globals.css'

export const metadata = {
  title: 'Job Matcher - Find Your Perfect Role',
  description: 'AI-powered job matching based on your skills and profile',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="container py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">JobMatcher</div>
            <div className="flex gap-6">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition">Home</a>
              <a href="/create-profile" className="text-gray-700 hover:text-blue-600 transition">Find Jobs</a>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
        <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
          <div className="container text-center">
            <p>&copy; 2024 JobMatcher. Finding the right fit, every time.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
