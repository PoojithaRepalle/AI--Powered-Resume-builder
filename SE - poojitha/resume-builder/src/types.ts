export interface ResumeData {
    name: string;
    email: string;
    mobile: string;
    portfolio: string;
    linkedin: string;
    github: string;
    location: string;
    summary: string;
    skills: {
      technical: string[];
      softSkills: string[];
    };
    education: {
      institution: string;
      degreeName: string;
      location: string;
      startYear: string;
      endYear: string;
      cgpa: string;
    }[];
    workExperience: {
      companyName: string;
      jobTitle: string;
      startDate: string;
      endDate: string;
      responsibilities: string;
    }[];
    projects: {
      title: string;
      description: string;
      techStack: string[];
      demoLink: string;
    }[];
    certifications: {
      name: string;
      link: string;
    }[];
    achievements: {
      title: string;
      description: string;
    }[];
    positionOfResponsibility: {
      position: string;
      organization: string;
      duration: string;
      contributions: string;
    }[];
    publications: {
      title: string;
      conference: string;
      date: string;
      authors: string;
      link: string;
    }[];
  }