import { interpret } from "xstate";
import { itemsMachine } from "./items-machine";

describe('"fetchItems" on "loading" state', () => {
  it('"onDone", do "updateItems" and  go to "display"', (done) => {
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
            expect(state.context.items).toBe(expectedItems);
            done();
          } catch (e) {
            done(e);
          }
        }
      })
      .start();
  });

  it('"onError", go to "failed"', (done) => {
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

it('should stay at "display" given "display" when the "PAGE.SIZE_CHANGED" event occurs', () => {
  const expectedValue = "display";

  const actualState = itemsMachine.transition("display", {
    type: "PAGE.SIZE_CHANGED",
    pageSize: 15,
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
  expect(actualState.context.pageSize).toBe(15);
});

it('should stay at "display" given "display" when the "PAGE.PAGE_CHANGED" event occurs', () => {
  const expectedValue = "display";

  const actualState = itemsMachine.transition("display", {
    type: "PAGE.PAGE_CHANGED",
    page: 2,
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
  expect(actualState.context.page).toBe(2);
});

it('should reach "loading" given "failed" when the "ITEMS.RELOAD" event occurs', () => {
  const expectedValue = "loading";

  const actualState = itemsMachine.transition("failed", {
    type: "ITEMS.RELOAD",
  });

  expect(actualState.matches(expectedValue)).toBeTruthy();
});
