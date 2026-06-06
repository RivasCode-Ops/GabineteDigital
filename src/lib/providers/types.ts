export interface MessagePayload {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface MessageProvider {
  name: string;
  send(payload: MessagePayload): Promise<{ success: boolean; error?: string }>;
}
