import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useChat } from "./useChat";

afterEach(() => vi.unstubAllGlobals());

it("prevents overlapping requests and aborts the active request on unmount", async () => {
  let requestSignal: AbortSignal | null | undefined;
  const fetch = vi.fn(
    (_url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
      requestSignal = options?.signal;
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      });
    },
  );
  vi.stubGlobal("fetch", fetch);
  const { result, unmount } = renderHook(useChat);
  let pending: Promise<void>;
  act(() => {
    pending = result.current.ask("Germany");
    void result.current.ask("Italy");
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(result.current.turns).toHaveLength(1);
  expect(result.current.busy).toBe(true);
  unmount();
  expect(requestSignal?.aborted).toBe(true);
  await pending!;
});
