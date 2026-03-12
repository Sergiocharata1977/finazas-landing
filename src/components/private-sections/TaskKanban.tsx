'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import type { UserPrivateTask } from '@/types/private-sections';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface TaskKanbanProps {
  tasks: UserPrivateTask[];
  onTaskUpdated?: () => void;
}

const COLUMNS = [
  { id: 'pending', title: 'Pendiente', color: 'bg-gray-100 dark:bg-gray-800' },
  {
    id: 'in_progress',
    title: 'En Progreso',
    color: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    id: 'review',
    title: 'En Revisión',
    color: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  {
    id: 'completed',
    title: 'Completado',
    color: 'bg-green-100 dark:bg-green-900/30',
  },
];

export function TaskKanban({ tasks, onTaskUpdated }: TaskKanbanProps) {
  const { user } = useAuth();
  const [draggingTask, setDraggingTask] = useState<string | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggingTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggingTask || !user?.id) return;

    try {
      const res = await fetch(`/api/users/${user.id}/tasks/${draggingTask}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Error al actualizar');

      onTaskUpdated?.();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al mover la tarea');
    } finally {
      setDraggingTask(null);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return;
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/users/${user.id}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Error al eliminar');

      onTaskUpdated?.();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la tarea');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {COLUMNS.map(column => (
        <div
          key={column.id}
          className={`rounded-lg p-4 ${column.color} min-h-[500px]`}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, column.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
            <Badge variant="secondary">
              {getTasksByStatus(column.id).length}
            </Badge>
          </div>

          <div className="space-y-3">
            {getTasksByStatus(column.id).map(task => (
              <Card
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                className="cursor-move hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant={getPriorityVariant(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                    {task.due_date && (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function getPriorityVariant(priority: string): any {
  const variants: Record<string, string> = {
    urgent: 'destructive',
    high: 'default',
    medium: 'secondary',
    low: 'outline',
  };
  return variants[priority] || 'secondary';
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    urgent: 'Urgente',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
  return labels[priority] || priority;
}
