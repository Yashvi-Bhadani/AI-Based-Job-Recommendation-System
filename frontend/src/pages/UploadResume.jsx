import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import api from "../api/axios";

export default function UploadResume() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState([]);

  const loadResumes = async () => {
    try {
      const res = await api.get("/api/resumes/my");
      setResumes(res.data || []);
    } catch {
      // ignore for now, error shown only on upload
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const validateFile = (file) => {
    if (!file) return "Please select a resume file";
    const allowedExts = [".pdf", ".doc", ".docx"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExts.includes("." + ext)) {
      return "Only PDF, DOC, DOCX files are allowed";
    }
    if (file.size > 5 * 1024 * 1024) {
      return "File size must be under 5MB";
    }
    return "";
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("resume", selectedFile);

      await api.post("/api/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Resume uploaded successfully");
      setSelectedFile(null);
      await loadResumes();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to upload resume");
      }
    } finally {
      setUploading(false);
    }
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

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
            {success && (
              <p className="text-sm text-green-600 mt-2">{success}</p>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Resume"}
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

          {resumes.map((file) => (
            <div
              key={file._id}
              className="flex justify-between items-center bg-gray-50 p-4 rounded mb-3"
            >
              <div>
                <p className="font-medium">📄 {file.originalName}</p>
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                {file.status}
              </span>
            </div>
          ))}

          {!resumes.length && (
            <p className="text-sm text-gray-500">No resumes uploaded yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
