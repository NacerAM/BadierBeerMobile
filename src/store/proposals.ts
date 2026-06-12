export type ProposalStatus = "EN_ATTENTE" | "VALIDE" | "REJETE";

export type Proposal = {
  id: string;
  name: string;
  brand: string;
  description: string;
  createdAt: number;
  status: ProposalStatus;
  rejectReason?: string;
};

type ProposalsState = {
  proposals: Proposal[];
};

let state: ProposalsState = {
  proposals: [
    {
      id: "p1",
      name: "Verre Test",
      brand: "Fabricant Test",
      description: "Proposition exemple.",
      createdAt: Date.now() - 1000 * 60 * 60 * 24,
      status: "EN_ATTENTE",
    },
  ],
};

let listeners: Array<(s: ProposalsState) => void> = [];

function notify() {
  listeners.forEach((l) => l(state));
}

export const proposalsStore = {
  getState() {
    return state;
  },

  subscribe(listener: (s: ProposalsState) => void) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },

  addProposal(input: Omit<Proposal, "id" | "createdAt" | "status">) {
    const proposal: Proposal = {
      id: "p" + Math.random().toString(16).slice(2),
      createdAt: Date.now(),
      status: "EN_ATTENTE",
      ...input,
    };
    state = { proposals: [proposal, ...state.proposals] };
    notify();
  },
};
