
import { Bell, Calendar, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: Date;
  category: string;
  important: boolean;
  link?: string;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

const AnnouncementCard = ({ announcement }: AnnouncementCardProps) => {
  const { language } = useLanguage();
  
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'health':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'infrastructure':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'governance':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'education':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'agriculture':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return format(date, 'PPP');
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${
      announcement.important ? 'border-l-4 border-l-red-500' : ''
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge className={getCategoryColor(announcement.category)} variant="secondary">
            {announcement.category}
          </Badge>
          {announcement.important && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Important
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg md:text-xl font-heading mt-2">
          {announcement.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{announcement.content}</p>
        <div className="flex items-center mt-4 text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formatDate(announcement.date)}</span>
        </div>
      </CardContent>
      {announcement.link && (
        <CardFooter className="pt-0">
          <Button variant="ghost" className="px-0 text-gov-blue-600 hover:text-gov-blue-800 font-medium" asChild>
            <a href={announcement.link} target="_blank" rel="noopener noreferrer">
              Read more <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AnnouncementCard;
