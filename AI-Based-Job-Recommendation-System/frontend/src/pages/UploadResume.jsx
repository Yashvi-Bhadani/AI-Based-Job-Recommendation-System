import Navbar from "../components/Navbar";
import { Navigate } from "react-router-dom";
import { useState } from "react";

export default function UploadResume() {

  // 🔐 PROTECT PAGE
  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select a resume file");
      return;
    }

    // 🔹 GET EXISTING RESUMES
    const resumes = JSON.parse(localStorage.getItem("resumes")) || [];

    // 🔹 CREATE RESUME ENTRY
    const newResume = {
      name: selectedFile.name,
      email: localStorage.getItem("email") || "student@email.com",
      date: new Date().toLocaleDateString(),
      status: "Active",
    };

    resumes.push(newResume);
    localStorage.setItem("resumes", JSON.stringify(resumes));

    alert("Resume uploaded successfully");
    setSelectedFile(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <Navbar />

      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
          📄 Upload Resume
        </h1>
        <p className="text-gray-500 mb-6">
          Upload your resume to get AI-powered job recommendations
        </p>

        <div className="grid grid-cols-3 gap-6">
          {/* UPLOAD BOX */}
          <div className="col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Select Your Resume</h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a PDF or DOC file. Max size 5MB.
            </p>

            <label className="border-2 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
              <span className="text-4xl mb-2">⬆️</span>
              <p className="font-medium">
                Drag & Drop your resume here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
            </label>

            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {selectedFile.name}
              </p>
            )}

            <button
              onClick={handleUpload}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Upload Resume
            </button>
          </div>

          {/* GUIDELINES */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-3">📌 Upload Guidelines</h3>
            <ul className="text-sm space-y-2">
              <li className="text-green-600">✔ PDF or DOC format</li>
              <li className="text-green-600">✔ File under 5MB</li>
              <li className="text-green-600">
                ✔ Include skills & experience
              </li>
              <li className="text-red-500">
                ✖ Avoid images & complex formatting
              </li>
            </ul>
          </div>
        </div>

        {/* RECENT UPLOADS */}
        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h3 className="font-bold mb-4">Recent Uploads</h3>

          {(JSON.parse(localStorage.getItem("resumes")) || []).map(
            (file, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-50 p-4 rounded mb-3"
              >
                <div>
                  <p className="font-medium">📄 {file.name}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded on {file.date}
                  </p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  {file.status}
                </span>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
