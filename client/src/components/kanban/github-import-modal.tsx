import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Column } from '@shared/schema';

interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
}

interface GitHubIssue {
  id: number;
  title: string;
  body: string;
  state: string;
  html_url: string;
  number: number;
}

export default function GitHubImportModal({
  isOpen,
  onClose,
  columns,
}: GitHubImportModalProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const importTasksMutation = useMutation({
    mutationFn: async (
      tasks: {
        title: string;
        description: string;
        columnId: number;
        position: number;
      }[]
    ) => {
      const promises = tasks.map((task) =>
        apiRequest('POST', '/api/tasks', task)
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Issues imported successfully',
        description: 'GitHub issues have been imported to your Kanban board.',
      });
      onClose();
      setRepoUrl('');
    },
    onError: (error) => {
      toast({
        title: 'Error importing issues',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const extractRepoInfo = (url: string) => {
    try {
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        return { owner: match[1], repo: match[2].replace('.git', '') };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleImport = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid GitHub repository URL.',
        variant: 'destructive',
      });
      return;
    }

    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid GitHub repository URL.',
        variant: 'destructive',
      });
      return;
    }

    if (columns.length === 0) {
      toast({
        title: 'No columns available',
        description:
          'Please create at least one column before importing issues.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the first column (sorted by position)
      const firstColumn = columns.sort((a, b) => a.position - b.position)[0];

      // Fetch issues from GitHub API
      const response = await fetch(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}/issues?state=open&per_page=50`
      );

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }

      const issues: GitHubIssue[] = await response.json();

      if (issues.length === 0) {
        toast({
          title: 'No issues found',
          description: 'This repository has no open issues to import.',
        });
        setIsLoading(false);
        return;
      }

      //fetch the index of the next task position in the first column
      const existingTasksResponse = await apiRequest('GET', '/api/tasks');
      const existingTasks = await existingTasksResponse.json();
      const existingTasksInFirstColumn = existingTasks.filter(
        (task: { columnId: number }) => task.columnId === firstColumn.id
      );
      let nextPosition = existingTasksInFirstColumn.length;

      // Convert GitHub issues to tasks
      const tasks = issues
        .filter((issue) => !issue.html_url.includes('/pull/')) // Filter out pull requests
        .map((issue, index) => ({
          title: `#${issue.number}: ${issue.title}`,
          description: issue.body || 'No description provided',
          columnId: firstColumn.id,
          position: nextPosition++,
        }));

      if (tasks.length === 0) {
        toast({
          title: 'No issues to import',
          description:
            'All items in this repository are pull requests, not issues.',
        });
        setIsLoading(false);
        return;
      }

      await importTasksMutation.mutateAsync(tasks);
    } catch (error) {
      toast({
        title: 'Error fetching issues',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to fetch issues from GitHub',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Issues from GitHub</DialogTitle>
          <DialogDescription>
            Enter the URL of a public GitHub repository to import its open
            issues to your Kanban board. Issues will be imported to the first
            column:{' '}
            <strong>
              {columns.sort((a, b) => a.position - b.position)[0]?.title ||
                'No columns available'}
            </strong>
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="repo-url" className="text-right">
              Repository URL
            </Label>
            <Input
              id="repo-url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/owner/repo"
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !repoUrl.trim()}
          >
            {isLoading ? 'Importing...' : 'Import Issues'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
