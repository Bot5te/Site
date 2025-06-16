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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <img 
                src={logoSvg} 
                alt="إنجاز وجدارة" 
                className="h-12 w-24 object-contain" 
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">إنجاز وجدارة</h1>
                <p className="text-xs sm:text-sm text-gray-600">لإستقدام العمالة المنزلية</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="text-center sm:text-right rtl:text-left">
                <p className="text-sm text-gray-600">إجمالي السير الذاتية</p>
                <p className="text-lg font-semibold text-primary">{counts.all}</p>
              </div>
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
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 rtl:left-0 rtl:right-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 rtl:pl-10 rtl:pr-3 text-right"
                placeholder="البحث في السير الذاتية..."
              />
            </div>
          </div>
          <div className="flex space-x-3 rtl:space-x-reverse">
            <Select defaultValue="date">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">ترتيب حسب التاريخ</SelectItem>
                <SelectItem value="name">ترتيب حسب الاسم</SelectItem>
                <SelectItem value="age">ترتيب حسب العمر</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-primary hover:bg-primary/90">
              <Filter className="w-4 h-4 ml-1" />
              فلترة
            </Button>
          </div>
        </div>

        {/* CV Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 bg-gray-200 rounded" />
                    <div className="h-8 w-12 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCvs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCvs.map((cv) => (
              <CvCard key={cv.id} cv={cv} onPreview={handlePreview} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
              <FolderOpen className="w-full h-full" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد سير ذاتية</h3>
            <p className="text-gray-500">
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
        className="fixed bottom-5 left-5 rtl:right-5 rtl:left-auto bg-gray-800 text-white hover:bg-gray-700 rounded-full p-3 shadow-lg z-50"
        size="icon"
      >
        <Settings className="w-6 h-6" />
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
