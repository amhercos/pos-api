import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; 

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string; 
}

export function StatCard({ title, value, icon, description, className }: StatCardProps) {
  return (
    <Card className={cn("shadow-sm border-sidebar-border/50", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 pb-1">
        <CardTitle className="text-[9px] lg:text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="hidden sm:block text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="text-xs lg:text-2xl font-black tracking-tight text-foreground">
          {value}
        </div>
        {description && (
          <p className="text-[8px] text-muted-foreground mt-0.5 hidden lg:block">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}