export type MessageRole = "user" | "assistant";

export type FormType = "crush" | "contact" | null;

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  /** Structured form signal from the backend; undefined = fall back to text detection */
  form?: FormType;
}

export interface MenuOption {
  label: string;
  message: string;
}
