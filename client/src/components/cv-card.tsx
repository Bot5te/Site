import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download } from "lucide-react";
import type { CvBasic } from "@shared/schema";
import { getFileUrl } from "@/lib/api";

interface CvCardProps {
  cv: CvBasic;
  onPreview: (cv: CvBasic) => void;
}

const getNationalityFlag = (nationality: string) => {
  const flags: Record<string, string> = {
    'philippines': 'https://flagcdn.com/w40/ph.png',
    'ethiopia': 'https://flagcdn.com/w40/et.png',
    'kenya': 'https://flagcdn.com/w40/ke.png',
  };
  return flags[nationality.toLowerCase()] || '';
};

const getNationalityLabel = (nationality: string) => {
  const labels: Record<string, string> = {
    'philippines': 'الفلبين',
    'ethiopia': 'إثيوبيا',
    'kenya': 'كينيا',
  };
  return labels[nationality.toLowerCase()] || nationality;
};

export function CvCard({ cv, onPreview }: CvCardProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = getFileUrl(cv);
    link.download = cv.fileName;
    link.click();
  };

  return (
    <Card className="cv-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-t-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">{cv.fileType === 'pdf' ? '📄' : '🖼️'}</div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{cv.fileName}</p>
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <Badge variant={cv.fileType === 'pdf' ? 'destructive' : 'secondary'} className="text-xs">
            {cv.fileType === 'pdf' ? 'PDF' : 'صورة'}
          </Badge>
        </div>
        <div className="absolute top-2 right-2">
          <img 
            src={getNationalityFlag(cv.nationality)} 
            alt={`${cv.nationality} Flag`} 
            className="w-6 h-4 rounded-sm"
          />
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2">{cv.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              📅 العمر:
            </span>
            <span>{cv.age} سنة</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              🌍 الجنسية:
            </span>
            <span>{getNationalityLabel(cv.nationality)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              💼 الخبرة:
            </span>
            <span>{cv.experience}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              🕒 تاريخ الرفع:
            </span>
            <span>{new Date(cv.uploadDate).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => onPreview(cv)} 
            className="flex-1 bg-primary hover:bg-primary/90" 
            size="sm"
          >
            <Eye className="w-4 h-4 ml-1" />
            معاينة
          </Button>
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            size="sm"
            className="bg-green-500 hover:bg-green-600 text-white border-green-500"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
