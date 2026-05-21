export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

export type AppState = {
  user: any | null;
  theme: 'dark';
};
