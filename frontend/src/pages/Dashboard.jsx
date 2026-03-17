import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ applications: 0, matches: 0, views: 0, interviews: 0 });
  const [latestResume, setLatestResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, appsRes, jobsRes, resumesRes] = await Promise.all([
          api.get("/api/users/profile"),
          api.get("/api/applications/my"),
          api.get("/api/jobs"),
          api.get("/api/resumes/my"),
        ]);

        setUser(profileRes.data);

        const applications = appsRes.data || [];
        const jobs = jobsRes.data || [];
        const resumes = resumesRes.data || [];

        setLatestResume(resumes[0] || null);

        setStats({
          applications: applications.length,
          matches: jobs.length,
          views: Math.min(500, jobs.length * 10),
          interviews: applications.filter(
            (a) => a.status === "Accepted" || a.status === "Reviewed"
          ).length,
        });
      } catch {
        // graceful fallback
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const displayName = user?.name || localStorage.getItem("userName") || "Student";
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const skills = user?.skills || [];
  const profileComplete = user?.profileComplete || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        {/* WELCOME */}
        <div className="bg-blue-600 text-white p-6 rounded-xl flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold">Welcome back, {displayName}! 👋</h2>
            <p className="text-blue-100">Ready to explore new opportunities today?</p>
          </div>
          <span className="text-sm bg-white/20 px-3 py-1 rounded">{today}</span>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { title: "Applications Sent", value: stats.applications, icon: "📄" },
            { title: "Job Matches", value: stats.matches, icon: "💼" },
            { title: "Profile Views", value: stats.views, icon: "📈" },
            { title: "Interview Requests", value: stats.interviews, icon: "🎯" },
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
              📄 Resume Status{" "}
              {latestResume && <span className="text-green-500">✔</span>}
            </h3>

            {latestResume ? (
              <>
                <p className="text-sm text-gray-500">Current Resume</p>
                <p className="font-semibold mb-2">{latestResume.originalName}</p>
                <p className="text-sm text-gray-500 mb-3">
                  Last Updated: {new Date(latestResume.createdAt).toLocaleDateString()}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 mb-3">No resume uploaded yet.</p>
            )}

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Profile Completion</span>
                <span className="text-blue-600">{profileComplete ? "100%" : "50%"}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded">
                <div
                  className="h-2 bg-blue-600 rounded"
                  style={{ width: profileComplete ? "100%" : "50%" }}
                ></div>
              </div>
            </div>

            <Link
              to="/upload"
              className="block text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {latestResume ? "Update Resume" : "Upload Resume"}
            </Link>
          </div>

          {/* SKILLS */}
          <div className="col-span-2 bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              💻 Skills Overview
              <span className="ml-auto text-blue-600 text-xl cursor-pointer">+</span>
            </h3>

            {loading ? (
              <p className="text-sm text-gray-400">Loading skills...</p>
            ) : skills.length === 0 ? (
              <p className="text-sm text-gray-500">
                No skills added yet. Update your profile to add skills.
              </p>
            ) : (
              skills.map((skill, i) => (
                <div key={i} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{skill}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-green-500 rounded w-3/4"></div>
                  </div>
                </div>
              ))
            )}
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
              <div key={i} className="bg-white p-6 rounded-xl shadow">
                <h4 className="font-semibold mb-1">💼 {job}</h4>
                <p className="text-sm text-gray-500 mb-4">Match Score: 85%</p>
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
