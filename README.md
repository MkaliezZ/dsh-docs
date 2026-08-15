# dsh-docs

Version-aware documentation query and excerpt-bounding primitives for DSH.

v0.1 deliberately does **not** hard-code a web provider: the host supplies `lookup` and version resolution. This keeps the plugin provider-neutral while preventing unbounded documentation dumps into model context.
