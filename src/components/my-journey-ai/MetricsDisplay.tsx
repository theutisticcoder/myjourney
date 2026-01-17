'use client';

import { useSession } from '@/hooks/use-session';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, Milestone, Leaf } from 'lucide-react';
import { NeonIcon } from './NeonIcon';

const CO2_SAVED_PER_MILE = 0.4;

const MetricCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
    <Card className="bg-card/50 backdrop-blur-sm text-center border-0 shadow-none">
        <CardHeader className="pb-2">
            <NeonIcon>{icon}</NeonIcon>
            <CardTitle className="text-sm font-medium text-muted-foreground font-code mt-2">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-2xl font-bold font-headline text-primary">{value}</p>
        </CardContent>
    </Card>
)

export const MetricsDisplay = () => {
  const { session } = useSession();

  if (!session) return null;

  const co2Saved = session.distance * CO2_SAVED_PER_MILE;

  return (
    <div className="grid grid-cols-3 gap-4">
      <MetricCard title="Speed (MPH)" value={session.speed.toFixed(1)} icon={<Gauge className="h-8 w-8 mx-auto" />} />
      <MetricCard title="Distance (mi)" value={session.distance.toFixed(2)} icon={<Milestone className="h-8 w-8 mx-auto" />} />
      <MetricCard title="CO2 Saved (kg)" value={co2Saved.toFixed(2)} icon={<Leaf className="h-8 w-8 mx-auto" />} />
    </div>
  );
};
