import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Cv, CvBasic } from "@shared/schema";
import { uploadCv, updateCv, deleteCv } from "@/lib/api";

export function useCvs(nationality?: string) {
  const queryKey = nationality && nationality !== 'all' 
    ? ['/api/cvs', nationality] 
    : ['/api/cvs'];
    
  return useQuery<CvBasic[]>({
    queryKey,
    queryFn: async () => {
      const url = nationality && nationality !== 'all' 
        ? `/api/cvs?nationality=${nationality}` 
        : '/api/cvs';
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to fetch CVs');
      }
      return response.json();
    },
  });
}

export function useUploadCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ cvData, file }: { 
      cvData: { name: string; age: number; nationality: string; experience: string }; 
      file: File 
    }) => uploadCv(cvData, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
    },
  });
}

export function useUpdateCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: Partial<{ name: string; age: number; nationality: string; experience: string }> 
    }) => updateCv(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
    },
  });
}

export function useDeleteCv() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteCv(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cvs'] });
    },
  });
}
