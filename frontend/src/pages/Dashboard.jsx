import Navbar from "../components/Navbar";
import api from "../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

function formatUploadDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return (
    "Uploaded " +
    d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    ", " +
    d.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

function truncateName(name, max = 25) {
  if (!name) return "resume.pdf";
  return name.length > max ? `${name.slice(0, max)}...` : name;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const appliedSectionRef = useRef(null);

  const [latestResume, setLatestResume] = useState(null);
  const [totalMatched, setTotalMatched] = useState(0);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const resumeRes = await api.get("/api/resume/my");
      const jobsRes = await api.get("/api/jobs/my");

      const resumes = resumeRes.data || [];
      const sessions = jobsRes.data.sessions || [];

      setLatestResume(resumes[0] || null);
      setTotalMatched(jobsRes.data.total ?? sessions.reduce((sum, s) => sum + s.jobs.length, 0));
      setAppliedJobs(sessions.flatMap((s) => s.jobs).filter((j) => j.isApplied));
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      if (error?.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
        return;
      }
      setError(error.message || "Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    window.addEventListener("focus", fetchDashboardData);
    return () => window.removeEventListener("focus", fetchDashboardData);
  }, [location]);

  const hasResume = latestResume !== null;
  const resumeScore = latestResume?.resumeScore || null;
  const skills = latestResume?.parsedData?.skills || [];
  const firstName = localStorage.getItem("name")?.split(" ")[0] || "there";

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGradeColor = (grade) => {
    const colors = {
      A: "text-green-600 bg-green-50",
      B: "text-blue-600 bg-blue-50",
      C: "text-yellow-600 bg-yellow-50",
      D: "text-orange-600 bg-orange-50",
      F: "text-red-600 bg-red-50",
    };
    return colors[grade] || "text-gray-600 bg-gray-50";
  };

  const handleUnmarkApplied = async (userJobId) => {
    try {
      await api.patch(`/api/jobs/${userJobId}/unapply`);
      setAppliedJobs((prev) => prev.filter((job) => job.userJobId !== userJobId));
    } catch (error) {
      console.error("Unmark applied error:", error);
      setError(error.message || "Unable to update applied jobs");
    }
  };

  const scrollToApplied = () => {
    appliedSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-8 max-w-6xl mx-auto">
        {/* SECTION 1 — Welcome Banner */}
        <div className="bg-blue-600 text-white p-6 rounded-xl flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold">
              Welcome back, {firstName}! 👋
            </h2>
            <p className="text-blue-100">
              {hasResume
                ? "Ready to explore new opportunities"
                : "Upload your resume to get started"}
            </p>
          </div>
          <span className="text-sm bg-white/20 px-3 py-1 rounded">
            {today}
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* SECTION 2 — Stats Row */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Jobs Matched */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">💼</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalMatched}</p>
            <p className="text-gray-600 font-medium">Jobs Matched</p>
            <p className="text-sm text-gray-500">From your resume uploads</p>
          </div>

          {/* Resume Score */}
          <div
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/upload")}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            {resumeScore ? (
              <>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold mb-2 ${getGradeColor(resumeScore.grade)}`}>
                  {resumeScore.grade}
                </div>
                <p className="text-sm text-gray-500">{resumeScore.overall}/100</p>
                <p className="text-gray-600 font-medium">Resume Score</p>
                <p className="text-sm text-gray-500 truncate">
                  {latestResume.originalName.substring(0, 20)}
                  {latestResume.originalName.length > 20 ? "..." : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-400 mb-2">--</p>
                <p className="text-gray-600 font-medium">Resume Score</p>
                <p className="text-sm text-gray-500">Upload resume to get score</p>
              </>
            )}
          </div>
        </div>

        {/* SECTION 3 — Quick Actions */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            {
              icon: "📄",
              title: "Upload Resume",
              subtitle: "Get AI job matches instantly",
              border: "border-l-blue-500",
              action: () => navigate("/upload"),
            },
            {
              icon: "💼",
              title: "My Job Matches",
              subtitle: "Browse recommended jobs",
              border: "border-l-green-500",
              action: () => navigate("/jobs"),
            },
            {
              icon: "✅",
              title: "Applied Jobs",
              subtitle: "Track your applications",
              border: "border-l-purple-500",
              action: scrollToApplied,
            },
            {
              icon: "👤",
              title: "My Profile",
              subtitle: "Update your information",
              border: "border-l-orange-500",
              action: () => navigate("/profile"),
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border-l-4 ${card.border}`}
              onClick={card.action}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl mb-2 block">{card.icon}</span>
                  <h3 className="font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-500">{card.subtitle}</p>
                </div>
                <span className="text-gray-400">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 4 — Resume Score Detail Card */}
        {resumeScore ? (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Left - Score Circle */}
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold mb-2 ${getGradeColor(resumeScore.grade)}`}>
                  {resumeScore.grade}
                </div>
                <p className="text-lg font-semibold text-gray-900">{resumeScore.overall}/100</p>
                <p className="text-xs font-medium text-gray-700 truncate">📄 {truncateName(latestResume.originalName)}</p>
                <p className="text-xs text-gray-400">{formatUploadDate(latestResume.createdAt)}</p>
              </div>

              {/* Right - Dimension Bars */}
              <div className="space-y-3">
                {Object.entries(resumeScore.breakdown || {}).map(([key, value]) => {
                  const max = resumeScore.max_scores?.[key] || 1;
                  const pct = Math.round((value / max) * 100);
                  const label = key.charAt(0).toUpperCase() + key.slice(1);
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-sm text-gray-600 w-20">{label}</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getGradeColor(resumeScore.grade).includes('green') ? 'bg-green-500' :
                            getGradeColor(resumeScore.grade).includes('blue') ? 'bg-blue-500' :
                              getGradeColor(resumeScore.grade).includes('yellow') ? 'bg-yellow-500' :
                                getGradeColor(resumeScore.grade).includes('orange') ? 'bg-orange-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-12 text-right">{value}/{max}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom - First Tip */}
            {resumeScore.tips?.length > 0 && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-yellow-800">
                    💡 {resumeScore.tips[0].fix}
                  </p>
                  <Link
                    to="/upload"
                    className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    Improve →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <p className="text-blue-800">
                🚀 Upload your resume to unlock job matches, resume score and skill insights
              </p>
              <Link
                to="/upload"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Get Started →
              </Link>
            </div>
          </div>
        )}

        {/* SECTION 5 — Skills Snapshot */}
        {skills.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Your Skills</h3>
              <p className="text-sm text-gray-500">
                From latest resume · {latestResume.originalName.substring(0, 15)}
                {latestResume.originalName.length > 15 ? "..." : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 10).map((skill, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 10 && (
                <span className="text-gray-500 text-sm">
                  +{skills.length - 10} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* SECTION 6 — Applied Jobs */}
        <div id="applied-section" ref={appliedSectionRef}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">✅ Applied Jobs</h3>
            <p className="text-sm text-gray-500">
              {appliedJobs.length} jobs you've marked as applied
            </p>
          </div>

          {appliedJobs.length > 0 ? (
            <div className="grid grid-cols-2 gap-6">
              {appliedJobs.map((job) => (
                <div
                  key={job.userJobId}
                  className="bg-green-50 border border-green-200 p-4 rounded-xl"
                >
                  <p className="font-bold text-gray-900">{job.company}</p>
                  <p className="text-sm text-gray-700 mb-2">{job.title}</p>
                  <p className="text-xs text-gray-500 mb-3">📍 {job.location || "Remote"}</p>

                  {job.seniority && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full mr-2">
                      {job.seniority}
                    </span>
                  )}

                  <p className="text-xs text-gray-500 mt-3">
                    Applied {new Date(job.uploadedAt).toLocaleDateString()}
                  </p>

                  <div className="flex justify-between items-center mt-4">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      View →
                    </a>
                    <button
                      onClick={() => handleUnmarkApplied(job.userJobId)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-500 mb-2">📋 No applications yet</p>
              <p className="text-sm text-gray-400 mb-4">
                When you mark a job as applied on the Jobs page, it will appear here
              </p>
              <Link
                to="/jobs"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Jobs →
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
