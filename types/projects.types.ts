export type Project = {
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
  app_notifications: boolean;
  email_notifications: boolean;
  evaluation_type: string;
  user_id: string;
  user_avatar_url: string;
  user_display_name: string | null;
};
