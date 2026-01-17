'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { genres } from '@/lib/genres';
import { useSession } from '@/hooks/use-session';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Rocket, Wand2 } from 'lucide-react';
import { NeonIcon } from './NeonIcon';

const setupSchema = z.object({
  genre: z.string().min(1, 'Please select a genre.'),
  plot: z.string().optional(),
  triggerType: z.enum(['time', 'distance']),
  isCarpoolMode: z.boolean(),
});

type SetupFormValues = z.infer<typeof setupSchema>;

export const SetupScreen = () => {
  const { startNewSession } = useSession();
  const form = useForm<SetupFormValues>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      genre: 'Cyberpunk',
      plot: '',
      triggerType: 'time',
      isCarpoolMode: false,
    },
  });

  const onSubmit = (data: SetupFormValues) => {
    startNewSession(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] font-headline">
      <div className="text-center mb-10">
        <NeonIcon><Wand2 className="mx-auto h-16 w-16" /></NeonIcon>
        <h1 className="text-5xl font-bold mt-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          MyJourneyAI
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your adaptive AI storytelling fitness companion.
        </p>
      </div>

      <Card className="w-full max-w-2xl shadow-2xl shadow-primary/10">
        <CardHeader>
          <CardTitle>Create Your Adventure</CardTitle>
          <CardDescription>Configure your AI-powered story and start your journey.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a story genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Plot (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A detective searching for a missing android in a rain-slicked city..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Guide the AI with your own story idea.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="triggerType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Chapter Trigger</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="time" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Every 10 minutes
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="distance" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Every mile
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isCarpoolMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Carpool Mode
                      </FormLabel>
                      <FormDescription>
                        Longer distance triggers for vehicle journeys.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />


              <Button type="submit" className="w-full text-lg font-bold" size="lg">
                <Rocket className="mr-2 h-5 w-5" />
                Start Journey
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
