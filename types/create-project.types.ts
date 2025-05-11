export type ProjectData = {
  user_id: string;
  title: string;
  description: string;
  project_type: "design" | "demo" | "plan" | null;
  deadline: string | null;
  resource_url: string | null;
  evaluation_type:
    | "uiDesignEvaluation"
    | "uxDesignEvaluation"
    | "demoEvaluation"
    | "planEvaluation"
    | "customEvaluation"
    | null;
  evaluation_criteria?: {
    name: string;
    description: string;
    evaluation_type: "rating";
  }[];
  visibility_type: "public" | "unlisted" | "private" | null;
  email_notifications: boolean;
  app_notifications: boolean;
  status: "draft" | "active" | "archived" | "completed";
};

export type CriteriaTemplate = {
  id: number;
  name: string;
  description: string;
  evaluation_type: ProjectData["evaluation_type"];
  criteria: { name: string; description: string; evaluation_type: "rating" }[];
};
