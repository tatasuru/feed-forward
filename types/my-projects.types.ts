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
  // Added types for the new fields
  criteria?: EvaluationCriteria[];
  feedback_ratings?: FeedbackRating[];
};

export type EvaluationCriteria = {
  id: string;
  name: string;
  description: string | null;
  evaluation_type: "rating" | "text";
};

export type FeedbackRating = {
  id: string;
  feedback_id: string;
  criteria_id: string;
  rating: number;
  comment: string | null;
  created_at: Date;
};

// Response from get_my_projects RPC call
export type GetMyProjectsResponse = {
  created_projects: MyProject[];
  contributed_projects: MyProject[];
};
