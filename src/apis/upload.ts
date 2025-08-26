
import axiosInstance from "../config/axiosConfig";
import { UploadResponse } from "../interface/upload.interface";

export const uploadFile = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<UploadResponse>("/private/v1/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
