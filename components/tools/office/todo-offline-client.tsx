"use client";

import { ActionButton, ResetButton } from "@/components/shared/action-buttons";
import InputField from "@/components/shared/form-fields/input-field";
import ToolPageHeader from "@/components/shared/tool-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GlassCard } from "@/components/ui/glass-card";
import { Separator } from "@/components/ui/separator";
import { Check, ClipboardList, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

// Types

type Todo = {
  id: string;
  text: string;
  done: boolean;
  note?: string;
  created: number;
};

// Helpers
function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// Page
export default function TodoOfflineClient() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [note, setNote] = useState("");

  // Local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tools:todo");
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTodos(JSON.parse(saved));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("tools:todo", JSON.stringify(todos));
    } catch {}
  }, [todos]);

  const addTodo = () => {
    if (!input.trim()) return;
    setTodos([
      { id: uid("todo"), text: input.trim(), note: note.trim(), done: false, created: Date.now() },
      ...todos,
    ]);
    setInput("");
    setNote("");
  };

  const toggleTodo = (id: string) => {
    setTodos((ts) => ts.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTodo = (id: string) => setTodos((ts) => ts.filter((t) => t.id !== id));
  const clearAll = () => setTodos([]);

  return (
    <>
      <ToolPageHeader
        icon={ClipboardList}
        title="To-Do (Offline)"
        description="Local, private tasks stored in your browser."
        actions={<ResetButton onClick={clearAll} />}
      />

      {/* Add new task */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">New Task</CardTitle>
          <CardDescription>Quickly add a task with optional notes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <InputField
            label="Task"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What needs to be done?"
          />
          <InputField
            label="Note (optional)"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Extra details"
          />

          <div className="col-span-2">
            <ActionButton variant="default" icon={Plus} label="Add Task" onClick={addTodo} />
          </div>
        </CardContent>
      </GlassCard>

      <Separator />

      {/* List */}
      <GlassCard>
        <CardHeader className="flex items-end justify-between">
          <div>
            <CardTitle className="text-base">Tasks</CardTitle>
            <CardDescription>Check off tasks when complete.</CardDescription>
          </div>

          <Badge variant="secondary" className="self-center">
            {todos.filter((t) => !t.done).length} pending
          </Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {todos.length === 0 && (
            <p className="text-sm text-muted-foreground">No tasks yet. Add one above.</p>
          )}
          {todos.map((t) => (
            <div key={t.id} className="flex flex-col gap-2 rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant={t.done ? "default" : "outline"}
                    className="h-6 w-6"
                    onClick={() => toggleTodo(t.id)}
                  >
                    {t.done && <Check className="h-4 w-4" />}
                  </Button>
                  <span className={t.done ? "line-through text-muted-foreground" : ""}>
                    {t.text}
                  </span>
                </div>
                <ActionButton
                  size="icon"
                  icon={Trash2}
                  variant="destructive"
                  onClick={() => removeTodo(t.id)}
                />
              </div>
              {t.note && <p className="text-xs text-muted-foreground">{t.note}</p>}
            </div>
          ))}
        </CardContent>
      </GlassCard>
    </>
  );
}
