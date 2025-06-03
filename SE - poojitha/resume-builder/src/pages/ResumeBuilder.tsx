import React from "react";
import { useParams } from "react-router-dom";
import { templateConfigs, TemplateConfig } from "../templates/templateConfigs";
import ResumeForm from "../components/ResumeForm";
import { ResumeData } from "../types";

const ResumeBuilder: React.FC = () => {
  const { template } = useParams<{ template: string }>();
  const config: TemplateConfig | undefined = template ? templateConfigs[template] : undefined;

  // Handle resume submission
  const handleSubmit = (data: ResumeData) => {
    console.log("Resume form submitted!", data);
    // You can add additional logic here if needed
  };

  if (!config) {
    return <div className="p-6 text-red-500">Invalid template selected.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Build Your Resume with "{config.name}" Template
      </h2>

      {/* Pass the onSubmit handler to ResumeForm */}
      <ResumeForm onSubmit={handleSubmit} />
    </div>
  );
};

export default ResumeBuilder;