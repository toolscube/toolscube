'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GlassCard, MotionGlassCard } from '@/components/ui/glass-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check, ClipboardList, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// ---------- Types ----------

type Todo = {
  id: string;
  text: string;
  done: boolean;
  note?: string;
  created: number;
};

// ---------- Helpers ----------
function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// ---------- Page ----------
export default function TodoOfflinePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');

  // Local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tools:todo');
      if (saved) setTodos(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tools:todo', JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([{ id: uid('todo'), text: input.trim(), note: note.trim(), done: false, created: Date.now() }, ...todos]);
    setInput('');
    setNote('');
  };

  const toggleTodo = (id: string) => {
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTodo = (id: string) => setTodos((ts) => ts.filter((t) => t.id !== id));
  const clearAll = () => setTodos([]);

  return (
    <div className="space-y-4">
      <MotionGlassCard>
        <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-6">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ClipboardList className="h-6 w-6" /> To-Do (Offline)
            </h1>
            <p className="text-sm text-muted-foreground">Local, private tasks stored in your browser.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={clearAll} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Badge variant="secondary" className="self-center">
              {todos.filter((t) => !t.done).length} pending
            </Badge>
          </div>
        </GlassCard>

        {/* Add new task */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">New Task</CardTitle>
            <CardDescription>Quickly add a task with optional notes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task">Task</Label>
              <Input id="task" value={input} onChange={(e) => setInput(e.target.value)} placeholder="What needs to be done?" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Extra details" />
            </div>
            <div className="col-span-2">
              <Button onClick={addTodo} className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Add Task
              </Button>
            </div>
          </CardContent>
        </GlassCard>

        <Separator />

        {/* List */}
        <GlassCard className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tasks</CardTitle>
            <CardDescription>Check off tasks when complete.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {todos.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet. Add one above.</p>}
            {todos.map((t) => (
              <div key={t.id} className="flex flex-col gap-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant={t.done ? 'default' : 'outline'} className="h-6 w-6" onClick={() => toggleTodo(t.id)}>
                      {t.done && <Check className="h-4 w-4" />}
                    </Button>
                    <span className={t.done ? 'line-through text-muted-foreground' : ''}>{t.text}</span>
                  </div>
                  <Button variant="outline" size="icon" onClick={() => removeTodo(t.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
              </div>
            ))}
          </CardContent>
        </GlassCard>
      </MotionGlassCard>
    </div>
  );
}
