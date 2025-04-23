// server/api/link-preview.ts
import { getLinkPreview } from "link-preview-js";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string | undefined;

  if (!url) {
    throw createError({
      statusCode: 400,
      message: "URL parameter is required",
    });
  }

  try {
    const data = await getLinkPreview(url);
    return data;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw createError({
      statusCode: 500,
      message: "Failed to fetch link preview",
      cause: errorMessage,
    });
  }
});
