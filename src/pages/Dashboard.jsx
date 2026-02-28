import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Dashboard() {

  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        {/* WELCOME */}
        <div className="bg-blue-600 text-white p-6 rounded-xl flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold">
              Welcome back, John Doe! 👋
            </h2>
            <p className="text-blue-100">
              Ready to explore new opportunities today?
            </p>
          </div>
          <span className="text-sm bg-white/20 px-3 py-1 rounded">
            Wednesday, January 21, 2026
          </span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { title: "Applications Sent", value: 12, icon: "📄" },
            { title: "Job Matches", value: 48, icon: "💼" },
            { title: "Profile Views", value: 234, icon: "📈" },
            { title: "Interview Requests", value: 3, icon: "🎯" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between mb-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-green-600 text-sm">↑</span>
              </div>
              <p className="text-gray-500 text-sm">{item.title}</p>
              <h3 className="text-2xl font-bold">{item.value}</h3>
            </div>
          ))}
        </div>

        {/* RESUME + SKILLS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* RESUME */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              📄 Resume Status <span className="text-green-500">✔</span>
            </h3>
            <p className="text-sm text-gray-500">Current Resume</p>
            <p className="font-semibold mb-2">MyResume_2026.pdf</p>
            <p className="text-sm text-gray-500 mb-3">
              Last Updated: January 5, 2026
            </p>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Profile Completion</span>
                <span className="text-blue-600">75%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div className="h-2 bg-blue-600 rounded w-3/4"></div>
              </div>
            </div>

            <Link
              to="/upload"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Update Resume
            </Link>
          </div>

          {/* SKILLS */}
          <div className="col-span-2 bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              💻 Skills Overview
              <span className="ml-auto text-blue-600 text-xl cursor-pointer">
                +
              </span>
            </h3>

            {[
              { name: "React.js", level: "Advanced", percent: "85%" },
              { name: "JavaScript", level: "Advanced", percent: "90%" },
              { name: "Python", level: "Intermediate", percent: "75%" },
              { name: "Communication", level: "Advanced", percent: "80%" },
            ].map((skill, i) => (
              <div key={i} className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>
                    {skill.name}{" "}
                    <span className="text-gray-400">
                      ({skill.level})
                    </span>
                  </span>
                  <span>{skill.percent}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-green-500 rounded"
                    style={{ width: skill.percent }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* JOBS */}
        <div>
          <h3 className="font-bold mb-4">✨ AI-Recommended Jobs</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              "Frontend Developer Intern",
              "Junior Full Stack Developer",
              "UI/UX Designer Intern",
              "Software Engineering Intern",
            ].map((job, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow"
              >
                <h4 className="font-semibold mb-1">💼 {job}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Match Score: 85%
                </p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">
                  Apply Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
