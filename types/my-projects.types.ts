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

// Response from get_my_projects_with_feedback_ratings RPC call
export type FeedbackUserProfile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  email: string | null;
};

// Response from get_my_projects_with_feedback_ratings RPC call
export type Feedback = {
  id: string;
  project_id: string;
  user_id: string | null;
  is_anonymous: boolean;
  overall_comment: string | null;
  created_at: Date;
  updated_at: Date;
  ratings: FeedbackRating[];
  user: FeedbackUserProfile | null;
};

export type MyProjectWithFeedback = {
  id: string;
  created_at: Date;
  deadline: Date | null;
  description: string;
  project_type: "design" | "demo" | "plan";
  resource_url: string;
  status: "draft" | "active" | "completed" | "archived";
  title: string;
  updated_at: Date;
  visibility_type: "public" | "limited" | "private";
  email_notifications: boolean;
  app_notifications: boolean;
  evaluation_type: string;

  // フィードバック関連情報
  feedback_count: number;
  evaluation_criteria: EvaluationCriteria[];
  feedback: Feedback[];

  // 平均評価情報（集計データ）
  average_ratings?: {
    criteria_id: string;
    criteria_name: string;
    average_rating: number;
    rating_count: number;
  }[];

  user: {
    id: string;
    name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    bio: string | null;
    website: string | null;
    email: string | null;
  };
};
