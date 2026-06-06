import { MessageProvider, MessagePayload } from "./types";
import { emailProvider } from "./email";

const providers: Record<string, MessageProvider> = {
  email: emailProvider,
};

export function getProvider(channel: string): MessageProvider | undefined {
  return providers[channel];
}

export function registerProvider(channel: string, provider: MessageProvider) {
  providers[channel] = provider;
}

export { type MessageProvider, type MessagePayload } from "./types";
