import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      
      {/* NAVBAR */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-8 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div>
          <h1 className="text-5xl font-extrabold text-gray-800 leading-tight mb-6">
            Find Your <span className="text-blue-600">Dream Job</span>
            <br /> with AI-Powered Matching
          </h1>

          <p className="text-gray-600 text-lg mb-8 max-w-xl">
            AI Job Matcher analyzes your resume, skills, and interests to
            recommend the best job opportunities tailored just for you.
          </p>

          <div className="flex gap-4">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-7 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow"
            >
              Get Started
            </Link>

            <Link
              to="/register"
              className="border border-blue-600 text-blue-600 px-7 py-3 rounded-lg font-medium hover:bg-blue-50 transition"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="bg-white p-4 rounded-2xl shadow-xl">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="career"
            className="rounded-xl"
          />
        </div>
      </section>

      {/* TRUST STATS */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10K+", label: "Students Helped" },
            { value: "5K+", label: "Job Matches" },
            { value: "500+", label: "Companies" },
            { value: "95%", label: "Match Accuracy" },
          ].map((item, i) => (
            <div key={i}>
              <h3 className="text-3xl font-bold text-blue-600">
                {item.value}
              </h3>
              <p className="text-gray-500 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            How <span className="text-blue-600">AI Job Matcher</span> Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: "📄",
                title: "Upload Resume",
                desc: "Upload your resume securely in PDF or DOC format.",
              },
              {
                icon: "🤖",
                title: "AI Analysis",
                desc: "AI extracts skills, experience, and strengths.",
              },
              {
                icon: "🎯",
                title: "Smart Matching",
                desc: "Jobs are matched based on skill relevance.",
              },
              {
                icon: "🚀",
                title: "Apply Easily",
                desc: "Apply to the best-fit jobs with confidence.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center"
              >
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="font-semibold text-lg mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ROLES */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Job Roles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              "Frontend Developer",
              "Data Analyst",
              "Software Engineer",
              "UI/UX Designer",
              "AI/ML Engineer",
              "Full Stack Developer",
            ].map((role, i) => (
              <div
                key={i}
                className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">
                  💼 {role}
                </h3>
                <p className="text-gray-600 text-sm">
                  High demand roles matched using AI algorithms.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Students Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "-Amit Sharma",
                text: "AI Job Matcher helped me find an internship matching my skills within days.",
              },
              {
                name: "-Priya Patel",
                text: "The AI recommendations were accurate and saved a lot of time.",
              },
              {
                name: "-Rahul Mehta",
                text: "Perfect project for students looking for real career guidance.",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <p className="text-gray-600 mb-4">
                  “{review.text}”
                </p>
                <p className="font-semibold text-blue-600">
                  {review.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Start Your AI-Powered Career Journey Today
          </h2>
          <p className="text-blue-100 mb-8">
            Upload your resume and get smart job recommendations instantly.
          </p>

          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-6 text-center text-sm">
        © 2026 AI Job Matcher · All Rights Reserved
      </footer>
    </div>
  );
}
