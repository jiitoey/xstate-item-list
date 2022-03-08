import { inspect } from "@xstate/inspect";
import { interpret } from "xstate";
import { registerActor, sendEvent } from "./actor-registry";
import { itemsMachine } from "./items-machine";
// @ts-ignore
import { Elm } from "./Main.elm";

inspect({
  // options
  // url: 'https://statecharts.io/inspect', // (default)
  iframe: false, // open in new window
});

const elm = Elm.Main.init({
  node: document.querySelector("main"),
  flags: {},
});

const itemsInterpreter = interpret(itemsMachine, {
  devTools: true,
});
registerActor("ITEMS", itemsInterpreter, itemsMachine.events);

itemsInterpreter.onTransition((state) => {
  elm.ports.stateChanged.send(state);
});

elm.ports.event.subscribe((event: any) => {
  sendEvent(event);
});

itemsInterpreter.start();
