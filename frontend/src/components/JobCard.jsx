import React, { useState } from "react";

function formatSeniority(raw) {
    const map = {
        entry: "Fresher",
        entry_level: "Fresher",
        junior: "Fresher",
        mid: "Mid Level",
        mid_level: "Mid Level",
        senior: "Senior",
        lead: "Senior",
        c_level: "Senior",
        principal: "Senior",
    };
    return map[raw?.toLowerCase()] || null;
}

function JobCard({ job, onToggleSave = () => { }, onMarkApplied = () => { }, onUnmarkApplied = () => { } }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const seniorityLabel = formatSeniority(job.seniority);
    const jobTitle = job.title || job.job_title || "Untitled Position";
    const location = job.location || job.city || "Remote";
    const explanation = job.explanation || {
        reason: job.reason,
        highlights: [],
        breakdown: {},
    };

    const breakdown = explanation.breakdown || {};
    const scoreValues = {
        skill_match: Number(breakdown.skill_match ?? breakdown.skillMatch ?? 0),
        profile_fit: Number(breakdown.profile_fit ?? breakdown.profileFit ?? 0),
        level_fit: Number(breakdown.level_fit ?? breakdown.levelFit ?? 0),
    };

    return (
        <div className={`relative bg-white border rounded-xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow ${job.isApplied ? "border-l-4 border-l-green-400" : "border-gray-100"}`}>
            {job.isApplied && (
                <div className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    ✓ Applied
                </div>
            )}

            <p className="text-base font-bold text-gray-900">{job.company}</p>
            <p className="text-sm font-medium text-gray-700">{jobTitle}</p>
            <p className="text-xs text-gray-500">📍 {location}</p>

            <div className="flex flex-wrap gap-1.5 items-center">
                {seniorityLabel && (
                    <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">
                        {seniorityLabel}
                    </span>
                )}

                {job.isRemote && (
                    <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                        🌐 Remote
                    </span>
                )}
                {job.isHybrid && (
                    <span className="bg-purple-50 text-purple-600 text-xs px-2 py-0.5 rounded-full">
                        🏢 Hybrid
                    </span>
                )}

                {job.salary && (
                    <span className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                        💰 {job.salary}
                    </span>
                )}
            </div>

            {job.matchedSkills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-xs text-gray-400">Matched skills:</span>
                    {job.matchedSkills.slice(0, 4).map((sk, i) => (
                        <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                            {sk}
                        </span>
                    ))}
                    {job.matchedSkills.length > 4 && (
                        <span className="text-xs text-gray-400">+{job.matchedSkills.length - 4} more</span>
                    )}
                </div>
            )}

            {explanation.reason && (
                <p className="text-xs text-gray-400 italic mt-1">
                    ✦ {explanation.reason}
                </p>
            )}

            {explanation.highlights?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {explanation.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="bg-slate-100 text-slate-700 text-[10px] px-2 py-1 rounded-full">
                            {highlight}
                        </span>
                    ))}
                </div>
            )}

            <button
                onClick={() => setIsExpanded((prev) => !prev)}
                className="text-left text-xs text-blue-600 hover:text-blue-800 mt-2"
            >
                {isExpanded ? "Hide why this job" : "Why this job?"}
            </button>

            {isExpanded && (
                <div className="space-y-2 pt-2">
                    {[
                        { label: "Skill Match", value: scoreValues.skill_match },
                        { label: "Profile Fit", value: scoreValues.profile_fit },
                        { label: "Level Fit", value: scoreValues.level_fit },
                    ].map((item) => {
                        const clampedValue = Math.max(0, Math.min(100, item.value || 0));
                        return (
                            <div key={item.label} className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] uppercase text-gray-500">
                                    <span>{item.label}</span>
                                    <span>{clampedValue}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                                    <div className="h-full bg-blue-500" style={{ width: `${clampedValue}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="flex gap-2 pt-1">
                {job.url ? (
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onMarkApplied(job.userJobId)}
                        className="flex-1 text-center bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Apply →
                    </a>
                ) : (
                    <button
                        disabled
                        className="flex-1 text-center bg-gray-100 text-gray-400 text-xs px-3 py-1.5 rounded-lg cursor-not-allowed"
                    >
                        No link
                    </button>
                )}

                <button
                    onClick={() => onToggleSave(job.userJobId)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${job.isSaved
                        ? "bg-yellow-50 border-yellow-300 text-yellow-600"
                        : "border-gray-200 text-gray-400 hover:border-yellow-300 hover:text-yellow-500"
                        }`}
                    title={job.isSaved ? "Unsave" : "Save"}
                >
                    {job.isSaved ? "⭐" : "☆"}
                </button>
            </div>

            {/* Applied/Not Applied Buttons */}
            <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
                <button
                    onClick={() => onMarkApplied(job.userJobId)}
                    className={`flex-1 text-center text-xs px-3 py-2 rounded-lg transition-colors ${job.isApplied
                            ? "bg-green-100 border border-green-300 text-green-700 cursor-not-allowed"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-400"
                        }`}
                    disabled={job.isApplied}
                >
                    ✓ Applied
                </button>
                <button
                    onClick={() => onUnmarkApplied(job.userJobId)}
                    className={`flex-1 text-center text-xs px-3 py-2 rounded-lg transition-colors ${!job.isApplied
                            ? "bg-gray-100 border border-gray-300 text-gray-400 cursor-not-allowed"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-red-50 hover:border-red-400"
                        }`}
                    disabled={!job.isApplied}
                >
                    ✗ Not Applied
                </button>
            </div>
        </div>
    );
}

export default JobCard;
