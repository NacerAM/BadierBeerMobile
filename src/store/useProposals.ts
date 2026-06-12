import { useEffect, useState } from "react";
import { proposalsStore } from "./proposals";

export function useProposals() {
  const [state, setState] = useState(proposalsStore.getState());

  useEffect(() => {
    return proposalsStore.subscribe((s) => setState(s));
  }, []);

  return {
    proposals: state.proposals,
    addProposal: proposalsStore.addProposal,
  };
}
