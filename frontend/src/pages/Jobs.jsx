import { Navigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";

export default function Jobs() {


  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  const [type, setType] = useState("All Types");
  const [location, setLocation] = useState("All Locations");

  const jobs = [
    {
      title: "Frontend Developer",
      company: "TechCorp Inc.",
      location: "Remote",
      type: "Full-time",
      salary: "$80k - $120k",
      match: "95%",
      skills: ["React", "TypeScript", "Tailwind CSS", "Git"],
    },
    {
      title: "React Developer Intern",
      company: "StartupXYZ",
      location: "On-site",
      type: "Internship",
      salary: "$25/hr",
      match: "92%",
      skills: ["React", "JavaScript", "CSS", "HTML"],
    },
    {
      title: "Full Stack Developer",
      company: "Digital Agency",
      location: "Hybrid",
      type: "Full-time",
      salary: "$100k - $140k",
      match: "88%",
      skills: ["React", "Node.js", "PostgreSQL", "AWS"],
    },
    {
      title: "Junior Software Engineer",
      company: "InnovateTech",
      location: "On-site",
      type: "Full-time",
      salary: "$70k - $90k",
      match: "85%",
      skills: ["Python", "React", "SQL", "Docker"],
    },
    {
      title: "UI/UX Developer",
      company: "DesignPro Studio",
      location: "Remote",
      type: "Contract",
      salary: "$60/hr",
      match: "82%",
      skills: ["Figma", "React", "CSS", "Design Systems"],
    },
    {
      title: "Software Engineering Intern",
      company: "BigTech Corp",
      location: "Hybrid",
      type: "Internship",
      salary: "$45/hr",
      match: "78%",
      skills: ["Java", "Python", "Data Structures", "Algorithms"],
    },
  ];

  const filteredJobs = jobs.filter(
    (job) =>
      (type === "All Types" || job.type === type) &&
      (location === "All Locations" || job.location === location)
  );

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
            className="flex-1 border rounded-lg px-4 py-2"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option>All Types</option>
            <option>Full-time</option>
            <option>Internship</option>
            <option>Contract</option>
          </select>

          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
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
        <div className="grid grid-cols-3 gap-6">
          {filteredJobs.map((job, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{job.title}</h3>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                  {job.match} Match
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                {job.company}
              </p>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <div>📍 {job.location}</div>
                <div>⏱ {job.type}</div>
                <div>💰 {job.salary}</div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Apply Now
                </button>
                <button className="border rounded p-2">🔖</button>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        <div className="text-center mt-10">
          <button className="border px-6 py-2 rounded-lg hover:bg-gray-100">
            Load More Jobs
          </button>
        </div>
      </main>
    </div>
  );
}
