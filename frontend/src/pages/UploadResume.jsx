import Navbar from "../components/Navbar";
import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";

// ── Small sub-components ──────────────────────────────────────────────────────

function MatchBadge({ score }) {
  const color =
    score >= 75 ? "bg-green-100 text-green-700" :
    score >= 50 ? "bg-yellow-100 text-yellow-700" :
                  "bg-gray-100 text-gray-500";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {score}% match
    </span>
  );
}

function JobCard({ job }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <p className="font-semibold text-gray-800 text-sm">{job.title}</p>
          <p className="text-xs text-gray-500">{job.company}</p>
        </div>
        <MatchBadge score={job.matchScore} />
      </div>

      {/* Location row */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
        {job.isRemote && (
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">🌐 Remote</span>
        )}
        {job.isHybrid && (
          <span className="bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full">🏢 Hybrid</span>
        )}
        {job.location && (
          <span>📍 {job.location}</span>
        )}
        {job.seniority && (
          <span className="capitalize">· {job.seniority}</span>
        )}
        {job.salary && (
          <span>· 💰 {job.salary}</span>
        )}
      </div>

      {/* Matched skills */}
      {job.matchedSkills?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.matchedSkills.slice(0, 5).map((sk, i) => (
            <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
              {sk}
            </span>
          ))}
          {job.matchedSkills.length > 5 && (
            <span className="text-xs text-gray-400">+{job.matchedSkills.length - 5} more</span>
          )}
        </div>
      )}

      {/* Apply button */}
      {job.url ? (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-xs font-medium bg-blue-600 text-white py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply →
        </a>
      ) : (
        <button
          disabled
          className="block w-full text-center text-xs font-medium bg-gray-100 text-gray-400 py-1.5 rounded-lg cursor-not-allowed"
        >
          No link available
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UploadResume() {
  const navigate = useNavigate();

  if (localStorage.getItem("isLoggedIn") !== "true") {
    return <Navigate to="/" replace />;
  }

  const [selectedFile, setSelectedFile]   = useState(null);
  const [isUploading, setIsUploading]     = useState(false);
  const [uploadError, setUploadError]     = useState("");
  const [aiResult, setAiResult]           = useState(null);   // parsedData
  const [topJobs, setTopJobs]             = useState([]);     // top 5 jobs
  const [totalSaved, setTotalSaved]       = useState(0);
  const [resumeId, setResumeId]           = useState(null);

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a resume file");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setAiResult(null);
    setTopJobs([]);

    try {
      const token = localStorage.getItem("token");

      const form = new FormData();
      form.append("resume", selectedFile);

      const resp = await fetch("http://localhost:5000/api/resume/upload", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      });

      const text = await resp.text();
      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Server returned invalid response");
      }

      if (!resp.ok) {
        throw new Error(data?.error || data?.message || "Upload failed");
      }

      // Save to recent uploads list (localStorage)
      const resumes = JSON.parse(localStorage.getItem("resumes")) || [];
      resumes.push({
        name:   selectedFile.name,
        email:  localStorage.getItem("email") || "",
        date:   new Date().toLocaleDateString(),
        status: "Parsed",
      });
      localStorage.setItem("resumes", JSON.stringify(resumes));

      setAiResult(data.parsedData);
      setTopJobs(data.topJobs || []);
      setTotalSaved(data.totalSaved || 0);
      setResumeId(data.resume?._id || null);
      setSelectedFile(null);

    } catch (e) {
      setUploadError(e.message || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="p-8 max-w-6xl mx-auto">
        <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
          📄 Upload Resume
        </h1>
        <p className="text-gray-500 mb-6">
          Upload your resume to get AI-powered job recommendations
        </p>

        {/* ── Upload + Guidelines ───────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="font-semibold mb-2">Select Your Resume</h2>
            <p className="text-sm text-gray-500 mb-4">
              Choose a PDF or DOCX file. Max size 5MB.
            </p>

            <label className="border-2 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
              <span className="text-4xl mb-2">⬆️</span>
              <p className="font-medium">Drag & Drop your resume here</p>
              <p className="text-sm text-gray-500">or click to browse files</p>
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
              disabled={isUploading}
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading ? "Uploading & Analysing..." : "Upload Resume"}
            </button>

            {uploadError && (
              <p className="mt-3 text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-3">📌 Upload Guidelines</h3>
            <ul className="text-sm space-y-2">
              <li className="text-green-600">✔ PDF or DOC format</li>
              <li className="text-green-600">✔ File under 5MB</li>
              <li className="text-green-600">✔ Include skills & experience</li>
              <li className="text-red-500">✖ Avoid images & complex formatting</li>
            </ul>
          </div>
        </div>

        {/* ── AI Parse Result ───────────────────────────────────────────────── */}
        {aiResult && (
          <div className="bg-white p-6 rounded-xl shadow mt-8">
            <h3 className="font-bold mb-4 text-lg">✅ AI Parsed Result</h3>

            {aiResult.error ? (
              <p className="text-red-500 text-sm">Parser error: {aiResult.error}</p>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Structured fields */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Parsed Fields</p>

                  {aiResult.name && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase">Name</p>
                      <p className="text-sm font-medium">{aiResult.name}</p>
                    </div>
                  )}
                  {aiResult.email && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase">Email</p>
                      <p className="text-sm">{aiResult.email}</p>
                    </div>
                  )}
                  {aiResult.phone && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase">Phone</p>
                      <p className="text-sm">{aiResult.phone}</p>
                    </div>
                  )}

                  {aiResult.skills?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase mb-1">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {aiResult.skills.map((sk, i) => (
                          <span key={i} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiResult.experience?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase mb-1">Experience</p>
                      {aiResult.experience.map((exp, i) => (
                        <div key={i} className="text-sm text-gray-700 mb-1 border-l-2 border-blue-300 pl-2">
                          {typeof exp === "string" ? exp : `${exp.title || ""} at ${exp.company || ""}`}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiResult.education?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 uppercase mb-1">Education</p>
                      {aiResult.education.map((edu, i) => (
                        <div key={i} className="text-sm text-gray-700 mb-1 border-l-2 border-green-300 pl-2">
                          {typeof edu === "string" ? edu : `${edu.degree || ""} - ${edu.institution || ""}`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Raw text */}
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Raw Extracted Text</p>
                  <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-96 overflow-auto border border-gray-200">
                    {aiResult.raw_text || "No raw text available"}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Top 5 Job Recommendations ─────────────────────────────────────── */}
        {topJobs.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">🎯 Top Job Matches</h3>
                <p className="text-sm text-gray-500">
                  Showing top 5 of {totalSaved} jobs saved for you
                </p>
              </div>
              <button
                onClick={() => navigate("/jobs")}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View all {totalSaved} jobs →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          </div>
        )}

        {/* Loading state for jobs while upload is happening */}
        {isUploading && (
          <div className="bg-white p-6 rounded-xl shadow mt-8 text-center">
            <div className="animate-pulse text-gray-400">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">Analysing resume & finding matching jobs...</p>
              <p className="text-xs text-gray-400 mt-1">This may take 15–30 seconds</p>
            </div>
          </div>
        )}

        {/* ── Recent Uploads ────────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-xl shadow mt-8">
          <h3 className="font-bold mb-4">Recent Uploads</h3>
          {(JSON.parse(localStorage.getItem("resumes")) || []).length === 0 ? (
            <p className="text-sm text-gray-400">No uploads yet.</p>
          ) : (
            (JSON.parse(localStorage.getItem("resumes")) || []).map((file, i) => (
              <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded mb-3">
                <div>
                  <p className="font-medium">📄 {file.name}</p>
                  <p className="text-sm text-gray-500">Uploaded on {file.date}</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
                  {file.status}
                </span>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}




// import Navbar from "../components/Navbar";

// import { Navigate } from "react-router-dom";
// import { useState } from "react";

// export default function UploadResume() {

//   // 🔐 PROTECT PAGE
//   if (localStorage.getItem("isLoggedIn") !== "true") {
//     return <Navigate to="/" replace />;
//   }

//   const [selectedFile, setSelectedFile] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadError, setUploadError] = useState("");
//   const [aiResult, setAiResult] = useState(null);

// const handleUpload = async () => {
//   if (!selectedFile) {
//     alert("Please select a resume file");
//     return;
//   }

//   setIsUploading(true);
//   setUploadError("");
//   setAiResult(null);

//   try {
//     const token = localStorage.getItem("token"); // ✅ get token

//     const form = new FormData();
//     form.append("resume", selectedFile); // ✅ FIXED key

//     const resp = await fetch("http://localhost:5000/api/resume/upload", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`, // ✅ REQUIRED
//       },
//       body: form,
//     });

//     const text = await resp.text();
//     let data;

//     try {
//       data = text ? JSON.parse(text) : {};
//     } catch {
//       console.error("Non-JSON response:", text);
//       throw new Error("Server returned invalid response");
//     }

//     if (!resp.ok) {
//       throw new Error(data?.error || data?.message || "Upload failed");
//     }

//     // Save to recent uploads
//     const resumes = JSON.parse(localStorage.getItem("resumes")) || [];
//     const newResume = {
//       name: selectedFile.name,
//       email: localStorage.getItem("email") || "student@email.com",
//       date: new Date().toLocaleDateString(),
//       status: "Parsed",
//     };
//     resumes.push(newResume);
//     localStorage.setItem("resumes", JSON.stringify(resumes));

//     console.log("AI RESULT:", data);
//     setAiResult(data);
//     setSelectedFile(null);

//   } catch (e) {
//     setUploadError(e.message || "Upload failed");
//   } finally {
//     setIsUploading(false);
//   }
// };
//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* NAVBAR */}
//       <Navbar />

//       <main className="p-8 max-w-6xl mx-auto">
//         <h1 className="text-xl font-bold mb-1 flex items-center gap-2">
//           📄 Upload Resume
//         </h1>
//         <p className="text-gray-500 mb-6">
//           Upload your resume to get AI-powered job recommendations
//         </p>

//         <div className="grid grid-cols-3 gap-6">
//           {/* UPLOAD BOX */}
//           <div className="col-span-2 bg-white p-6 rounded-xl shadow">
//             <h2 className="font-semibold mb-2">Select Your Resume</h2>
//             <p className="text-sm text-gray-500 mb-4">

//               Choose a PDF or DOCX file. Max size 5MB.

//             </p>

//             <label className="border-2 border-dashed border-blue-300 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50">
//               <span className="text-4xl mb-2">⬆️</span>
//               <p className="font-medium">
//                 Drag & Drop your resume here
//               </p>
//               <p className="text-sm text-gray-500">
//                 or click to browse files
//               </p>
//               <input
//                 type="file"
//                 accept=".pdf,.doc,.docx"

//                 className="hidden"
//                 onChange={(e) => setSelectedFile(e.target.files[0])}
//               />
//             </label>

//             {selectedFile && (
//               <p className="text-sm text-gray-600 mt-2">
//                 Selected: {selectedFile.name}
//               </p>
//             )}


//             <button
//               onClick={handleUpload}
//               disabled={isUploading}
//               className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {isUploading ? "Uploading & Parsing..." : "Upload Resume"}
//             </button>

//             {uploadError && (
//               <p className="mt-3 text-sm text-red-600">
//                 {uploadError}
//               </p>
//             )}
//           </div>

//           {/* GUIDELINES */}
//           <div className="bg-white p-6 rounded-xl shadow">
//             <h3 className="font-semibold mb-3">📌 Upload Guidelines</h3>
//             <ul className="text-sm space-y-2">
//               <li className="text-green-600">✔ PDF or DOC format</li>
//               <li className="text-green-600">✔ File under 5MB</li>
//               <li className="text-green-600">
//                 ✔ Include skills & experience
//               </li>
//               <li className="text-red-500">
//                 ✖ Avoid images & complex formatting
//               </li>
//             </ul>
//           </div>
//         </div>


//         {/* AI PARSE RESULT */}
//         {/* {aiResult?.parsedData && (
//           <div className="bg-white p-6 rounded-xl shadow mt-8">
//             <h3 className="font-bold mb-4">AI Parsed Result</h3>

//             <div className="grid grid-cols-3 gap-6">
//               <div className="col-span-1">
//                 <p className="text-sm text-gray-500 mb-1">Parsed fields</p>
//                 <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
//                   {JSON.stringify(aiResult.parsedData, null, 2)}
//                 </pre>
//               </div>
//               <div className="col-span-2">
//                 <p className="text-sm text-gray-500 mb-1">Raw text (preview)</p>
//                 <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-80 overflow-auto">
//                   {aiResult.parsedData?.raw_text || "No text extracted"}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )} */}
//         {aiResult && (
//   <div className="bg-white p-6 rounded-xl shadow mt-8">
//     <h3 className="font-bold mb-4 text-lg">✅ AI Parsed Result</h3>

//     {aiResult.error ? (
//       <p className="text-red-500 text-sm">Parser error: {aiResult.error}</p>
//     ) : aiResult.parsedData ? (
//       <div className="grid grid-cols-2 gap-6">

//         {/* LEFT: Structured Fields */}
//         <div>
//           <p className="text-sm font-semibold text-gray-500 mb-2">Parsed Fields</p>

//           {aiResult.parsedData.name && (
//             <div className="mb-3">
//               <p className="text-xs text-gray-400 uppercase">Name</p>
//               <p className="text-sm font-medium">{aiResult.parsedData.name}</p>
//             </div>
//           )}

//           {aiResult.parsedData.email && (
//             <div className="mb-3">
//               <p className="text-xs text-gray-400 uppercase">Email</p>
//               <p className="text-sm">{aiResult.parsedData.email}</p>
//             </div>
//           )}

//           {aiResult.parsedData.phone && (
//             <div className="mb-3">
//               <p className="text-xs text-gray-400 uppercase">Phone</p>
//               <p className="text-sm">{aiResult.parsedData.phone}</p>
//             </div>
//           )}

//           {aiResult.parsedData.skills?.length > 0 && (
//             <div className="mb-3">
//               <p className="text-xs text-gray-400 uppercase mb-1">Skills</p>
//               <div className="flex flex-wrap gap-2">
//                 {aiResult.parsedData.skills.map((skill, i) => (
//                   <span
//                     key={i}
//                     className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           )}

//           {aiResult.parsedData.experience?.length > 0 && (
//             <div className="mb-3">
//               <p className="text-xs text-gray-400 uppercase mb-1">Experience</p>
//               {aiResult.parsedData.experience.map((exp, i) => (
//                 <div key={i} className="text-sm text-gray-700 mb-1 border-l-2 border-blue-300 pl-2">
//                   {typeof exp === "string" ? exp : `${exp.title || ""} at ${exp.company || ""}`}
//                 </div>
//               ))}
//             </div>
//           )}

//           {aiResult.parsedData.education?.length > 0 && (
//             <div className="mb-3">
//               <p className="text-xs text-gray-400 uppercase mb-1">Education</p>
//               {aiResult.parsedData.education.map((edu, i) => (
//                 <div key={i} className="text-sm text-gray-700 mb-1 border-l-2 border-green-300 pl-2">
//                   {typeof edu === "string" ? edu : `${edu.degree || ""} - ${edu.institution || ""}`}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* RIGHT: Raw Text Preview */}
//         <div>
//           <p className="text-sm font-semibold text-gray-500 mb-2">Raw Extracted Text</p>
//           <div className="text-sm bg-gray-50 p-3 rounded whitespace-pre-wrap max-h-96 overflow-auto border border-gray-200">
//             {aiResult.parsedData.raw_text || "No raw text available"}
//           </div>
//         </div>

//       </div>
//     ) : (
//       // Fallback: show raw JSON if structure is unexpected
//       <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">
//         {JSON.stringify(aiResult, null, 2)}
//       </pre>
//     )}
//   </div>
// )}

//         {/* RECENT UPLOADS */}
//         <div className="bg-white p-6 rounded-xl shadow mt-8">
//           <h3 className="font-bold mb-4">Recent Uploads</h3>


//           {(JSON.parse(localStorage.getItem("resumes")) || []).map(
//             (file, i) => (
//               <div
//                 key={i}
//                 className="flex justify-between items-center bg-gray-50 p-4 rounded mb-3"
//               >
//                 <div>
//                   <p className="font-medium">📄 {file.name}</p>
//                   <p className="text-sm text-gray-500">
//                     Uploaded on {file.date}
//                   </p>
//                 </div>
//                 <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-700">
//                   {file.status}
//                 </span>
//               </div>
//             )
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }
