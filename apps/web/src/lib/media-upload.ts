import api from "./api";

export async function uploadMedia(file: File, context?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (context) {
    formData.append("context", context);
  }

  // Axios automatically sets Content-Type for FormData
  const res = await api.post("/media/upload", formData);

  // API should return full URLs, but handle relative URLs for backwards compatibility
  let url = res.data.url;
  if (url.startsWith("/") && !url.startsWith("//")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    url = `${apiUrl}${url}`;
  }

  return url;
}

export function useMediaUpload() {
  const upload = async (file: File, context?: string): Promise<string> => {
    return uploadMedia(file, context);
  };

  return { upload };
}

