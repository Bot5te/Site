import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, Search, Filter, FolderOpen } from "lucide-react";
import { CvCard } from "@/components/cv-card";
import { CvPreviewModal } from "@/components/cv-preview-modal";
import { AdminLoginModal } from "@/components/admin-login-modal";
import { useCvs } from "@/hooks/use-cvs";
import type { Cv } from "@shared/schema";
import logoSvg from "@/assets/logo.svg";

interface HomeProps {
  onAdminLogin: () => void;
}

export default function Home({ onAdminLogin }: HomeProps) {
  const [selectedNationality, setSelectedNationality] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCv, setSelectedCv] = useState<Cv | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  const { data: cvs = [], isLoading } = useCvs(selectedNationality);

  // Filter CVs based on search query
  const filteredCvs = cvs.filter(cv => 
    cv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cv.nationality.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get counts for each nationality
  const getCounts = () => {
    const allCvs = useCvs().data || [];
    return {
      all: allCvs.length,
      philippines: allCvs.filter(cv => cv.nationality === 'philippines').length,
      ethiopia: allCvs.filter(cv => cv.nationality === 'ethiopia').length,
      kenya: allCvs.filter(cv => cv.nationality === 'kenya').length,
    };
  };

  const counts = getCounts();

  const handlePreview = (cv: Cv) => {
    setSelectedCv(cv);
    setIsPreviewOpen(true);
  };

  const handleAdminSuccess = () => {
    setIsAdminLoginOpen(false);
    onAdminLogin();
  };

  const nationalityTabs = [
    { key: "all", label: "جميع الجنسيات", count: counts.all },
    { key: "philippines", label: "الفلبين", count: counts.philippines },
    { key: "ethiopia", label: "إثيوبيا", count: counts.ethiopia },
    { key: "kenya", label: "كينيا", count: counts.kenya },
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-50 via-blue-50 to-gray-50 shadow-xl border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-center py-8 lg:py-12 space-y-8 lg:space-y-0">
            {/* Logo Section - Full Width on Mobile */}
            <div className="flex items-center justify-center w-full lg:w-auto">
              <div className="bg-white rounded-2xl shadow-lg p-4 border border-blue-100">
                <img 
                  src="@assets/Screenshot_٢٠٢٥٠٦١٦_١١١٠١١_Drive_1750061436030_1750089721030.jpg"
                  alt="إنجاز وجدارة لإستقدام العمالة المنزلية" 
                  className="h-20 sm:h-24 lg:h-28 xl:h-32 w-auto object-contain max-w-full" 
                />
              </div>
            </div>
            
            {/* Stats and Controls */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 rtl:space-x-reverse">
              {/* Stats Card */}
              <div className="bg-white rounded-xl px-6 py-4 shadow-lg border border-blue-100 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium mb-1">إجمالي السير الذاتية</p>
                  <p className="text-3xl font-bold text-blue-600">{counts.all}</p>
                </div>
              </div>
              
              {/* Admin Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setIsAdminLoginOpen(true)}
                className="bg-white hover:bg-blue-50 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300 px-6 py-3"
              >
                <Settings className="h-5 w-5 ml-2" />
                <span className="font-medium">لوحة الإدارة</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Nationality Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap space-x-4 sm:space-x-8 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
            {nationalityTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedNationality(tab.key)}
                className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  selectedNationality === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                <Badge variant="secondary" className="ml-1 sm:ml-2 rtl:mr-1 sm:rtl:mr-2 rtl:ml-0 text-xs">
                  {tab.count}
                </Badge>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="mb-6 sm:mb-8 flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-8 sm:pr-10 rtl:pl-8 sm:rtl:pl-10 rtl:pr-3 text-right text-sm sm:text-base"
                placeholder="البحث في السير الذاتية..."
              />
            </div>
          </div>
          <div className="flex space-x-2 sm:space-x-3 rtl:space-x-reverse">
            <Select defaultValue="date">
              <SelectTrigger className="w-32 sm:w-40 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">ترتيب حسب التاريخ</SelectItem>
                <SelectItem value="name">ترتيب حسب الاسم</SelectItem>
                <SelectItem value="age">ترتيب حسب العمر</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary hover:bg-primary/90 text-xs sm:text-sm px-3 sm:px-4">
              <Filter className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              فلترة
            </Button>
          </div>
        </div>

        {/* CV Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-32 sm:h-48 bg-gray-200" />
                <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-1 sm:space-y-2">
                    <div className="h-2 sm:h-3 bg-gray-200 rounded" />
                    <div className="h-2 sm:h-3 bg-gray-200 rounded" />
                    <div className="h-2 sm:h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-6 sm:h-8 bg-gray-200 rounded" />
                    <div className="h-6 sm:h-8 w-8 sm:w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCvs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredCvs.map((cv) => (
              <CvCard key={cv.id} cv={cv} onPreview={handlePreview} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <div className="mx-auto h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4">
              <FolderOpen className="w-full h-full" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">لا توجد سير ذاتية</h3>
            <p className="text-sm sm:text-base text-gray-500 px-4">
              {searchQuery 
                ? "لا توجد نتائج تطابق البحث الحالي"
                : "لا توجد سير ذاتية متاحة لهذه الجنسية حاليًا"
              }
            </p>
          </div>
        )}
      </main>

      {/* Admin Panel Button */}
      <Button 
        onClick={() => setIsAdminLoginOpen(true)}
        className="fixed bottom-4 sm:bottom-5 left-4 sm:left-5 rtl:right-4 sm:rtl:right-5 rtl:left-auto bg-gray-800 text-white hover:bg-gray-700 rounded-full p-2 sm:p-3 shadow-lg z-50"
        size="icon"
      >
        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
      </Button>

      {/* Modals */}
      <CvPreviewModal 
        cv={selectedCv} 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
      />
      
      <AdminLoginModal 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminSuccess}
      />
    </>
  );
}
