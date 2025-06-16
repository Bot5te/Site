import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  onUpload: (data: { name: string; age: number; nationality: string }, file: File) => void;
  isLoading: boolean;
}

export function FileUpload({ onUpload, isLoading }: FileUploadProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [nationality, setNationality] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "نوع ملف غير مدعوم",
          description: "يرجى اختيار ملف PDF أو صورة (JPEG, PNG)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "حجم الملف كبير جداً",
          description: "يجب أن يكون حجم الملف أقل من 5 ميجابايت",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !nationality || !selectedFile) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى ملء جميع الحقول واختيار ملف",
        variant: "destructive",
      });
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 100) {
      toast({
        title: "عمر غير صحيح",
        description: "يرجى إدخال عمر صحيح بين 1 و 100",
        variant: "destructive",
      });
      return;
    }

    onUpload({ name, age: ageNum, nationality }, selectedFile);
    
    // Reset form
    setName("");
    setAge("");
    setNationality("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-8">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">رفع سيرة ذاتية جديدة</h4>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-right block mb-2">الاسم</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم المتقدم"
              required
              className="text-right"
            />
          </div>
          
          <div>
            <Label htmlFor="age" className="text-right block mb-2">العمر</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="العمر"
              min="1"
              max="100"
              required
              className="text-right"
            />
          </div>
          
          <div>
            <Label htmlFor="nationality" className="text-right block mb-2">الجنسية</Label>
            <Select value={nationality} onValueChange={setNationality} required>
              <SelectTrigger className="text-right">
                <SelectValue placeholder="اختر الجنسية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="philippines">الفلبين</SelectItem>
                <SelectItem value="ethiopia">إثيوبيا</SelectItem>
                <SelectItem value="kenya">كينيا</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label className="text-right block mb-2">ملف السيرة الذاتية</Label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="mx-auto h-8 w-8 text-green-500" />
                <p className="text-sm text-gray-900 font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">اسحب الملف هنا أو اضغط للاختيار</p>
                <p className="text-xs text-gray-500 mt-1">PDF أو صورة (الحد الأقصى 5MB)</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-4 bg-green-500 hover:bg-green-600" 
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 ml-1" />
            {isLoading ? "جاري الرفع..." : "رفع السيرة الذاتية"}
          </Button>
        </div>
      </form>
    </div>
  );
}
