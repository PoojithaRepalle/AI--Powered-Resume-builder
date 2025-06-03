from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
# Use these imports for PDF and DOCX processing
import PyPDF2
from docx import Document

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Google Generative AI API
GOOGLE_API_KEY = "AIzaSyDe1RjeTrHHSnkg662Y8F8mS0oVbVUWUU4"
genai.configure(api_key=GOOGLE_API_KEY)

def extract_text_from_pdf(file):
    """Extract text from PDF file"""
    reader = PyPDF2.PdfReader(file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

def extract_text_from_docx(file):
    """Extract text from DOCX file"""
    doc = Document(file)
    text = ""
    for para in doc.paragraphs:
        text += para.text + "\n"
    return text

def analyze_resume(resume_text, job_description):
    """Analyze resume against job description using Google Generative AI API"""
    prompt = f"""
    You are an expert ATS (Applicant Tracking System) analyzer.
    
    RESUME TEXT:
    {resume_text}
    
    JOB DESCRIPTION:
    {job_description}
    
    Analyze the resume against the job description and provide:
    1. An ATS compatibility score from 0-100
    2. A list of specific improvement suggestions
    3. A list of important keywords from the job description that are present in the resume
    
    Format your response as a JSON object with the following structure:
    {{
        "score": <number>,
        "feedback": [<string>, <string>, ...],
        "keywords": [<string>, <string>, ...]
    }}
    
    The response should be strictly in valid JSON format with no additional text.
    """
    
    # Initialize Gemini model
    model = genai.GenerativeModel('gemini-1.5-pro')
    
    # Generate response
    response = model.generate_content(prompt)
    
    # Extract and parse JSON from response
    try:
        # Attempt to parse the response text directly
        result = json.loads(response.text)
    except json.JSONDecodeError:
        # If direct parsing fails, try to extract JSON from the text
        response_text = response.text
        
        # Look for the first { and last } to extract the JSON part
        start_index = response_text.find('{')
        end_index = response_text.rfind('}') + 1
        
        if start_index >= 0 and end_index > start_index:
            json_str = response_text[start_index:end_index]
            try:
                result = json.loads(json_str)
            except:
                # Fallback response if JSON parsing fails
                result = {
                    "score": 50,
                    "feedback": ["Error parsing AI response. Please try again."],
                    "keywords": []
                }
        else:
            # Fallback response if JSON not found
            result = {
                "score": 50,
                "feedback": ["Error parsing AI response. Please try again."],
                "keywords": []
            }
    
    return result

@app.route('/analyze', methods=['POST'])
def analyze():
    """Endpoint to analyze resume"""
    if 'resume' not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    
    file = request.files['resume']
    job_description = request.form.get('job_description', '')
    
    if not job_description:
        return jsonify({"error": "No job description provided"}), 400
    
    # Process based on file type
    filename = file.filename.lower()
    try:
        if filename.endswith('.pdf'):
            resume_text = extract_text_from_pdf(file)
        elif filename.endswith('.docx'):
            resume_text = extract_text_from_docx(file)
        elif filename.endswith('.doc'):
            return jsonify({"error": "DOC format not supported, please convert to DOCX or PDF"}), 400
        else:
            return jsonify({"error": "Unsupported file format"}), 400
        
        # Analyze resume
        result = analyze_resume(resume_text, job_description)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route to analyze resume data in JSON format
@app.route('/analyze-json', methods=['POST'])
def analyze_json():
    """Endpoint to analyze resume data provided as JSON"""
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    resume_data = data.get('resume')
    job_description = data.get('job_description', '')
    
    if not resume_data:
        return jsonify({"error": "No resume data provided"}), 400
    if not job_description:
        return jsonify({"error": "No job description provided"}), 400
    
    # Convert resume data to text format
    resume_text = ""
    resume_text += f"Name: {resume_data.get('name', '')}\n"
    resume_text += f"Email: {resume_data.get('email', '')}\n"
    resume_text += f"Phone: {resume_data.get('mobile', '')}\n"
    resume_text += f"Location: {resume_data.get('location', '')}\n"
    resume_text += f"LinkedIn: {resume_data.get('linkedin', '')}\n"
    resume_text += f"GitHub: {resume_data.get('github', '')}\n"
    resume_text += f"Portfolio: {resume_data.get('portfolio', '')}\n\n"
    
    # Summary
    resume_text += f"Summary:\n{resume_data.get('summary', '')}\n\n"
    
    # Skills
    skills = resume_data.get('skills', {})
    tech_skills = ", ".join(skills.get('technical', []))
    soft_skills = ", ".join(skills.get('softSkills', []))
    resume_text += f"Technical Skills: {tech_skills}\n"
    resume_text += f"Soft Skills: {soft_skills}\n\n"
    
    # Education
    resume_text += "Education:\n"
    for edu in resume_data.get('education', []):
        resume_text += f"- {edu.get('degreeName')} at {edu.get('institution')}, {edu.get('location')}\n"
        resume_text += f"  {edu.get('startYear')} - {edu.get('endYear')}, CGPA: {edu.get('cgpa')}\n"
    resume_text += "\n"
    
    # Work Experience
    resume_text += "Work Experience:\n"
    for job in resume_data.get('workExperience', []):
        resume_text += f"- {job.get('jobTitle')} at {job.get('companyName')}\n"
        resume_text += f"  {job.get('startDate')} - {job.get('endDate')}\n"
        resume_text += f"  Responsibilities: {job.get('responsibilities')}\n"
    resume_text += "\n"
    
    # Projects
    resume_text += "Projects:\n"
    for project in resume_data.get('projects', []):
        resume_text += f"- {project.get('title')}\n"
        resume_text += f"  Description: {project.get('description')}\n"
        resume_text += f"  Tech Stack: {', '.join(project.get('techStack', []))}\n"
        if project.get('demoLink'):
            resume_text += f"  Demo: {project.get('demoLink')}\n"
    resume_text += "\n"
    
    # Certifications
    certifications = resume_data.get('certifications', [])
    if certifications and certifications[0].get('name'):
        resume_text += "Certifications:\n"
        for cert in certifications:
            resume_text += f"- {cert.get('name')}"
            if cert.get('link'):
                resume_text += f" ({cert.get('link')})"
            resume_text += "\n"
        resume_text += "\n"
    
    # Achievements
    achievements = resume_data.get('achievements', [])
    if achievements and achievements[0].get('title'):
        resume_text += "Achievements:\n"
        for ach in achievements:
            resume_text += f"- {ach.get('title')}: {ach.get('description')}\n"
        resume_text += "\n"
    
    # Positions of Responsibility
    positions = resume_data.get('positionOfResponsibility', [])
    if positions and positions[0].get('position'):
        resume_text += "Positions of Responsibility:\n"
        for pos in positions:
            resume_text += f"- {pos.get('position')} at {pos.get('organization')}, {pos.get('duration')}\n"
            resume_text += f"  {pos.get('contributions')}\n"
        resume_text += "\n"
    
    # Publications
    publications = resume_data.get('publications', [])
    if publications and publications[0].get('title'):
        resume_text += "Publications:\n"
        for pub in publications:
            resume_text += f"- {pub.get('title')}, {pub.get('conference')}, {pub.get('date')}\n"
            resume_text += f"  Authors: {pub.get('authors')}\n"
            if pub.get('link'):
                resume_text += f"  Link: {pub.get('link')}\n"
    
    # Analyze resume
    try:
        result = analyze_resume(resume_text, job_description)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)