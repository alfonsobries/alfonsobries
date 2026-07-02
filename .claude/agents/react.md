# React

- One exported component per file; small private sub-components may share it
- Component files are PascalCase matching the export (`UserCard.tsx`); hooks/utils are kebab-case (`use-debounce.ts`)
- Name the props type after the component with a `Properties` suffix (`ButtonProperties`). When wrapping a host element, extend its props (`React.ComponentPropsWithoutRef<'button'> & { … }`)
- Callback props are `onX` (`onChange`); internal handlers are `handleX` (`handleSubmit`)
- Rendering stays pure — derive JSX from props/state; side effects live in handlers or effects
- One source of truth per piece of state — don't copy props into state
- Reach for context only for genuinely cross-cutting state
