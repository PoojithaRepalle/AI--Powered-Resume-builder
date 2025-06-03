import React, { useState, useEffect } from "react";
import { PDFDownloadLink } from '@react-pdf/renderer';
import Resume from "./Resume"; // Import your Resume component
import { ResumeData } from "../types";
import axios from 'axios'; // Make sure to install axios: npm install axios

// Define initial empty state structure for the form
const initialFormState: ResumeData = {
  name: "",
  email: "",
  mobile: "",
  portfolio: "",
  linkedin: "",
  github: "",
  location: "",
  summary: "",
  skills: {
    technical: [],
    softSkills: []
  },
  education: [{ 
    institution: "", 
    degreeName: "", 
    location: "", 
    startYear: "", 
    endYear: "", 
    cgpa: "" 
  }],
  workExperience: [{ 
    companyName: "", 
    jobTitle: "", 
    startDate: "", 
    endDate: "", 
    responsibilities: "" 
  }],
  projects: [{ 
    title: "", 
    description: "", 
    techStack: [], 
    demoLink: "" 
  }],
  certifications: [{ 
    name: "", 
    link: "" 
  }],
  achievements: [{ 
    title: "", 
    description: "" 
  }],
  positionOfResponsibility: [{ 
    position: "", 
    organization: "", 
    duration: "", 
    contributions: "" 
  }],
  publications: [{ 
    title: "", 
    conference: "", 
    date: "", 
    authors: "", 
    link: "" 
  }]
};

type Props = {
  onSubmit?: (data: ResumeData) => void;
};

interface AtsResult {
  score: number;
  feedback: string[];
  keywords: string[];
}

