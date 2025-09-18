
import axiosInstance from "../config/axiosConfig";
import { UploadResponse } from "../interface/upload.interface";

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  return await axiosInstance.post("/public/v1/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
