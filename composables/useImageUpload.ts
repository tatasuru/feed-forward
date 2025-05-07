export function useImageUpload(options: {
  bucket?: string;
  maxSize?: number;
  allowedTypes?: string[];
  folderPath?: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}) {
  // set default values
  const {
    bucket = "profile-images",
    maxSize = 2 * 1024 * 1024,
    allowedTypes = ["image/jpeg", "image/png"],
    folderPath = "",
    onSuccess = () => {},
    onError = () => {},
  } = options;

  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const dropZoneRef = ref<HTMLDivElement>();
  const uploadedImageUrl = ref<string>("");
  const isUploading = ref<boolean>(false);

  const { isOverDropZone } = useDropZone(dropZoneRef, {
    onDrop,
    dataTypes: allowedTypes,
    multiple: false,
    preventDefaultForUnhandled: false,
  });

  async function onDrop(files: File[] | null) {
    if (!files || files.length === 0) {
      return;
    }

    try {
      uploadedImageUrl.value = (await uploadImage(files[0])) || "";

      setTimeout(() => {
        isUploading.value = false;
      }, 1000);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  async function handleMainImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    try {
      uploadedImageUrl.value = (await uploadImage(file)) || "";

      setTimeout(() => {
        isUploading.value = false;
      }, 1000);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }

  async function uploadImage(file: File | null): Promise<string | null> {
    isUploading.value = true;

    if (!file) {
      isUploading.value = false;
      return null;
    }
    if (file.size > maxSize) {
      throw new Error(
        "サイズ制限を超えています。2MB以下の画像をアップロードしてください。"
      );
    }
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        "無効なファイル形式です。JPEGまたはPNG形式の画像をアップロードしてください。"
      );
    }

    const fileExt = file.name.split(".").pop();
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = folderPath ? `${folderPath}/${filename}` : filename;

    try {
      // 1. Check if a file already exists
      const { data: existingFile } = await supabase.storage
        .from(bucket)
        .list(user.value?.id, {
          limit: 1,
          offset: 0,
          sortBy: { column: "created_at", order: "desc" },
        });

      // 2. If a file exists, delete it
      if (existingFile && existingFile.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from(bucket)
          .remove([`${user.value?.id}/${existingFile[0].name}`]);

        if (deleteError) {
          throw deleteError;
        }
      }

      // 3. Upload the new file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // 4. Get the public URL of the uploaded file
      const publicUrl = supabase.storage.from(bucket).getPublicUrl(filePath)
        .data.publicUrl;

      return publicUrl;
    } catch (error) {
      console.error("Error in uploadImage function:", error);
      isUploading.value = false;
      throw new Error(
        "画像のアップロード中にエラーが発生しました。再度お試しください。"
      );
    }
  }

  return {
    dropZoneRef,
    isOverDropZone,
    uploadedImageUrl,
    isUploading,
    onDrop,
    handleMainImageUpload,
    uploadImage,
  };
}
