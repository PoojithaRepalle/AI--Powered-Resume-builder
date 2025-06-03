import React, { useState } from "react";
import { templateConfigs } from "../templates/templateConfigs";
import ResumeForm from "../components/ResumeForm";

type Props = {
  selectedTemplate: string;
};

const Builder: React.FC<Props> = ({ selectedTemplate }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const config = templateConfigs[selectedTemplate];

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  if (!config) {
    return <div className="text-red-500">Template not found.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        Fill Details for "{config.name}" Template
      </h2>
      <ResumeForm fields={config.fields} values={formData} onChange={handleChange} />
    </div>
  );
};

export default Builder;
