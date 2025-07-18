import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Task, Column, insertTaskSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const taskFormSchema = insertTaskSchema.extend({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  columnId: z.number().min(1, "Column is required"),
  position: z.number().default(0),
  progress: z.number().min(0).max(5).default(0),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  columns: Column[];
  selectedColumnId?: number | null;
}

export default function TaskModal({
  isOpen,
  onClose,
  task,
  columns,
  selectedColumnId,
}: TaskModalProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditing = !!task;

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      columnId: selectedColumnId || columns[0]?.id || 1,
      position: 0,
      progress: 0,
    },
  });

  // Update form when task or selectedColumnId changes
  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description || "",
        priority: task.priority as "low" | "medium" | "high",
        columnId: task.columnId,
        position: task.position,
        progress: task.progress || 0,
      });
    } else if (selectedColumnId) {
      form.reset({
        title: "",
        description: "",
        priority: "medium",
        columnId: selectedColumnId,
        position: 0,
        progress: 0,
      });
    }
  }, [task, selectedColumnId, form]);

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await apiRequest("POST", "/api/tasks", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task created successfully",
        description: "Your new task has been added to the board.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await apiRequest("PUT", `/api/tasks/${task!.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Task updated successfully",
        description: "Your task has been updated.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TaskFormValues) => {
    if (isEditing) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Task Details</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task title..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter task description..."
                          rows={3}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low Priority</SelectItem>
                          <SelectItem value="medium">Medium Priority</SelectItem>
                          <SelectItem value="high">High Priority</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="columnId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Column</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {columns.map((column) => (
                            <SelectItem key={column.id} value={column.id.toString()}>
                              {column.title}
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
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress ({field.value * 20}%)</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={5}
                          step={1}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="submit"
                    disabled={createTaskMutation.isPending || updateTaskMutation.isPending}
                    className="flex-1"
                  >
                    {isEditing ? "Update Task" : "Create Task"}
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
          </TabsContent>

          <TabsContent value="comments" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Comments</h3>
              {task ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    Comments will be displayed here once the backend is implemented.
                  </div>
                  {/* Placeholder for comments list */}
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">John Doe</span>
                          <span className="text-xs text-gray-500">2 hours ago</span>
                        </div>
                        <p className="text-sm text-gray-700">This is a sample comment to show the layout.</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Create the task first to add comments.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
