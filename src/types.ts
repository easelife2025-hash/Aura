export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type Task = {
  id: string;
  title: string;
  status: 'pending' | 'completed';
  createdAt: number;
};

export type Habit = {
  id: string;
  title: string;
  streak: number;
  lastCompleted?: number;
  createdAt: number;
};

export type AppState = {
  user: any | null;
  theme: 'dark';
};
