export type ResumeExperience = {
  id: string;
  period: string;
  place: string;
  title: string;
  description: string;
  type: "work" | "education";
};

export type ResumeProject = {
  id: string;
  description: string;
  title: string;
  url: string;
};

export type ResumeSkill = {
  id: string;
  level: "advanced" | "expert";
  category: "framework" | "language" | "other";
  name: string;
};
