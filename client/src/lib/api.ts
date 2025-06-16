import { apiRequest } from "./queryClient";
import type { Cv, InsertCv } from "@shared/schema";

export async function uploadCv(cvData: { name: string; age: number; nationality: string; experience: string }, file: File): Promise<Cv> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('name', cvData.name);
  formData.append('age', cvData.age.toString());
  formData.append('nationality', cvData.nationality);
  formData.append('experience', cvData.experience);

  const response = await fetch('/api/cvs', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to upload CV');
  }

  return response.json();
}

export async function updateCv(id: string, data: Partial<{ name: string; age: number; nationality: string; experience: string }>): Promise<Cv> {
  const response = await apiRequest('PUT', `/api/cvs/${id}`, data);
  return response.json();
}

export async function deleteCv(id: string): Promise<void> {
  await apiRequest('DELETE', `/api/cvs/${id}`);
}

export async function loginAdmin(password: string): Promise<{ success: boolean; message: string }> {
  const response = await apiRequest('POST', '/api/admin/login', { password });
  return response.json();
}

export function getFileUrl(cv: Cv): string {
  return `/api/files/${cv.id}`;
}
