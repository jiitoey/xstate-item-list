import type { ActorRefFrom, AnyStateMachine } from "xstate";
const registry = new Map<string, ActorRefFrom<AnyStateMachine>>();
const eventListeners = new Map<string, ActorRefFrom<AnyStateMachine>[]>();

/**
 * Register actor to retrieve it later using the given ID.
 * @param actorRef ActorRef
 * @param id string
 * @param events string[]
 * @returns AnyInterpreter
 */
export function registerActor(
  id: string,
  actorRef: ActorRefFrom<AnyStateMachine>,
  events: string[]
): ActorRefFrom<AnyStateMachine> {
  registry.set(id, actorRef);
  events.forEach((event) => {
    const actors = eventListeners.get(event) || [];
    eventListeners.set(event, [...actors, actorRef]);
  });
  return actorRef;
}

export function getActor(id: string): ActorRefFrom<AnyStateMachine> {
  return registry.get(id);
}

export function sendEvent(event: any) {
  const actors = eventListeners.get(event.type) || [];
  actors.forEach((actor) => {
    actor.send(event);
  });
}
