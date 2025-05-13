import type { ProjectWithFeedback } from "@/types/projects.types";

export const useRatingCalculation = () => {
  function getRatingPerCriteria(projectWithFeedback: ProjectWithFeedback) {
    const feedbacks = projectWithFeedback.feedbacks || [];
    const ratingAvgByCriteriaId: Record<string, number> = {};
    const ratingCountByCriteriaId: Record<string, number> = {};

    // 1. insert feedbacks into each criteria variable
    feedbacks.forEach((feedback) => {
      feedback.ratings.forEach((rating) => {
        if (!ratingAvgByCriteriaId[rating.criteria_id]) {
          ratingAvgByCriteriaId[rating.criteria_id] = 0;
          ratingCountByCriteriaId[rating.criteria_id] = 0;
        }
        ratingAvgByCriteriaId[rating.criteria_id] += rating.rating;
        ratingCountByCriteriaId[rating.criteria_id]++;
      });
    });

    // 2. calculate average rating for each criteria
    Object.keys(ratingAvgByCriteriaId).forEach((criteriaId) => {
      if (ratingCountByCriteriaId[criteriaId] > 0) {
        ratingAvgByCriteriaId[criteriaId] =
          ratingAvgByCriteriaId[criteriaId] /
          ratingCountByCriteriaId[criteriaId];
      }
    });

    // 3. set the average rating to the ratingPerCriteria
    return projectWithFeedback.evaluation_criteria.map((criteria) => {
      return {
        title: criteria.name,
        criteria_id: criteria.id,
        rating: ratingAvgByCriteriaId[criteria.id] || 0,
      };
    });
  }

  return {
    getRatingPerCriteria,
  };
};
