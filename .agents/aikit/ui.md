<!-- aikit v0.16.1 - managed file, do not edit -->

# UI

Universal UI rules for any stack that renders an interface, web or native.

## Images

- An image never sits on a blank box while loading or after failing. Give its container a placeholder that fits the context: a background color token (or the image's dominant color when known), an image icon or subtle texture for content images, or a skeleton when the surrounding UI already uses them.
- Reserve the space (fixed dimensions or aspect ratio) so the layout doesn't shift when the image lands.
- Prefer the stack's dedicated image component with placeholder support (e.g. `expo-image` with a blurhash/thumbhash `placeholder` and a short `transition`) over a bare image tag.
