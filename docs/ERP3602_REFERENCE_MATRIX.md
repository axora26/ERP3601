# ERP3602 Reference Matrix

This is the top-level pointer required by the mission brief's documentation
list (Section 61). The actual domain-by-domain matrix, evidence, and
method notes live in `docs/reference/ERP3602_FUNCTIONAL_AUDIT.md` (placed
there per Section 5's explicit instruction) — this file is not duplicated
here to avoid two documents drifting out of sync.

See also `docs/PRODUCT_ARCHITECTURE.md` §"Key architectural patterns worth
carrying forward" for the specific ERP3602 mechanisms (composite
tenant-scoped foreign keys, opaque sessions, append-only audit,
deny-by-default RBAC, provenance-chain link tables) this repository's
Foundation slice reused.
