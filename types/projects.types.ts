// Existing Project type
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

// New types for the get_project_with_feedback function

export type User = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
};

export type EvaluationCriteria = {
  id: string;
  name: string;
  description: string | null;
  evaluation_type: string;
  template_id: string | null;
};

export type FeedbackRating = {
  id: string;
  criteria_id: string;
  rating: number;
  comment: string | null;
  criteria: {
    id: string;
    name: string;
    description: string | null;
    evaluation_type: string;
  };
};

export type Feedback = {
  id: string;
  user_id: string | null;
  is_anonymous: boolean;
  overall_comment: string | null;
  created_at: string;
  updated_at: string;
  ratings: FeedbackRating[];
  user: User | null;
};

export type ProjectWithFeedback = {
  project: {
    id: string;
    user_id: string;
    title: string;
    description: string;
    project_type: "design" | "demo" | "plan";
    resource_url: string;
    deadline: string | null;
    created_at: string;
    updated_at: string;
    visibility_type: "public" | "limited" | "private";
    email_notifications: boolean;
    app_notifications: boolean;
    status: "draft" | "active" | "completed" | "archived";
    evaluation_type: string | null;
  };
  feedbacks: Feedback[];
  evaluation_criteria: EvaluationCriteria[];
  owner: User;
};
