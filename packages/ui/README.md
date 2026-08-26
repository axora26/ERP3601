# @axora/ui (reserved)

Not populated in Wave 1. The app shell components (`NavigationRail`,
`WorkspaceNavigator`, `MainCanvas`, `IntelligenceDrawer`, state components)
live directly in `apps/web/components` for now because `apps/web` is their
only consumer — extracting them into a shared package before a second
consumer (e.g. a future desktop shell) exists would be the kind of
premature abstraction the project's own engineering guidelines warn
against. Promote them here in the wave that actually adds a second
consumer.
