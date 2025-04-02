
import { useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import AnnouncementCard, { Announcement } from './AnnouncementCard';
import { announcements } from '@/data/services';
import { useLanguage } from '@/contexts/LanguageContext';

const AnnouncementsSection = () => {
  const { language } = useLanguage();
  const [filter, setFilter] = useState<string | null>(null);
  
  // Get unique categories from announcements
  const categories = Array.from(new Set(announcements.map(a => a.category)));

  // Filter announcements based on selected category
  const filteredAnnouncements = filter 
    ? announcements.filter(a => a.category === filter) 
    : announcements;

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <Bell className="text-gov-blue-600 mr-2" />
            <h2 className="text-2xl font-heading font-bold text-gov-blue-800">
              {language === 'english' ? 'Latest Announcements' : 'नवीनतम घोषणा'}
            </h2>
          </div>
          
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="mr-2 h-4 w-4" />
                  {filter ? filter : language === 'english' ? 'All Categories' : 'सर्व श्रेणी'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter(null)}>
                  {language === 'english' ? 'All Categories' : 'सर्व श्रेणी'}
                </DropdownMenuItem>
                {categories.map((category) => (
                  <DropdownMenuItem key={category} onClick={() => setFilter(category)}>
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsSection;
