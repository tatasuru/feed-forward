export type ProjectData = {
  user_id: string;
  title: string;
  description: string;
  project_type: "design" | "demo" | "plan";
  deadline: string | null;
  resource_url: string;
  evaluation_type:
    | "uiDesignEvaluation"
    | "uxDesignEvaluation"
    | "demoEvaluation"
    | "planEvaluation"
    | "customEvaluation";
  visibility_type: "public" | "unlisted" | "private";
  email_notifications: boolean;
  app_notifications: boolean;
  status: "draft" | "active" | "archived" | "completed";
};
