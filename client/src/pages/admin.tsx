import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Settings, Filter, Edit2, Eye, Trash2 } from "lucide-react";
import { FileUpload } from "@/components/file-upload";
import { CvPreviewModal } from "@/components/cv-preview-modal";
import { useCvs, useUploadCv, useDeleteCv, useUpdateCv } from "@/hooks/use-cvs";
import { useToast } from "@/hooks/use-toast";
import type { Cv } from "@shared/schema";

interface AdminProps {
  onClose: () => void;
}

export default function Admin({ onClose }: AdminProps) {
  const [filterNationality, setFilterNationality] = useState("all");
  const [selectedCv, setSelectedCv] = useState<Cv | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingCv, setEditingCv] = useState<Cv | null>(null);
  const [editForm, setEditForm] = useState({ name: "", age: "", nationality: "", experience: "" });

  const { data: cvs = [], isLoading } = useCvs(filterNationality);
  const uploadCvMutation = useUploadCv();
  const deleteCvMutation = useDeleteCv();
  const updateCvMutation = useUpdateCv();
  const { toast } = useToast();

  const handleUpload = async (cvData: { name: string; age: number; nationality: string; experience: string }, file: File) => {
    try {
      await uploadCvMutation.mutateAsync({ cvData, file });
      toast({
        title: "تم رفع السيرة الذاتية بنجاح",
        description: `تم رفع سيرة ${cvData.name} بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في رفع السيرة الذاتية",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (cv: Cv) => {
    if (window.confirm(`هل أنت متأكد من حذف سيرة ${cv.name}؟`)) {
      try {
        await deleteCvMutation.mutateAsync(cv.id);
        toast({
          title: "تم حذف السيرة الذاتية",
          description: `تم حذف سيرة ${cv.name} بنجاح`,
        });
      } catch (error) {
        toast({
          title: "خطأ في حذف السيرة الذاتية",
          description: "حدث خطأ أثناء حذف السيرة الذاتية",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (cv: Cv) => {
    setEditingCv(cv);
    setEditForm({
      name: cv.name,
      age: cv.age.toString(),
      nationality: cv.nationality,
      experience: cv.experience,
    });
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCv) return;

    try {
      await updateCvMutation.mutateAsync({
        id: editingCv.id,
        data: {
          name: editForm.name,
          age: parseInt(editForm.age),
          nationality: editForm.nationality,
          experience: editForm.experience,
        },
      });
      setEditingCv(null);
      toast({
        title: "تم تحديث السيرة الذاتية",
        description: "تم تحديث البيانات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ أثناء تحديث البيانات",
        variant: "destructive",
      });
    }
  };

  const handlePreview = (cv: Cv) => {
    setSelectedCv(cv);
    setIsPreviewOpen(true);
  };

  const getNationalityLabel = (nationality: string) => {
    const labels: Record<string, string> = {
      'philippines': 'الفلبين',
      'ethiopia': 'إثيوبيا',
      'kenya': 'كينيا',
    };
    return labels[nationality.toLowerCase()] || nationality;
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="border-b pb-4 bg-primary text-white p-6 -m-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <Settings className="w-6 h-6" />
                <DialogTitle className="text-lg font-semibold">لوحة التحكم</DialogTitle>
              </div>
              <Button 
                onClick={onClose} 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-primary-dark"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </DialogHeader>
          
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 -m-6">
            {/* Upload Section */}
            <FileUpload 
              onUpload={handleUpload} 
              isLoading={uploadCvMutation.isPending} 
            />

            {/* CV Management Table */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">إدارة السير الذاتية</h4>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Select value={filterNationality} onValueChange={setFilterNationality}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الجنسيات</SelectItem>
                      <SelectItem value="philippines">الفلبين</SelectItem>
                      <SelectItem value="ethiopia">إثيوبيا</SelectItem>
                      <SelectItem value="kenya">كينيا</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="bg-primary hover:bg-primary/90" size="sm">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right">العمر</TableHead>
                        <TableHead className="text-right">الجنسية</TableHead>
                        <TableHead className="text-right">نوع الملف</TableHead>
                        <TableHead className="text-right">تاريخ الرفع</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cvs.map((cv) => (
                        <TableRow key={cv.id}>
                          <TableCell className="font-medium">{cv.name}</TableCell>
                          <TableCell>{cv.age}</TableCell>
                          <TableCell>{getNationalityLabel(cv.nationality)}</TableCell>
                          <TableCell>
                            <Badge variant={cv.fileType === 'pdf' ? 'destructive' : 'secondary'}>
                              {cv.fileType === 'pdf' ? 'PDF' : 'صورة'}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(cv.uploadDate).toLocaleDateString('ar-SA')}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2 rtl:space-x-reverse">
                              <Button 
                                onClick={() => handleEdit(cv)}
                                variant="ghost" 
                                size="sm"
                                className="text-primary hover:text-primary/80"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => handlePreview(cv)}
                                variant="ghost" 
                                size="sm"
                                className="text-green-600 hover:text-green-700"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                onClick={() => handleDelete(cv)}
                                variant="ghost" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={deleteCvMutation.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {cvs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                            لا توجد سير ذاتية متاحة
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit CV Modal */}
      <Dialog open={!!editingCv} onOpenChange={() => setEditingCv(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل السيرة الذاتية</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-right block mb-2">الاسم</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="text-right"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-age" className="text-right block mb-2">العمر</Label>
              <Input
                id="edit-age"
                type="number"
                value={editForm.age}
                onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                className="text-right"
                min="1"
                max="100"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-nationality" className="text-right block mb-2">الجنسية</Label>
              <Select 
                value={editForm.nationality} 
                onValueChange={(value) => setEditForm({ ...editForm, nationality: value })}
              >
                <SelectTrigger className="text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="philippines">الفلبين</SelectItem>
                  <SelectItem value="ethiopia">إثيوبيا</SelectItem>
                  <SelectItem value="kenya">كينيا</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={() => setEditingCv(null)} 
                variant="outline" 
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={updateCvMutation.isPending}
              >
                {updateCvMutation.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* CV Preview Modal */}
      <CvPreviewModal 
        cv={selectedCv} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
    </>
  );
}
