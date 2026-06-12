import { useEffect, useState } from "react";
import { messagesStore } from "./messages";

export function useMessages() {
  const [state, setState] = useState(messagesStore.getState());

  useEffect(() => {
    return messagesStore.subscribe((s) => setState(s));
  }, []);

  return {
    conversations: state.conversations,
    getConversation: messagesStore.getConversation,
    getMessages: messagesStore.getMessages,
    sendMessage: messagesStore.sendMessage,
  };
}
