import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminDashboard() {
  //  AUTH & ROLE CHECK
  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  if (localStorage.getItem("role") !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  /* ------------------ STATE ------------------ */
  const [jobs, setJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "",
    salary: "",
    skills: "",
  });

  /* ------------------ LOAD DATA ------------------ */
  useEffect(() => {
    setJobs(JSON.parse(localStorage.getItem("jobs")) || []);
    setUsers(JSON.parse(localStorage.getItem("users")) || []);
    setResumes(JSON.parse(localStorage.getItem("resumes")) || []);
  }, []);

  /* ------------------ JOB MANAGEMENT ------------------ */
  const postJob = () => {
    if (!jobForm.title || !jobForm.company) {
      alert("Job title and company are required");
      return;
    }

    const newJob = {
      ...jobForm,
      id: Date.now(),
      skills: jobForm.skills.split(",").map((s) => s.trim()),
      status: "Active",
    };

    const updatedJobs = [...jobs, newJob];
    setJobs(updatedJobs);
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));

    setJobForm({
      title: "",
      company: "",
      location: "",
      type: "",
      salary: "",
      skills: "",
    });
  };

  const deleteJob = (id) => {
    const updatedJobs = jobs.filter((j) => j.id !== id);
    setJobs(updatedJobs);
    localStorage.setItem("jobs", JSON.stringify(updatedJobs));
  };

  /* ------------------ USER MANAGEMENT ------------------ */
  const toggleUserStatus = (email) => {
    const updatedUsers = users.map((u) =>
      u.email === email
        ? { ...u, blocked: !u.blocked }
        : u
    );
    setUsers(updatedUsers);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
  };

  /* ------------------ ANALYTICS ------------------ */
  const totalUsers = users.length;
  const totalJobs = jobs.length;
  const totalResumes = resumes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto p-8">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">🛡️ Admin Dashboard</h1>

        {/* ANALYTICS (FEATURE 6) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Users", value: totalUsers },
            { label: "Total Jobs", value: totalJobs },
            { label: "Resumes Uploaded", value: totalResumes },
            { label: "Active Jobs", value: jobs.filter(j => j.status === "Active").length },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {/*  JOB MANAGEMENT */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">💼 Job Management</h2>

          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <div className="grid grid-cols-2 gap-4">
              {["title", "company", "location", "type", "salary", "skills"].map(
                (field) => (
                  <input
                    key={field}
                    placeholder={field.toUpperCase()}
                    value={jobForm[field]}
                    onChange={(e) =>
                      setJobForm({ ...jobForm, [field]: e.target.value })
                    }
                    className="border px-3 py-2 rounded"
                  />
                )
              )}
            </div>

            <button
              onClick={postJob}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Post Job
            </button>
          </div>

          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white p-4 rounded-lg shadow mb-3 flex justify-between"
            >
              <div>
                <p className="font-semibold">{job.title}</p>
                <p className="text-sm text-gray-500">
                  {job.company} • {job.location}
                </p>
              </div>
              <button
                onClick={() => deleteJob(job.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          ))}
        </section>

        {/*  USER MANAGEMENT */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">👥 User Management</h2>

          {users.map((user, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg shadow mb-3 flex justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">
                  {user.email} • {user.role}
                </p>
              </div>

              <button
                onClick={() => toggleUserStatus(user.email)}
                className={`text-sm ${
                  user.blocked ? "text-green-600" : "text-red-600"
                }`}
              >
                {user.blocked ? "Unblock" : "Block"}
              </button>
            </div>
          ))}
        </section>

        {/*  RESUME OVERSIGHT */}
        <section>
          <h2 className="text-xl font-semibold mb-4">📄 Resume Oversight</h2>

          {resumes.length === 0 && (
            <p className="text-gray-500">No resumes uploaded yet.</p>
          )}

          {resumes.map((res, i) => (
            <div
              key={i}
              className="bg-white p-4 rounded-lg shadow mb-3"
            >
              <p className="font-medium">{res.name}</p>
              <p className="text-sm text-gray-500">
                {res.email} • Uploaded on {res.date}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
