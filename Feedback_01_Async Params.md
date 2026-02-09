# Refactoring Task: Async Params Update for Next.js 15+

## Context
The current codebase uses synchronous access to `params` in dynamic routes (e.g., `params.runId`).
In Next.js 15+, `params` is now a **Promise**. Accessing it synchronously will lead to runtime warnings and eventual breakage.
We need to refactor all Page components in dynamic routes to await `params` before accessing its properties.

## Instructions
1.  **Update Component Signature**: Change the component to be `async`.
2.  **Update Type Definition**: Change the type of `params` from `{ runId: string }` to `Promise<{ runId: string }>`.
3.  **Await Params**: Destructure `runId` from `await params` at the beginning of the component.
4.  **Preserve Logic**: Keep the existing UI structure and "Stub" messages exactly as they are.

## Target Files
The following files have been identified as requiring updates:

1.  `src/app/app/pay/[runId]/page.tsx`
2.  `src/app/app/run/[runId]/log/page.tsx`
3.  `src/app/app/run/[runId]/page.tsx`

## Code Pattern Example

### ❌ Before (Current)
```tsx
export default function Page({ params }: { params: { runId: string } }) {
  return (
    <div>
      <p>Run ID: {params.runId}</p>
    </div>
  );
}