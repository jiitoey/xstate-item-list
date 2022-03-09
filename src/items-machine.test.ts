import { interpret } from "xstate";
import { itemsMachine } from "./items-machine";

describe('"fetchItems" on "loading" state', () => {
  test('"onDone", do "updateItems" and  go to "display"', (done) => {
    const expectedItems = {
      totalItems: 5,
      items: [
        {
          artistName: "John Doe",
          id: "01234",
          price: 1.0,
          currency: "ETH",
          end: new Date().toISOString(),
        },
      ],
    };
    const mockFetchMachine = itemsMachine.withConfig({
      services: {
        fetchItems: async (_, event) => expectedItems,
      },
    });
    interpret(mockFetchMachine)
      .onTransition((state) => {
        if (state.matches("display")) {
          try {
            expect(state.context.totalItems).toBe(expectedItems.totalItems);
            expect(state.context.items).toBe(expectedItems.items);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });

  test('"onError", go to "failed"', (done) => {
    const mockFetchMachine = itemsMachine.withConfig({
      services: {
        fetchItems: async (_, event) => {
          throw "This is a forced error!";
        },
      },
    });
    interpret(mockFetchMachine)
      .onTransition((state) => {
        if (state.matches("failed")) {
          try {
            expect(state.context.items.length).toBe(0);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });
});

it('should reach "loading" given "display" when the "ITEMS.SORT_CHANGED" event occurs', () => {
  const expectedValue = "loading";

  const actualState = itemsMachine.transition("display", {
    type: "ITEMS.SORT_CHANGED",
    sortBy: "id",
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
  expect(actualState.context.sortBy).toBe("id");
});

it('should reach "loading" given "display" when the "PAGE.SIZE_CHANGED" event occurs', () => {
  const expectedValue = "loading";

  const actualState = itemsMachine.transition("display", {
    type: "PAGE.SIZE_CHANGED",
    pageSize: 15,
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
  expect(actualState.context.page).toBe(1);
  expect(actualState.context.pageSize).toBe(15);
});

it('should reach "loading" given "display" on "PAGE.PAGE_CHANGED" event, and not in last page', () => {
  const expectedValue = "loading";
  itemsMachine.context.totalItems = 100;
  itemsMachine.context.pageSize = 10;
  const actualState = itemsMachine.transition("display", {
    type: "PAGE.PAGE_CHANGED",
    page: 2,
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
  expect(actualState.context.page).toBe(2);
});

it('should stay at "display" given "display" on "PAGE.PAGE_CHANGED" event, on last page', () => {
  const expectedValue = "display";
  itemsMachine.context.totalItems = 100;
  itemsMachine.context.pageSize = 10;
  itemsMachine.context.page = 10;
  const actualState = itemsMachine.transition("display", {
    type: "PAGE.PAGE_CHANGED",
    page: 11,
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
  expect(actualState.context.page).toBe(10);
});

it('should reach "loading" given "failed" when the "ITEMS.RELOAD" event occurs', () => {
  const expectedValue = "loading";

  const actualState = itemsMachine.transition("failed", {
    type: "ITEMS.RELOAD",
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
});
