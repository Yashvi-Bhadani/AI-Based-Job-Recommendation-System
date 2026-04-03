import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Jobs() {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSession, setOpenSession] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [totalJobs, setTotalJobs] = useState(0);

  const fetchSessions = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch("http://localhost:5000/api/jobs/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load job sessions");

      setSessions(data.sessions || []);
      setTotalJobs(data.total || 0);
      if ((data.sessions || []).length > 0) {
        setOpenSession(data.sessions[0].resumeId);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleToggleSession = (resumeId) => {
    setOpenSession((prev) => (prev === resumeId ? null : resumeId));
  };

  const handleDeleteSession = async (resumeId) => {
    if (!window.confirm("Delete this upload session and all its jobs?")) return;
    setDeleting(resumeId);
    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`http://localhost:5000/api/resume/${resumeId}/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to delete session");

      const removedCount = sessions.find((s) => s.resumeId === resumeId)?.jobs.length || 0;
      setSessions((prev) => prev.filter((s) => s.resumeId !== resumeId));
      setTotalJobs((prev) => prev - removedCount);
      if (openSession === resumeId) setOpenSession(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">💼 My Job Recommendations</h1>
            <p className="text-gray-500 text-sm">{totalJobs} jobs from {sessions.length} resume uploads</p>
          </div>
          {sessions.length > 0 && (
            <button
              onClick={async () => {
                if (!window.confirm("Clear ALL upload history? This cannot be undone.")) return;
                try {
                  const token = localStorage.getItem("token");
                  const resp = await fetch("http://localhost:5000/api/resume/history", {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  const data = await resp.json();
                  if (!resp.ok) throw new Error(data.error || "Failed to clear history");

                  setSessions([]);
                  setTotalJobs(0);
                  setOpenSession(null);
                } catch (e) {
                  setError(e.message);
                }
              }}
              className="text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-md px-3 py-1"
            >
              Clear all history
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl">{error}</div>
        )}

        {loading && (
          <div className="animate-pulse space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl shadow-sm border border-gray-100" />
            ))}
          </div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="bg-white p-10 rounded-xl border border-gray-100 text-center">
            <p className="text-3xl">📭</p>
            <p className="font-semibold mt-3">No job history yet</p>
            <p className="text-sm text-gray-500 mt-1">Upload your resume to generate job recommendations.</p>
          </div>
        )}

        {!loading && sessions.length > 0 && (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isOpen = openSession === session.resumeId;
              return (
                <div key={session.resumeId} className="bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="px-5 py-4 flex items-center justify-between gap-4">
                    <button
                      className="text-left flex-1"
                      onClick={() => handleToggleSession(session.resumeId)}
                    >
                      <p className="font-semibold text-gray-800">📄 {session.resumeName || "Untitled"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(session.uploadedAt).toLocaleString()} · {session.jobs.length} jobs
                      </p>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSession(session.resumeId)}
                        className="px-3 py-1 text-sm rounded-md bg-gray-100 text-gray-600"
                      >
                        {isOpen ? "▲" : "▼"}
                      </button>
                      <button
                        onClick={() => handleDeleteSession(session.resumeId)}
                        className="px-3 py-1 text-sm rounded-md bg-red-50 text-red-600 hover:bg-red-100"
                        disabled={deleting === session.resumeId}
                      >
                        {deleting === session.resumeId ? "Deleting..." : "🗑"}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="px-5 pb-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {session.jobs.map((job) => (
                          <JobCard
                            key={job.userJobId || job._id}
                            job={job}
                            onToggleSave={(id) => {
                              const token = localStorage.getItem("token");
                              fetch(`http://localhost:5000/api/jobs/${id}/save`, {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${token}` },
                              }).then((resp) => resp.json()).then((data) => {
                                setSessions((prev) => prev.map((s) => {
                                  if (s.resumeId !== session.resumeId) return s;
                                  return {
                                    ...s,
                                    jobs: s.jobs.map((j) =>
                                      j.userJobId === id ? { ...j, isSaved: data.isSaved } : j
                                    ),
                                  };
                                }));
                              }).catch(console.error);
                            }}
                            onMarkApplied={(id) => {
                              const token = localStorage.getItem("token");
                              fetch(`http://localhost:5000/api/jobs/${id}/apply`, {
                                method: "PATCH",
                                headers: { Authorization: `Bearer ${token}` },
                              }).then(() => {
                                setSessions((prev) => prev.map((s) => {
                                  if (s.resumeId !== session.resumeId) return s;
                                  return {
                                    ...s,
                                    jobs: s.jobs.map((j) =>
                                      j.userJobId === id ? { ...j, isApplied: true } : j
                                    ),
                                  };
                                }));
                              }).catch(console.error);
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
