import { applyMutation } from "./taskMutations.js";
/**
 * Rejoue une suite d'événements pour reconstruire
 * l'état final d'une Task (déterministe)
 */
export function replayTask(initial, events) {
    return events.reduce((current, event) => {
        return applyMutation(current, event.mutation);
    }, initial);
}