const ResumeForm: React.FC<Props> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<ResumeData>(initialFormState);
  const [activeTab, setActiveTab] = useState("personal");
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [atsScore, setAtsScore] = useState<number | null>(null);
  const [atsFeedback, setAtsFeedback] = useState<string[]>([]);
  const [atsKeywords, setAtsKeywords] = useState<string[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [fileUpload, setFileUpload] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Error parsing saved resume data:", error);
      }
    }
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('resumeFormData', JSON.stringify(formData));
  }, [formData]);

  // Handle text inputs for simple string fields
  const handleInputChange = (section: keyof ResumeData, value: string) => {
    setFormData({ ...formData, [section]: value });
  };

  // Handle array fields (education, work, etc.)
  const handleArrayItemChange = <T extends object>(
    section: keyof ResumeData,
    index: number,
    field: keyof T,
    value: any
  ) => {
    const newArray = [...(formData[section] as T[])];
    newArray[index] = { ...newArray[index], [field]: value };
    setFormData({ ...formData, [section]: newArray });
  };

  // Add new items to array fields
  const handleAddItem = (section: keyof ResumeData) => {
    const sectionArray = [...(formData[section] as any[])];
    let newItem;

    switch (section) {
      case 'education':
        newItem = { institution: "", degreeName: "", location: "", startYear: "", endYear: "", cgpa: "" };
        break;
      case 'workExperience':
        newItem = { companyName: "", jobTitle: "", startDate: "", endDate: "", responsibilities: "" };
        break;
      case 'projects':
        newItem = { title: "", description: "", techStack: [], demoLink: "" };
        break;
      case 'certifications':
        newItem = { name: "", link: "" };
        break;
      case 'achievements':
        newItem = { title: "", description: "" };
        break;
      case 'positionOfResponsibility':
        newItem = { position: "", organization: "", duration: "", contributions: "" };
        break;
      case 'publications':
        newItem = { title: "", conference: "", date: "", authors: "", link: "" };
        break;
      default:
        newItem = {};
    }

    setFormData({ ...formData, [section]: [...sectionArray, newItem] });
  };

  // Remove items from array fields
  const handleRemoveItem = (section: keyof ResumeData, index: number) => {
    const sectionArray = [...(formData[section] as any[])];
    sectionArray.splice(index, 1);
    setFormData({ ...formData, [section]: sectionArray });
  };

  // Handle special case for skills which is an object with arrays
  const handleSkillsChange = (skillType: 'technical' | 'softSkills', value: string) => {
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        [skillType]: value.split(',').map(skill => skill.trim())
      }
    });
  };

  // Handle tech stack for projects (comma-separated string to array)
  const handleTechStackChange = (index: number, value: string) => {
    const projects = [...formData.projects];
    projects[index] = { 
      ...projects[index], 
      techStack: value.split(',').map(tech => tech.trim()) 
    };
    setFormData({ ...formData, projects });
  };

  // Analyze resume with the backend ATS API
  const analyzeResume = async () => {
    if (!jobDescription) {
      setError("Please provide a job description for ATS analysis");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      // If a file is uploaded, use the file upload endpoint
      if (fileUpload) {
        const formData = new FormData();
        formData.append('resume', fileUpload);
        formData.append('job_description', jobDescription);
        
        response = await axios.post('http://localhost:5000/analyze', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Otherwise use the JSON endpoint with form data
        response = await axios.post('http://localhost:5000/analyze-json', {
          resume: formData,
          job_description: jobDescription
        });
      }

      const result: AtsResult = response.data;
      
      setAtsScore(result.score);
      setAtsFeedback(result.feedback || []);
      setAtsKeywords(result.keywords || []);
      
      // Store results in localStorage
      localStorage.setItem('resumeAtsScore', String(result.score));
      localStorage.setItem('resumeAtsFeedback', JSON.stringify(result.feedback || []));
      localStorage.setItem('resumeAtsKeywords', JSON.stringify(result.keywords || []));
      
    } catch (error) {
      console.error("Error analyzing resume:", error);
      setError("Failed to analyze resume. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save form data
    localStorage.setItem('resumeFormData', JSON.stringify(formData));
    
    // If on ATS tab, don't set form as complete
    if (activeTab === "ats") {
      analyzeResume();
      return;
    }
    
    // For other tabs, mark as complete to show PDF download
    setIsFormComplete(true);
    
    // Call onSubmit prop if provided
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  // Generate a filename for the PDF
  const generatePdfFilename = () => {
    const name = formData.name.replace(/\s+/g, '_') || 'resume';
    return `${name}_Resume.pdf`;
  };

  return (
    <div className="bg-white shadow-md rounded p-6 mb-8">
      <div className="mb-6">
        <div className="flex border-b overflow-x-auto">
          <button
            className={`py-2 px-4 ${activeTab === "personal" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("personal")}
            type="button"
          >
            Personal
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "education" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("education")}
            type="button"
          >
            Education
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "experience" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("experience")}
            type="button"
          >
            Experience
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "projects" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("projects")}
            type="button"
          >
            Projects
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "skills" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("skills")}
            type="button"
          >
            Skills
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "other" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("other")}
            type="button"
          >
            Other
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "ats" ? "border-b-2 border-blue-500 font-bold" : ""}`}
            onClick={() => setActiveTab("ats")}
            type="button"
          >
            ATS Check
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        {activeTab === "personal" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Mobile</label>
                <input
                  type="tel"
                  className="w-full p-2 border rounded"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange("mobile", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Location</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">LinkedIn</label>
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  value={formData.linkedin}
                  onChange={(e) => handleInputChange("linkedin", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">GitHub</label>
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  value={formData.github}
                  onChange={(e) => handleInputChange("github", e.target.value)}
                />
              </div>
              
              <div>
                <label className="block font-medium mb-1">Portfolio Website</label>
                <input
                  type="url"
                  className="w-full p-2 border rounded"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange("portfolio", e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Professional Summary</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={4}
                value={formData.summary}
                onChange={(e) => handleInputChange("summary", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Education */}
        {activeTab === "education" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Education</h2>
              <button
                type="button"
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleAddItem("education")}
              >
                Add Education
              </button>
            </div>

            {formData.education.map((edu, index) => (
              <div key={index} className="p-4 border rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Institution</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={edu.institution}
                      onChange={(e) => handleArrayItemChange<typeof edu>("education", index, "institution", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">Degree</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={edu.degreeName}
                      onChange={(e) => handleArrayItemChange<typeof edu>("education", index, "degreeName", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">Location</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={edu.location}
                      onChange={(e) => handleArrayItemChange<typeof edu>("education", index, "location", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">CGPA</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={edu.cgpa}
                      onChange={(e) => handleArrayItemChange<typeof edu>("education", index, "cgpa", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">Start Year</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={edu.startYear}
                      onChange={(e) => handleArrayItemChange<typeof edu>("education", index, "startYear", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">End Year</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={edu.endYear}
                      onChange={(e) => handleArrayItemChange<typeof edu>("education", index, "endYear", e.target.value)}
                    />
                  </div>
                </div>
                
                {formData.education.length > 1 && (
                  <button
                    type="button"
                    className="mt-4 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveItem("education", index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {activeTab === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Work Experience</h2>
              <button
                type="button"
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleAddItem("workExperience")}
              >
                Add Experience
              </button>
            </div>

            {formData.workExperience.map((job, index) => (
              <div key={index} className="p-4 border rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Company Name</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={job.companyName}
                      onChange={(e) => handleArrayItemChange<typeof job>("workExperience", index, "companyName", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">Job Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={job.jobTitle}
                      onChange={(e) => handleArrayItemChange<typeof job>("workExperience", index, "jobTitle", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">Start Date</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="MM/YYYY"
                      value={job.startDate}
                      onChange={(e) => handleArrayItemChange<typeof job>("workExperience", index, "startDate", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">End Date</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      placeholder="MM/YYYY or Present"
                      value={job.endDate}
                      onChange={(e) => handleArrayItemChange<typeof job>("workExperience", index, "endDate", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block font-medium mb-1">Responsibilities & Achievements</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={4}
                    value={job.responsibilities}
                    onChange={(e) => handleArrayItemChange<typeof job>("workExperience", index, "responsibilities", e.target.value)}
                    placeholder="Use bullet points or new lines for better readability"
                  />
                </div>
                
                {formData.workExperience.length > 1 && (
                  <button
                    type="button"
                    className="mt-4 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveItem("workExperience", index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Projects</h2>
              <button
                type="button"
                className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleAddItem("projects")}
              >
                Add Project
              </button>
            </div>

            {formData.projects.map((project, index) => (
              <div key={index} className="p-4 border rounded mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-1">Project Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={project.title}
                      onChange={(e) => handleArrayItemChange<typeof project>("projects", index, "title", e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block font-medium mb-1">Demo Link</label>
                    <input
                      type="url"
                      className="w-full p-2 border rounded"
                      value={project.demoLink}
                      onChange={(e) => handleArrayItemChange<typeof project>("projects", index, "demoLink", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block font-medium mb-1">Description</label>
                  <textarea
                    className="w-full p-2 border rounded"
                    rows={3}
                    value={project.description}
                    onChange={(e) => handleArrayItemChange<typeof project>("projects", index, "description", e.target.value)}
                  />
                </div>
                
                <div className="mt-4">
                  <label className="block font-medium mb-1">Tech Stack (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    value={project.techStack.join(", ")}
                    onChange={(e) => handleTechStackChange(index, e.target.value)}
                    placeholder="React, Node.js, MongoDB, etc."
                  />
                </div>
                
                {formData.projects.length > 1 && (
                  <button
                    type="button"
                    className="mt-4 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveItem("projects", index)}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {activeTab === "skills" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">Skills</h2>
            
            <div>
              <label className="block font-medium mb-1">Technical Skills (comma-separated)</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={formData.skills.technical.join(", ")}
                onChange={(e) => handleSkillsChange("technical", e.target.value)}
                placeholder="JavaScript, React, Python, etc."
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">Soft Skills (comma-separated)</label>
              <textarea
                className="w-full p-2 border rounded"
                rows={3}
                value={formData.skills.softSkills.join(", ")}
                onChange={(e) => handleSkillsChange("softSkills", e.target.value)}
                placeholder="Communication, Leadership, Problem-solving, etc."
              />
            </div>
          </div>
        )}

        {/* Other Sections */}
        {activeTab === "other" && (
          <div className="space-y-6">
            {/* Certifications */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Certifications</h2>
                <button
                  type="button"
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleAddItem("certifications")}
                >
                  Add Certification
                </button>
              </div>

              {formData.certifications.map((cert, index) => (
                <div key={index} className="p-4 border rounded mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Certification Name</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={cert.name}
                        onChange={(e) => handleArrayItemChange<typeof cert>("certifications", index, "name", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Link (optional)</label>
                      <input
                        type="url"
                        className="w-full p-2 border rounded"
                        value={cert.link}
                        onChange={(e) => handleArrayItemChange<typeof cert>("certifications", index, "link", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {formData.certifications.length > 1 && (
                    <button
                      type="button"
                      className="mt-4 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem("certifications", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Achievements</h2>
                <button
                  type="button"
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleAddItem("achievements")}
                >
                  Add Achievement
                </button>
              </div>

              {formData.achievements.map((achievement, index) => (
                <div key={index} className="p-4 border rounded mb-4">
                  <div>
                    <label className="block font-medium mb-1">Title</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={achievement.title}
                      onChange={(e) => handleArrayItemChange<typeof achievement>("achievements", index, "title", e.target.value)}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <label className="block font-medium mb-1">Description</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={2}
                      value={achievement.description}
                      onChange={(e) => handleArrayItemChange<typeof achievement>("achievements", index, "description", e.target.value)}
                    />
                  </div>
                  
                  {formData.achievements.length > 1 && (
                    <button
                      type="button"
                      className="mt-4 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem("achievements", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Positions of Responsibility */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Positions of Responsibility</h2>
                <button
                  type="button"
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleAddItem("positionOfResponsibility")}
                >
                  Add Position
                </button>
              </div>

              {formData.positionOfResponsibility.map((position, index) => (
                <div key={index} className="p-4 border rounded mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Position</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={position.position}
                        onChange={(e) => handleArrayItemChange<typeof position>("positionOfResponsibility", index, "position", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Organization</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={position.organization}
                        onChange={(e) => handleArrayItemChange<typeof position>("positionOfResponsibility", index, "organization", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Duration</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={position.duration}
                        onChange={(e) => handleArrayItemChange<typeof position>("positionOfResponsibility", index, "duration", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block font-medium mb-1">Contributions</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      rows={2}
                      value={position.contributions}
                      onChange={(e) => handleArrayItemChange<typeof position>("positionOfResponsibility", index, "contributions", e.target.value)}
                    />
                  </div>
                  
                  {formData.positionOfResponsibility.length > 1 && (
                    <button
                      type="button"
                      className="mt-4 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem("positionOfResponsibility", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Publications */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Publications</h2>
                <button
                  type="button"
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleAddItem("publications")}
                >
                  Add Publication
                </button>
              </div>

              {formData.publications.map((publication, index) => (
                <div key={index} className="p-4 border rounded mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-1">Title</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={publication.title}
                        onChange={(e) => handleArrayItemChange<typeof publication>("publications", index, "title", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Conference/Journal</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={publication.conference}
                        onChange={(e) => handleArrayItemChange<typeof publication>("publications", index, "conference", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Date</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={publication.date}
                        onChange={(e) => handleArrayItemChange<typeof publication>("publications", index, "date", e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block font-medium mb-1">Authors</label>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={publication.authors}
                        onChange={(e) => handleArrayItemChange<typeof publication>("publications", index, "authors", e.target.value)}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block font-medium mb-1">Link</label>
                      <input
                        type="url"
                        className="w-full p-2 border rounded"
                        value={publication.link}
                        onChange={(e) => handleArrayItemChange<typeof publication>("publications", index, "link", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {formData.publications.length > 1 && (
                    <button
                      type="button"
                      className="mt-4 text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem("publications", index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ATS Analysis Tab */}
        {activeTab === "ats" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">ATS Compatibility Check</h2>
            <p className="mb-4">
              Check how well your resume matches a job description. This will help optimize your resume for Applicant Tracking Systems.
            </p>
            
            <div className="border rounded-lg p-5 bg-gray-50">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Job Description</h3>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={6}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here to check ATS compatibility"
                />
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Choose an option:</h3>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 border rounded-lg p-4 bg-white hover:border-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      id="useFormData"
                      name="atsMethod"
                      value="formData"
                      defaultChecked
                      onChange={() => setFileUpload(null)}
                      className="mr-2"
                    />
                    <label htmlFor="useFormData" className="font-medium cursor-pointer">
                      Use current resume data
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Analyze the resume you've built in this form against the job description.
                    </p>
                  </div>
                  
                  <div className="flex-1 border rounded-lg p-4 bg-white hover:border-blue-500 cursor-pointer">
                    <input
                      type="radio"
                      id="uploadResume"
                      name="atsMethod"
                      value="uploadFile"
                      onChange={() => {}}
                      className="mr-2"
                    />
                    <label htmlFor="uploadResume" className="font-medium cursor-pointer">
                      Upload existing resume
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Upload a PDF or DOCX file of your existing resume for analysis.
                    </p>
                    <div className="mt-3">
                      <input
                        type="file"
                        accept=".pdf,.docx"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            setFileUpload(e.target.files[0]);
                            // Select the radio button when file is chosen
                            const radio = document.getElementById('uploadResume') as HTMLInputElement;
                            if (radio) radio.checked = true;
                          }
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={analyzeResume}
                  disabled={isLoading || !jobDescription}
                  className={`px-6 py-2 ${!jobDescription ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
                    text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
                    ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Analyzing...' : 'Check ATS Compatibility'}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            {/* Show ATS results here if available */}
            {atsScore !== null && !isFormComplete && (
              <div className={`mt-6 p-4 rounded-lg ${atsScore >= 90 ? 'bg-green-100' : atsScore >= 80 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                <h3 className="font-bold text-lg mb-2">ATS Compatibility Score</h3>
                <div className="flex items-center mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className={`h-4 rounded-full ${atsScore >= 90 ? 'bg-green-500' : atsScore >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`} 
                      style={{ width: `${atsScore}%` }}
                    ></div>
                  </div>
                  <span className="ml-4 font-bold text-xl">{atsScore}%</span>
                </div>
                
                <p className="font-medium">
                  {atsScore >= 90 
                    ? 'Excellent! Your resume is highly ATS-compatible.' 
                    : atsScore >= 80 
                    ? 'Good job! Your resume has good ATS compatibility.' 
                    : 'Your resume needs some improvements for better ATS compatibility.'}
                </p>
                
                {/* Display feedback */}
                {atsFeedback.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Recommendations for improvement:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {atsFeedback.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Display matching keywords */}
                {atsKeywords.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Matching Keywords:</h4>
                    <div className="flex flex-wrap gap-2">
                      {atsKeywords.map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-4 border-t">
          {!isFormComplete ? (
            <div className="flex justify-end">
              {activeTab === "ats" ? (
                <button
                  type="button" // Change to button for ATS tab
                  onClick={analyzeResume}
                  disabled={isLoading || !jobDescription}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isLoading || !jobDescription ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Analyzing...' : 'Check ATS Compatibility'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Processing...' : 'Generate Resume'}
                </button>
              )}
            </div>
          ) : (
            <div>
              {atsScore !== null && (
                <div className={`mb-6 p-4 rounded-lg ${atsScore >= 90 ? 'bg-green-100' : atsScore >= 80 ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                  <h3 className="font-bold text-lg mb-2">ATS Compatibility Score</h3>
                  <div className="flex items-center mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full ${atsScore >= 90 ? 'bg-green-500' : atsScore >= 80 ? 'bg-blue-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${atsScore}%` }}
                      ></div>
                    </div>
                    <span className="ml-4 font-bold text-xl">{atsScore}%</span>
                  </div>
                  
                  <p className="font-medium">
                    {atsScore >= 90 
                      ? 'Excellent! Your resume is highly ATS-compatible.' 
                      : atsScore >= 80 
                      ? 'Good job! Your resume has good ATS compatibility.' 
                      : 'Your resume needs some improvements for better ATS compatibility.'}
                  </p>
                  
                  {/* Display feedback */}
                  {atsFeedback.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recommendations for improvement:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {atsFeedback.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Display matching keywords */}
                  {atsKeywords.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Matching Keywords:</h4>
                      <div className="flex flex-wrap gap-2">
                        {atsKeywords.map((keyword, i) => (
                          <span key={i} className="px-2 py-1 bg-green-200 text-green-800 text-sm rounded">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsFormComplete(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Edit Resume
                </button>
                
                <PDFDownloadLink 
                  document={<Resume data={formData} />} 
                  fileName={generatePdfFilename()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block"
                >
                  {({ loading }) => loading ? 'Preparing PDF...' : 'Download Resume PDF'}
                </PDFDownloadLink>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResumeForm;