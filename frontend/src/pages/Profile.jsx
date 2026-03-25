import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axios";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({ name: "", bio: "", skills: "" });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/users/profile");
        setUser(res.data);
        setForm({
          name: res.data.name || "",
          bio: res.data.bio || "",
          skills: (res.data.skills || []).join(", "),
        });
      } catch {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/api/users/profile", {
        name: form.name,
        bio: form.bio,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setUser(res.data);
      localStorage.setItem("userName", res.data.name);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.trim().split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")
    : "JD";

  const profilePercent = user
    ? Math.min(
        100,
        [user.name, user.bio, user.skills?.length > 0].filter(Boolean).length * 34
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* HEADER CARD */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-6 mb-8 shadow-lg">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold shadow-inner">
            {initials}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold">{user?.name || "Loading..."}</h1>
            <p className="text-blue-200 mt-1">{user?.email}</p>
            <span className="inline-block mt-2 bg-white/20 text-xs px-3 py-1 rounded-full capitalize">
              {user?.role || "student"}
            </span>
          </div>
          <button
            onClick={() => { setEditMode(!editMode); setSuccess(""); setError(""); }}
            className="bg-white text-blue-700 font-semibold px-5 py-2 rounded-lg hover:bg-blue-50 transition"
          >
            {editMode ? "Cancel" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* FEEDBACK */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-4 text-sm">
            ✅ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400 text-lg">Loading your profile...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* LEFT – INFO */}
            <div className="md:col-span-2 space-y-6">
              {/* PERSONAL INFO */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  👤 Personal Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                    {editMode ? (
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    ) : (
                      <p className="text-gray-800 font-medium">{user?.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email Address</label>
                    <p className="text-gray-800 font-medium">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Bio / About Me</label>
                    {editMode ? (
                      <textarea
                        rows={3}
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Write a short bio about yourself..."
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    ) : (
                      <p className="text-gray-700 text-sm">
                        {user?.bio || <span className="text-gray-400 italic">No bio added yet.</span>}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* SKILLS */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  💻 Skills
                </h2>

                {editMode ? (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Enter skills separated by commas
                    </label>
                    <input
                      type="text"
                      value={form.skills}
                      onChange={(e) => setForm({ ...form, skills: e.target.value })}
                      placeholder="e.g. React, Python, Machine Learning"
                      className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                ) : user?.skills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic">No skills added yet.</p>
                )}
              </div>

              {/* SAVE */}
              {editMode && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              )}
            </div>

            {/* RIGHT – SIDEBAR */}
            <div className="space-y-6">
              {/* PROFILE COMPLETION */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">📊 Profile Completion</h2>
                <div className="text-3xl font-bold text-blue-600 mb-2">{profilePercent}%</div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${profilePercent}%` }}
                  />
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    { label: "Name added", done: !!user?.name },
                    { label: "Bio added", done: !!user?.bio },
                    { label: "Skills added", done: user?.skills?.length > 0 },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className={item.done ? "text-green-500" : "text-gray-300"}>
                        {item.done ? "✅" : "⭕"}
                      </span>
                      <span className={item.done ? "text-gray-700" : "text-gray-400"}>
                        {item.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ACCOUNT INFO */}
              <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">🔐 Account Info</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role</span>
                    <span className="font-medium capitalize">{user?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Auth</span>
                    <span className="font-medium">
                      {user?.googleId ? "Google OAuth" : "Email/Password"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member since</span>
                    <span className="font-medium">
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
