import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { insertColumnSchema } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const columnFormSchema = insertColumnSchema.extend({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(50, 'Title must be less than 50 characters'),
  color: z
    .enum(['red', 'blue', 'green', 'yellow', 'purple', 'gray'])
    .default('blue'),
  position: z.number().default(0),
  showSlider: z.boolean().default(true), // Fixed showSlider field type
});

type ColumnFormValues = z.infer<typeof columnFormSchema>;

interface ColumnModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns?: Array<{ position: number }>; // Added columns prop to get current positions
}

const colorOptions = [
  { value: 'red', color: 'bg-red-500' },
  { value: 'blue', color: 'bg-blue-500' },
  { value: 'green', color: 'bg-green-500' },
  { value: 'yellow', color: 'bg-yellow-500' },
  { value: 'purple', color: 'bg-purple-500' },
  { value: 'gray', color: 'bg-gray-500' },
];

export default function ColumnModal({ isOpen, onClose, columns = [] }: ColumnModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Calculate the next position (at the end)
  const nextPosition = columns.length > 0 ? columns.length + 1 : 0;

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnFormSchema),
    defaultValues: {
      title: '',
      color: 'blue',
      position: 5,
      showSlider: 1, // Added showSlider default value
    },
  });

  const createColumnMutation = useMutation({
    mutationFn: async (data: ColumnFormValues) => {
      const response = await apiRequest('POST', '/api/columns', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/columns'] });
      toast({
        title: 'Column created successfully',
        description: 'Your new column has been added to the board.',
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Error creating column',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: ColumnFormValues) => {
    createColumnMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter column title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex space-x-2">
                      {colorOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => field.onChange(option.value)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all',
                            option.color,
                            field.value === option.value
                              ? 'border-gray-800 scale-110'
                              : 'border-transparent hover:border-gray-400'
                          )}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="showSlider"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show Progress Slider</FormLabel>
                    <FormDescription>
                      Display progress sliders on task cards in this column
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

            <div className="flex space-x-3 pt-4">
              <Button
                type="submit"
                disabled={createColumnMutation.isPending}
                className="flex-1"
              >
                Create Column
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}