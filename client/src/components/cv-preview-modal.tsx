import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
import type { CvBasic } from "@shared/schema";
import { getFileUrl } from "@/lib/api";

interface CvPreviewModalProps {
  cv: CvBasic | null;
  isOpen: boolean;
  onClose: () => void;
}

const getNationalityLabel = (nationality: string) => {
  const labels: Record<string, string> = {
    'philippines': 'الفلبين',
    'ethiopia': 'إثيوبيا',
    'kenya': 'كينيا',
  };
  return labels[nationality.toLowerCase()] || nationality;
};

export function CvPreviewModal({ cv, isOpen, onClose }: CvPreviewModalProps) {
  if (!cv) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getFileUrl(cv);
    link.download = cv.fileName;
    link.click();
  };

  const handleShare = async () => {
    const url = window.location.origin + getFileUrl(cv);
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CV - ${cv.name}`,
          url: url,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط إلى الحافظة');
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('تم نسخ الرابط إلى الحافظة');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="text-right">
            معاينة السيرة الذاتية - {cv.name}
          </DialogTitle>
          <p className="text-sm text-gray-600 text-right">
            {cv.name} - {getNationalityLabel(cv.nationality)}
          </p>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div className="flex justify-center mb-6">
            {cv.fileType === 'pdf' ? (
              <iframe
                src={getFileUrl(cv)}
                className="w-full h-96 border border-gray-200 rounded-lg"
                title={`CV - ${cv.name}`}
              />
            ) : (
              <img 
                src={getFileUrl(cv)} 
                alt="CV Preview" 
                className="max-w-full h-auto border border-gray-200 rounded-lg shadow-sm"
              />
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">معلومات أساسية</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>الاسم:</span>
                  <span>{cv.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>العمر:</span>
                  <span>{cv.age} سنة</span>
                </div>
                <div className="flex justify-between">
                  <span>الجنسية:</span>
                  <span>{getNationalityLabel(cv.nationality)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">تفاصيل الملف</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>نوع الملف:</span>
                  <span>{cv.fileType === 'pdf' ? 'PDF' : 'صورة'}</span>
                </div>
                <div className="flex justify-between">
                  <span>اسم الملف:</span>
                  <span className="truncate max-w-20">{cv.fileName}</span>
                </div>
                <div className="flex justify-between">
                  <span>تاريخ الرفع:</span>
                  <span>{new Date(cv.uploadDate).toLocaleDateString('ar-SA')}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">الإجراءات</h4>
              <div className="space-y-2">
                <Button 
                  onClick={handleDownload} 
                  className="w-full bg-primary hover:bg-primary/90" 
                  size="sm"
                >
                  <Download className="w-4 h-4 ml-1" />
                  تحميل الملف
                </Button>
                <Button 
                  onClick={handleShare} 
                  className="w-full bg-green-500 hover:bg-green-600" 
                  size="sm"
                >
                  <Share className="w-4 h-4 ml-1" />
                  مشاركة الرابط
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
