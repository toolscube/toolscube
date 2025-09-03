type Timer = {
  id: string;
  label: string;
  mode: Mode;
  running: boolean;
  createdAt: number;

  // Countdown & Pomodoro
  durationMs?: number; // original for countdown
  remainingMs?: number; // dynamic remaining

  // Event
  targetTs?: number;

  // Pomodoro
  workMs?: number;
  breakMs?: number;
  cycles?: number;
  phase?: 'work' | 'break' | 'done';
  currentCycle?: number; // 1-based
};
