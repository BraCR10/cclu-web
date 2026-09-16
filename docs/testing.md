# Testing

Every change that carries a decision carries a unit test for it, written in the
same commit.

## Running

```bash
npm test
```

The runner is Vitest, in a `jsdom` environment so components can be rendered.
The `@/` alias works in tests exactly as it does in the application, which
is how a test reaches the code it covers.

The command exits with a non-zero status when a test fails. Continuous
integration reads that status, not the output, so a runner that printed a
failure and exited zero would let broken code merge.

## What must have unit tests

| Code                                                | Tested           |
| --------------------------------------------------- | ---------------- |
| Logic in `shared/` and in a module's own helpers    | **Yes**          |
| Components that branch, validate, or transform data | **Yes**          |
| Components that only lay out markup they are handed | No               |
| Route files in `app/`                               | No. They compose |
| Styling                                             | No               |

The question to ask is **"does this code make a decision?"** A component that
chooses what to show based on state or props is a decision. A component that
arranges what it was given is not.

## What a unit test is here

A unit test exercises one unit in isolation:

- **No network.** A component that fetches receives its data as props, or the
  fetching function is passed in, so the test supplies it.
- **No dependency on another test**, and no dependency on the order tests run
  in.

This is what makes a unit testable in the first place. A component that fetches,
decides and renders cannot be tested without a server; split it, and each part
becomes testable on its own.

## Querying the way a user does

Testing Library queries reach for what a person perceives, not for how the
component is built:

```tsx
expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
```

Prefer `getByRole` and `getByText`. Avoid reaching for class names or component
internals: those change when the markup is refactored, and a test that breaks on
a refactor with no behaviour change is a test that costs more than it protects.

## Where tests live and how they are named

- Tests live in `tests/`, in a tree that **mirrors `src/`**.
  `src/shared/api/apiUrl.ts` is tested by `tests/shared/api/apiUrl.test.ts`.
- `src/` holds production code only. What ships and what verifies it stay in
  separate trees, so reading `src/` shows the application and nothing else.
- Tests import through the `@/` alias, never through a relative path that walks
  out of the test tree.
- The test name is a sentence describing **the behaviour**:

```ts
it('does not produce a double slash when the base ends with one', ...)
```

Names matter beyond readability. The test report required by OR-002 is built by
reading the suite, so a test named `works correctly` contributes nothing to it.

## What is not worth testing

- Configuration files.
- Markup with no conditions.
- That a library does what the library documents.
