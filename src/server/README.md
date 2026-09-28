# Server infrastructure

This directory is reserved for server-only technical infrastructure. Its child directories establish boundaries for database, authentication, storage, email, background jobs, rate limiting, and logging. They intentionally contain no implementations in the scaffold phase.

Code added here must not be imported into browser bundles and should use `import "server-only"` where appropriate.
