import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { ResumeData } from '../types';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
  },
  section: {
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: '1 solid #EEEEEE',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
  },
  subheader: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  text: {
    fontSize: 11,
    marginBottom: 3,
  },
  bold: {
    fontWeight: 'bold',
  },
  link: {
    color: '#0000EE',
    textDecoration: 'underline',
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  contactItem: {
    marginHorizontal: 5,
  },
  nameHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333333',
    borderBottom: '1 solid #CCCCCC',
    paddingBottom: 2,
  },
  entryContainer: {
    marginBottom: 8,
  },
  bulletPoint: {
    marginLeft: 10,
    marginBottom: 2,
  },
});

const Resume = ({ data }: { data: ResumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Name and Contact */}
      <View style={styles.section}>
        <Text style={styles.nameHeader}>{data.name}</Text>
        
        <View style={styles.contactRow}>
          {data.email && <Text style={styles.contactItem}>{data.email}</Text>}
          {data.mobile && <Text style={styles.contactItem}>{data.mobile}</Text>}
          {data.location && <Text style={styles.contactItem}>{data.location}</Text>}
        </View>
        
        <View style={styles.contactRow}>
          {data.linkedin && <Text style={styles.contactItem}>{data.linkedin}</Text>}
          {data.github && <Text style={styles.contactItem}>{data.github}</Text>}
          {data.portfolio && <Text style={styles.contactItem}>{data.portfolio}</Text>}
        </View>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text>{data.summary}</Text>
        </View>
      )}

      {/* Skills */}
      {(data.skills.technical.length > 0 || data.skills.softSkills.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          
          {data.skills.technical.length > 0 && (
            <View style={styles.entryContainer}>
              <Text>
                <Text style={styles.bold}>Technical: </Text>
                {data.skills.technical.join(", ")}
              </Text>
            </View>
          )}
          
          {data.skills.softSkills.length > 0 && (
            <View style={styles.entryContainer}>
              <Text>
                <Text style={styles.bold}>Soft Skills: </Text>
                {data.skills.softSkills.join(", ")}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Education */}
      {data.education.length > 0 && data.education[0].institution && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          
          {data.education.map((edu, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text style={styles.bold}>{edu.degreeName}</Text>
              <Text>
                {edu.institution}{edu.location ? `, ${edu.location}` : ""} | {edu.startYear} - {edu.endYear || "Present"}
              </Text>
              {edu.cgpa && <Text>CGPA: {edu.cgpa}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Work Experience */}
      {data.workExperience.length > 0 && data.workExperience[0].companyName && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work Experience</Text>
          
          {data.workExperience.map((job, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text style={styles.bold}>{job.jobTitle}</Text>
              <Text>
                {job.companyName} | {job.startDate} - {job.endDate || "Present"}
              </Text>
              
              {job.responsibilities.split('\n').map((point, j) => (
                <Text key={j} style={styles.bulletPoint}>• {point}</Text>
              ))}
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {data.projects.length > 0 && data.projects[0].title && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projects</Text>
          
          {data.projects.map((project, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text style={styles.bold}>{project.title}</Text>
              <Text>{project.description}</Text>
              
              {project.techStack.length > 0 && (
                <Text>
                  <Text style={styles.bold}>Tech Stack: </Text>
                  {project.techStack.join(", ")}
                </Text>
              )}
              
              {project.demoLink && (
                <Text style={styles.link}>{project.demoLink}</Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && data.certifications[0].name && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Certifications</Text>
          
          {data.certifications.map((cert, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text>
                {cert.name}
                {cert.link && ` - ${cert.link}`}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      {data.achievements.length > 0 && data.achievements[0].title && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          {data.achievements.map((achievement, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text style={styles.bold}>{achievement.title}</Text>
              <Text>{achievement.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Positions of Responsibility */}
      {data.positionOfResponsibility.length > 0 && data.positionOfResponsibility[0].position && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Positions of Responsibility</Text>
          
          {data.positionOfResponsibility.map((position, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text style={styles.bold}>
                {position.position} at {position.organization}
              </Text>
              <Text>{position.duration}</Text>
              <Text>{position.contributions}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Publications */}
      {data.publications.length > 0 && data.publications[0].title && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Publications</Text>
          
          {data.publications.map((publication, i) => (
            <View key={i} style={styles.entryContainer}>
              <Text style={styles.bold}>{publication.title}</Text>
              <Text>
                {publication.conference}{publication.date ? ` - ${publication.date}` : ""}
              </Text>
              <Text>{publication.authors}</Text>
              {publication.link && <Text style={styles.link}>{publication.link}</Text>}
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default Resume;