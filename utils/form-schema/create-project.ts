import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

// Define a schema for each criteria item
const criteriaItemSchema = z.object({
  name: z.string({
    message: "評価基準名は必須です",
    required_error: "評価基準名は必須です",
  }),
  description: z.string({
    message: "評価基準の説明は必須です",
    required_error: "評価基準の説明は必須です",
  }),
});

export const formSchema = toTypedSchema(
  z
    .object({
      title: z
        .string({
          message: "プロジェクト名は必須です",
        })
        .min(2, {
          message: "プロジェクト名は2文字以上で入力してください",
        })
        .max(50, {
          message: "プロジェクト名は50文字以内で入力してください",
        }),
      description: z.string({
        message: "プロジェクトの説明は必須です",
        required_error: "プロジェクトの説明は必須です",
      }),
      projectType: z.enum(["design", "demo", "plan"], {
        errorMap: () => ({ message: "プロジェクトの種類は必須です" }),
      }),
      deadline: z
        .string({
          message: "プロジェクトの期限は必須です",
        })
        .regex(/^[0-9/]+$/, {
          message: "日付は数字とスラッシュのみで入力してください",
        })
        .regex(/^\d{4}\/\d{2}\/\d{2}$/, {
          message: "日付はYYYY/MM/DD形式で入力してください",
        })
        .refine(
          (v) => {
            const parts = v.split("/");
            if (parts.length !== 3) return false;

            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const day = parseInt(parts[2]);

            // Check if the month is valid (1-12)
            const date = new Date(year, month - 1, day);
            return (
              date.getFullYear() === year &&
              date.getMonth() === month - 1 &&
              date.getDate() === day
            );
          },
          {
            message: "有効な日付を入力してください",
          }
        )
        .refine(
          (v) => {
            // Check if the date is in the future
            const parts = v.split("/");
            const inputDate = new Date(
              parseInt(parts[0]),
              parseInt(parts[1]) - 1,
              parseInt(parts[2])
            );
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
            return inputDate >= today;
          },
          {
            message: "期限は未来の日付である必要があります",
          }
        ),
      resourceUrl: z
        .string({
          message: "フィードバック対象のファイルやリンクは必須です",
        })
        .url("URL形式で入力してください"),
      evaluationType: z.enum(
        [
          "uiDesignEvaluation",
          "uxDesignEvaluation",
          "demoEvaluation",
          "planEvaluation",
          "customEvaluation",
        ],
        {
          errorMap: () => ({ message: "テンプレートの種類は必須です" }),
        }
      ),
      criteriaTemplate: z
        .array(criteriaItemSchema)
        .min(1, { message: "少なくとも1つの評価項目を設定してください" })
        .max(3, { message: "評価項目は最大3つまで設定できます" })
        .optional()
        .refine(
          (criteria) => {
            return (
              criteria === undefined ||
              criteria.length === 0 ||
              criteria.every((item) => item.name && item.description)
            );
          },
          {
            message: "すべての評価項目に名前と説明を入力してください",
          }
        ),
      visibilityType: z.enum(["public", "unlisted", "private"], {
        errorMap: () => ({ message: "公開範囲は必須です" }),
      }),
      emailNotifications: z.boolean({}).optional(),
      appNotifications: z.boolean({}).optional(),
    })
    .refine(
      (data) => {
        if (data.evaluationType === "customEvaluation") {
          return (
            Array.isArray(data.criteriaTemplate) &&
            data.criteriaTemplate.length > 0
          );
        }
        return true;
      },
      {
        message:
          "カスタム評価の場合は、少なくとも1つの評価項目を設定してください",
        path: ["criteriaTemplate"],
      }
    )
);
