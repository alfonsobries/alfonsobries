# Chroma-key background

This paragraph is appended to every illustrator generation. The magenta is
keyed out afterwards by `IllustrationProcessor::chromaKeyToTransparent()`, so
the final image ships with a transparent background. Keep it written as
generation-ready prose.

Background: fill the ENTIRE background with a single solid, flat, uniform pure
magenta #FF00FF (RGB 255, 0, 255) — a perfectly even chroma key, edge to edge,
with no gradient, texture, shadow, vignette or any other element. This magenta
is a technical chroma key that gets removed automatically afterwards, so it is
ALWAYS the background no matter what else is asked: if the instruction or a
reference image suggests a white, paper, transparent, removed or "no"
background, that refers to THIS magenta chroma — still paint solid magenta
edge to edge, never leave any area transparent, and never copy the background
from a reference image. The artwork sits on top of this magenta and must be
fully filled and opaque — every part keeps its solid fills, including white
areas (paper-white faces and skin, white garments), which must be real opaque
white. Never use magenta, pink or purple anywhere inside the artwork — magenta
is reserved exclusively for the background.
