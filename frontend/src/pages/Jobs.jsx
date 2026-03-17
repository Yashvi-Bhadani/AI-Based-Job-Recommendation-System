import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Jobs() {
  const [type, setType] = useState("All Types");
  const [location, setLocation] = useState("All Locations");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applied, setApplied] = useState({});

  const handleApply = async (jobId) => {
    try {
      await api.post(`/api/applications/${jobId}`);
      setApplied((prev) => ({ ...prev, [jobId]: "Applied successfully!" }));
    } catch (err) {
      setApplied((prev) => ({
        ...prev,
        [jobId]: err.response?.data?.message || "Failed to apply",
      }));
    }
  };

  const loadJobs = async (filters = {}) => {
    try {
      setLoading(true);
      setError("");
      const params = {};
      if (filters.type && filters.type !== "All Types") {
        params.type = filters.type;
      }
      if (filters.location && filters.location !== "All Locations") {
        params.location = filters.location;
      }

      const res = await api.get("/api/jobs", { params });
      setJobs(res.data || []);
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs({ type, location });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (nextType, nextLocation) => {
    const finalType = nextType ?? type;
    const finalLocation = nextLocation ?? location;
    setType(finalType);
    setLocation(finalLocation);
    loadJobs({ type: finalType, location: finalLocation });
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <Navbar />

      <main className="p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          ✨ AI-Recommended Jobs
        </h1>
        <p className="text-gray-500 mb-6">
          Personalized job matches based on your skills and preferences
        </p>

        {/* SEARCH & FILTERS */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search jobs, companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
          />

          <select
            value={type}
            onChange={(e) => handleFilterChange(e.target.value, null)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option>All Types</option>
            <option>Full-time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>

          <select
            value={location}
            onChange={(e) => handleFilterChange(null, e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option>All Locations</option>
            <option>Remote</option>
            <option>On-site</option>
            <option>Hybrid</option>
          </select>

          <button className="border rounded-lg px-4 py-2">⚙</button>
        </div>

        {/* JOB CARDS */}
        {error && (
          <p className="text-red-600 mb-4 text-sm">{error}</p>
        )}

        {loading ? (
          <p className="text-gray-500">Loading jobs...</p>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{job.title}</h3>
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                  {job.company}
                </p>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <div>📍 {job.location}</div>
                  <div>⏱ {job.type}</div>
                  <div>💰 {job.salary || "Not specified"}</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(job.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApply(job._id)}
                      disabled={!!applied[job._id]}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                    >
                      {applied[job._id] ? "Applied" : "Apply Now"}
                    </button>
                    <button className="border rounded p-2">🔖</button>
                  </div>
                  {applied[job._id] && (
                    <p className={`text-xs ${
                      applied[job._id] === "Applied successfully!"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}>
                      {applied[job._id]}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
