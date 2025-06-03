export type TemplateField = {
  label: string;
  key: string;
  type: "text" | "email" | "url" | "textarea";
};

export type TemplateConfig = {
  name: string;
  fields: TemplateField[];
};

const commonFields: TemplateField[] = [
  { label: "Full Name", key: "fullName", type: "text" },
  { label: "Title", key: "title", type: "text" },
  { label: "LinkedIn", key: "linkedin", type: "url" },
  { label: "Email", key: "email", type: "email" },
  { label: "Phone Number", key: "phone", type: "text" },
  { label: "Skills", key: "skills", type: "textarea" },
  { label: "Education", key: "education", type: "textarea" },
  { label: "Experience", key: "experience", type: "textarea" },
];

export const templateConfigs: Record<string, TemplateConfig> = {
  modern: {
    name: "Modern",
    fields: [...commonFields],
  },
  creative: {
    name: "Creative",
    fields: [...commonFields],
  },
  professional: {
    name: "Professional",
    fields: [...commonFields],
  },
};
