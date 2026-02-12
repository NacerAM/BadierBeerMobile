export type Message = {
  id: string;
  conversationId: string;
  from: "user" | "admin";
  text: string;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string; // ex: "Administrateur"
};

type MessagesState = {
  conversations: Conversation[];
  messages: Message[];
};

let state: MessagesState = {
  conversations: [{ id: "admin", title: "Administrateur" }],
  messages: [
    {
      id: "m1",
      conversationId: "admin",
      from: "admin",
      text: "Bonjour ! Comment puis-je vous aider ?",
      createdAt: Date.now() - 1000 * 60 * 60,
    },
  ],
};

let listeners: Array<(s: MessagesState) => void> = [];

function notify() {
  listeners.forEach((l) => l(state));
}

export const messagesStore = {
  getState() {
    return state;
  },

  subscribe(listener: (s: MessagesState) => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  getConversation(id: string) {
    return state.conversations.find((c) => c.id === id) || null;
  },

  getMessages(conversationId: string) {
    return state.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  },

  sendMessage(conversationId: string, text: string) {
    const msg: Message = {
      id: "m" + Math.random().toString(16).slice(2),
      conversationId,
      from: "user",
      text,
      createdAt: Date.now(),
    };

    state = { ...state, messages: [...state.messages, msg] };
    notify();

    // Réponse auto admin (mock) après 800ms
    setTimeout(() => {
      const reply: Message = {
        id: "m" + Math.random().toString(16).slice(2),
        conversationId,
        from: "admin",
        text: "Merci ! Votre message a bien été reçu ✅",
        createdAt: Date.now(),
      };
      state = { ...state, messages: [...state.messages, reply] };
      notify();
    }, 800);
  },
};
