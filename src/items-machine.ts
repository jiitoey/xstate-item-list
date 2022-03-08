import { assign, createMachine } from "xstate";

interface Context {
  pageSize: number;
  page: number;
  sortBy: string;
  totalItems: number;
  items: {
    artistName: string;
    id: string;
    price: number;
    currency: string;
    end: string;
  }[];
}
const mockFetchItemsResult = async (
  sortBy: string,
  skip: number,
  limit: number
) => {
  const totalItems = 100;
  const nList = [...Array(100).keys()];
  const endDate = new Date();
  console.log("skip: ", skip, "limit: ", limit);
  const items = nList.slice(skip, skip + limit).map((n) => {
    return {
      artistName: `${sortBy}-${n}`,
      id: `${n}`,
      price: 12.3,
      currency: "ETH",
      end: endDate.toISOString(),
    };
  });
  return { totalItems, items };
};

const canChangePage = (context: Context, event) => {
  const lastPage = Math.ceil(context.totalItems / context.pageSize);
  return event.page <= lastPage && event.page > 0;
};

const cannotChangePage = (context: Context, event) => {
  const lastPage = Math.ceil(context.totalItems / context.pageSize);
  return event.page > lastPage && event.page == 0;
};

export const itemsMachine = createMachine(
  {
    tsTypes: {} as import("./items-machine.typegen").Typegen0,
    id: "ITEMS",
    schema: {
      context: {} as Context,
      events: {} as
        | { type: "ITEMS.SORT_CHANGED"; sortBy: string }
        | { type: "PAGE.SIZE_CHANGED"; pageSize: number }
        | { type: "PAGE.PAGE_CHANGED"; page: number }
        | { type: "ITEMS.RELOAD" },
      services: {} as {
        fetchItems: {
          data: {
            totalItems: number;
            items: {
              artistName: string;
              id: string;
              price: number;
              currency: string;
              end: string;
            }[];
          };
        };
      },
    },
    context: {
      pageSize: 15,
      page: 1,
      sortBy: "artistName",
      totalItems: 0,
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
            target: "loading",
            actions: "updatePageSize",
          },
          "PAGE.PAGE_CHANGED": [
            {
              target: "loading",
              cond: canChangePage,
              actions: "updatePage",
            },
            {
              target: "display",
              cond: cannotChangePage,
            },
          ],
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
        const skip = context.pageSize * (context.page - 1);
        const limit = context.pageSize;
        // const response = await fetch(
        //   `https://www.bgf.com/?sortby=${context.sortBy}&skip=${skip}&limit=${limit}`
        // );
        // const json = await response.json();
        const json = await mockFetchItemsResult(context.sortBy, skip, limit);
        console.log("json", json);
        return json;
      },
    },
    actions: {
      updateItems: assign((context, event) => {
        return {
          ...context,
          items: event.data.items,
          totalItems: event.data.totalItems,
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
