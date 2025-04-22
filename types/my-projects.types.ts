export type MyProject = {
  id: string;
  created_at: Date;
  deadline: Date;
  description: string;
  feedback_count: number;
  project_type: "design" | "demo" | "plan";
  resource_url: string;
  status: "draft" | "active" | "completed" | "archived";
  title: string;
  updated_at: Date;
  visibility_type: "public" | "limited" | "private";
};
