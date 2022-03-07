import { assign, createMachine } from "xstate";

export const itemsMachine = createMachine(
  {
    tsTypes: {} as import("./items.typegen").Typegen0,
    id: "ITEMS",
    schema: {
      context: {} as {
        pageSize: number;
        page: number;
        sortBy: string;
        items: {
          artistName: string;
          id: string;
          price: number;
          currency: string;
          end: Date;
        }[];
      },
      events: {} as
        | { type: "ITEMS.SORT_CHANGED"; sortBy: string }
        | { type: "PAGE.SIZE_CHANGED"; pageSize: number }
        | { type: "PAGE.PAGE_CHANGED"; page: number }
        | { type: "ITEMS.RELOAD" },
      services: {} as {
        fetchItems: {
          data: {
            artistName: string;
            id: string;
            price: number;
            currency: string;
            end: Date;
          }[];
        };
      },
    },
    context: {
      pageSize: 15,
      page: 1,
      sortBy: "artistName",
      items: [],
    },
    states: {
      loading: {
        invoke: {
          id: "fetch-items",
          src: "fetchItems",
          onDone: {
            target: "display",
            actions: "updateItems",
          },
          onError: { target: "failed" },
        },
      },
      display: {
        on: {
          "PAGE.SIZE_CHANGED": {
            target: "display",
            actions: "updatePageSize",
          },
          "PAGE.PAGE_CHANGED": {
            target: "display",
            actions: "updatePage",
          },
          "ITEMS.SORT_CHANGED": {
            target: "loading",
            actions: "updateSortBy",
          },
        },
      },
      failed: {
        on: {
          "ITEMS.RELOAD": {
            target: "loading",
          },
        },
      },
    },
    initial: "loading",
  },
  {
    services: {
      fetchItems: async (context) => {
        const response = await fetch(`https://www.bgf.com/${context.sortBy}`);
        const json = await response.json();
        return json;
      },
    },
    actions: {
      updateItems: assign((context, event) => {
        return {
          ...context,
          items: event.data,
        };
      }),
      updatePageSize: assign((context, event) => {
        return {
          ...context,
          pageSize: event.pageSize,
        };
      }),
      updatePage: assign((context, event) => {
        return {
          ...context,
          page: event.page,
        };
      }),
      updateSortBy: assign((context, event) => {
        return {
          ...context,
          sortBy: event.sortBy,
        };
      }),
    },
  }
);
