import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// ── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onToggleSave, onMarkApplied }) {
  const matchColor =
    job.matchScore >= 75 ? "text-green-600 bg-green-50" :
    job.matchScore >= 50 ? "text-yellow-600 bg-yellow-50" :
                           "text-gray-500 bg-gray-100";

  return (
    <div className={`bg-white border rounded-xl p-5 hover:shadow-md transition-shadow ${job.isApplied ? "border-green-200" : "border-gray-100"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 truncate">{job.title}</p>
          <p className="text-sm text-gray-500">{job.company}</p>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${matchColor}`}>
          {job.matchScore}%
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 text-xs mb-3">
        {job.isRemote && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">🌐 Remote</span>
        )}
        {job.isHybrid && (
          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">🏢 Hybrid</span>
        )}
        {job.seniority && (
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{job.seniority}</span>
        )}
        {job.salary && (
          <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">💰 {job.salary}</span>
        )}
        {job.datePosted && (
          <span className="text-gray-400">📅 {job.datePosted}</span>
        )}
      </div>

      {/* Matched Skills */}
      {job.matchedSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {job.matchedSkills.slice(0, 4).map((sk, i) => (
            <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
              {sk}
            </span>
          ))}
          {job.matchedSkills.length > 4 && (
            <span className="text-xs text-gray-400">+{job.matchedSkills.length - 4}</span>
          )}
        </div>
      )}

      {/* Resume source */}
      {job.resumeName && (
        <p className="text-xs text-gray-400 mb-3 truncate">
          📄 From: {job.resumeName}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {job.url ? (
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onMarkApplied(job.userJobId)}
            className="flex-1 text-center text-xs font-medium bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {job.isApplied ? "✓ Applied" : "Apply →"}
          </a>
        ) : (
          <button disabled className="flex-1 text-xs bg-gray-100 text-gray-400 py-1.5 rounded-lg cursor-not-allowed">
            No link
          </button>
        )}
        <button
          onClick={() => onToggleSave(job.userJobId)}
          className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
            job.isSaved
              ? "bg-yellow-50 border-yellow-300 text-yellow-600"
              : "border-gray-200 text-gray-400 hover:border-yellow-300 hover:text-yellow-500"
          }`}
          title={job.isSaved ? "Unsave" : "Save"}
        >
          {job.isSaved ? "⭐" : "☆"}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Jobs() {
  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  const [groups, setGroups]       = useState([]);
  const [groupBy, setGroupBy]     = useState("country");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [activeGroup, setActiveGroup] = useState(null); // which location tab is open
  const [total, setTotal]         = useState(0);

  const fetchJobs = async (gb = groupBy) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const resp  = await fetch(`http://localhost:5000/api/jobs/my?groupBy=${gb}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to load jobs");

      setGroups(data.groups || []);
      setTotal(data.total  || 0);
      // Auto-open first group
      if (data.groups?.length > 0) setActiveGroup(data.groups[0].label);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleGroupBy = (val) => {
    setGroupBy(val);
    fetchJobs(val);
  };

  // Optimistic UI helpers
  const handleToggleSave = async (userJobId) => {
    const token = localStorage.getItem("token");
    try {
      const resp = await fetch(`http://localhost:5000/api/jobs/${userJobId}/save`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          jobs: g.jobs.map((j) =>
            j.userJobId === userJobId ? { ...j, isSaved: data.isSaved } : j
          ),
        }))
      );
    } catch (e) { console.error(e); }
  };

  const handleMarkApplied = async (userJobId) => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`http://localhost:5000/api/jobs/${userJobId}/apply`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          jobs: g.jobs.map((j) =>
            j.userJobId === userJobId ? { ...j, isApplied: true } : j
          ),
        }))
      );
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              💼 My Job Recommendations
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {total} jobs saved from your resume uploads
            </p>
          </div>

          {/* Group-by selector */}
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
            {["city", "state", "country"].map((opt) => (
              <button
                key={opt}
                onClick={() => handleGroupBy(opt)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors capitalize ${
                  groupBy === opt
                    ? "bg-blue-600 text-white font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-8 text-center text-gray-400 animate-pulse">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm">Loading your job matches...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && groups.length === 0 && (
          <div className="mt-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium text-gray-600">No jobs yet</p>
            <p className="text-sm mt-1">Upload your resume to get personalised job matches.</p>
          </div>
        )}

        {/* Location Accordion */}
        {!loading && groups.length > 0 && (
          <div className="mt-6 space-y-4">
            {groups.map((group) => (
              <div key={group.label} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Accordion header */}
                <button
                  onClick={() =>
                    setActiveGroup(activeGroup === group.label ? null : group.label)
                  }
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {group.label === "Remote" ? "🌐" : "📍"}
                    </span>
                    <span className="font-semibold text-gray-800">{group.label}</span>
                    <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                      {group.count} {group.count === 1 ? "job" : "jobs"}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {activeGroup === group.label ? "▲" : "▼"}
                  </span>
                </button>

                {/* Accordion body */}
                {activeGroup === group.label && (
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                      {group.jobs.map((job) => (
                        <JobCard
                          key={job._id}
                          job={job}
                          onToggleSave={handleToggleSave}
                          onMarkApplied={handleMarkApplied}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}




// import { useEffect, useState } from "react";
// import Navbar from "../components/Navbar";
// import api from "../api/axios";

// export default function Jobs() {
//   const [type, setType] = useState("All Types");
//   const [location, setLocation] = useState("All Locations");
//   const [search, setSearch] = useState("");
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [applied, setApplied] = useState({});

//   const handleApply = async (jobId) => {
//     try {
//       await api.post(`/api/applications/${jobId}`);
//       setApplied((prev) => ({ ...prev, [jobId]: "Applied successfully!" }));
//     } catch (err) {
//       setApplied((prev) => ({
//         ...prev,
//         [jobId]: err.response?.data?.message || "Failed to apply",
//       }));
//     }
//   };

//   const loadJobs = async (filters = {}) => {
//     try {
//       setLoading(true);
//       setError("");
//       const params = {};
//       if (filters.type && filters.type !== "All Types") {
//         params.type = filters.type;
//       }
//       if (filters.location && filters.location !== "All Locations") {
//         params.location = filters.location;
//       }

//       const res = await api.get("/api/jobs", { params });
//       setJobs(res.data || []);
//     } catch (err) {
//       setError("Failed to load jobs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadJobs({ type, location });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleFilterChange = (nextType, nextLocation) => {
//     const finalType = nextType ?? type;
//     const finalLocation = nextLocation ?? location;
//     setType(finalType);
//     setLocation(finalLocation);
//     loadJobs({ type: finalType, location: finalLocation });
//   };

//   const filteredJobs = jobs.filter((job) => {
//     const matchesSearch =
//       !search ||
//       job.title.toLowerCase().includes(search.toLowerCase()) ||
//       job.company.toLowerCase().includes(search.toLowerCase());
//     return matchesSearch;
//   });


//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* NAVBAR */}
//       <Navbar />

//       <main className="p-8 max-w-7xl mx-auto">
//         {/* HEADER */}
//         <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
//           ✨ AI-Recommended Jobs
//         </h1>
//         <p className="text-gray-500 mb-6">
//           Personalized job matches based on your skills and preferences
//         </p>

//         {/* SEARCH & FILTERS */}
//         <div className="flex gap-4 mb-8">
//           <input
//             type="text"
//             placeholder="Search jobs, companies..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}

//             className="flex-1 border rounded-lg px-4 py-2"
//           />

//           <select
//             value={type}
//             onChange={(e) => handleFilterChange(e.target.value, null)}

//             className="border rounded-lg px-4 py-2 bg-white"
//           >
//             <option>All Types</option>
//             <option>Full-time</option>
//             <option>Internship</option>
//             <option>Contract</option>
//           </select>

//           <select
//             value={location}
//             onChange={(e) => handleFilterChange(null, e.target.value)}

//             className="border rounded-lg px-4 py-2 bg-white"
//           >
//             <option>All Locations</option>
//             <option>Remote</option>
//             <option>On-site</option>
//             <option>Hybrid</option>
//           </select>

//           <button className="border rounded-lg px-4 py-2">⚙</button>
//         </div>

//         {/* JOB CARDS */}
//         {error && (
//           <p className="text-red-600 mb-4 text-sm">{error}</p>
//         )}

//         {loading ? (
//           <p className="text-gray-500">Loading jobs...</p>
//         ) : (
//           <div className="grid grid-cols-3 gap-6">
//             {filteredJobs.map((job) => (
//               <div
//                 key={job._id}
//                 className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="font-bold">{job.title}</h3>
//                   <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
//                     Active
//                   </span>
//                 </div>

//                 <p className="text-sm text-gray-500 mb-3">
//                   {job.company}
//                 </p>

//                 <div className="text-sm text-gray-600 space-y-1 mb-4">
//                   <div>📍 {job.location}</div>
//                   <div>⏱ {job.type}</div>
//                   <div>💰 {job.salary || "Not specified"}</div>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-4">
//                   {(job.skills || []).map((skill, idx) => (
//                     <span
//                       key={idx}
//                       className="text-xs bg-gray-100 px-2 py-1 rounded"
//                     >
//                       {skill}
//                     </span>
//                   ))}
//                 </div>

//                 <div className="flex flex-col gap-2">
//                   <div className="flex items-center gap-2">
//                     <button
//                       onClick={() => handleApply(job._id)}
//                       disabled={!!applied[job._id]}
//                       className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
//                     >
//                       {applied[job._id] ? "Applied" : "Apply Now"}
//                     </button>
//                     <button className="border rounded p-2">🔖</button>
//                   </div>
//                   {applied[job._id] && (
//                     <p className={`text-xs ${
//                       applied[job._id] === "Applied successfully!"
//                         ? "text-green-600"
//                         : "text-red-500"
//                     }`}>
//                       {applied[job._id]}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//       </main>
//     </div>
//   );
// }
