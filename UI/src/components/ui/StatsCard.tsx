import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'indigo' | 'pink';
}

const colorMap = {
  green:  { border: 'border-l-green-500', bg: 'bg-green-100', text: 'text-green-600' },
  blue:   { border: 'border-l-blue-500',  bg: 'bg-blue-100',  text: 'text-blue-600' },
  purple: { border: 'border-l-purple-500',bg: 'bg-purple-100',text: 'text-purple-600' },
  yellow: { border: 'border-l-yellow-500',bg: 'bg-yellow-100',text: 'text-yellow-600' },
  red:    { border: 'border-l-red-500',   bg: 'bg-red-100',   text: 'text-red-600' },
  indigo: { border: 'border-l-indigo-500',bg: 'bg-indigo-100',text: 'text-indigo-600' },
  pink:   { border: 'border-l-pink-500',  bg: 'bg-pink-100',  text: 'text-pink-600' },
};

export const StatsCard = ({ title, value, description, icon: Icon, color = 'blue' }: StatsCardProps) => {
  const styles = colorMap[color];

  return (
    <Card className={cn("bg-white border-none shadow-lg border-l-4", styles.border)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
          <div className={cn("p-2 rounded-full", styles.bg)}>
            <Icon className={cn("h-5 w-5", styles.text)} />
          </div>
        </div>
        <div className="text-2xl font-black text-gray-800 mt-2">{value}</div>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </CardContent>
    </Card>
  );
};