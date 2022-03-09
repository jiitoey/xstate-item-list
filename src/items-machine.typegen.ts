// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true;
  eventsCausingActions: {
    updateItems: "done.invoke.fetch-items";
    updatePageSize: "PAGE.SIZE_CHANGED";
    updatePage: "PAGE.PAGE_CHANGED";
    updateItemsSize: "ITEMS.SIZE_CHANGED";
    updateSortBy: "ITEMS.SORT_CHANGED";
  };
  internalEvents: {
    "done.invoke.fetch-items": {
      type: "done.invoke.fetch-items";
      data: unknown;
      __tip: "See the XState TS docs to learn how to strongly type this.";
    };
    "xstate.init": { type: "xstate.init" };
    "error.platform.fetch-items": {
      type: "error.platform.fetch-items";
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    fetchItems: "done.invoke.fetch-items";
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    fetchItems:
      | "PAGE.SIZE_CHANGED"
      | "PAGE.PAGE_CHANGED"
      | "ITEMS.SORT_CHANGED"
      | "ITEMS.RELOAD";
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: "loading" | "display" | "failed";
  tags: never;
}
