# Cross-Stack Consistency Checklist: Brewnet 5-Stack Implementation

**Purpose**: 5개 스택(Node, Python, Go, Rust, Java) 간 요구사항 일관성, 완전성, 명확성 검증
**Created**: 2026-02-28
**Feature**: [spec.md](../spec.md) | [plan.md](../plan.md) | [api-spec.md](../contracts/api-spec.md)
**Depth**: Standard (PR Reviewer)
**Actor**: PR 리뷰어가 요구사항 품질을 확인하는 용도

## Requirement Completeness — API Contract

- [ ] CHK001 Are the 4 required endpoints (/, /health, /api/hello, /api/echo) explicitly listed for ALL 5 stacks in the spec? [Completeness, Spec §FR-002]
- [ ] CHK002 Is the `db_connected` field requirement for `/health` response specified with the exact boolean type and source (actual DB ping vs. static)? [Clarity, Spec §FR-003]
- [ ] CHK003 Are the exact `service` field values (e.g., "go-backend", "node-backend") enumerated for all 5 stacks? [Completeness, Contract §GET /]
- [ ] CHK004 Is the `message` field format for `/api/hello` specified with exact casing for each stack name (e.g., "Hello from Go!" vs "Hello from GO!")? [Clarity, Contract §GET /api/hello]
- [ ] CHK005 Are the runtime version sources documented for each stack (`runtime.Version()`, `process.version`, etc.)? [Completeness, Contract §GET /api/hello]
- [ ] CHK006 Is the empty body behavior for `POST /api/echo` consistently defined as returning `{}` across all stacks? [Consistency, Contract §POST /api/echo]
- [ ] CHK007 Are error response requirements (404, 405, 500) defined consistently, or is "framework default" sufficiently specific? [Clarity, Contract §Error Responses]

## Requirement Completeness — Docker & Infrastructure

- [ ] CHK008 Are multi-stage build stage names (builder → runner) consistently required, or is just "multi-stage" sufficient? [Clarity, Spec §FR-012]
- [ ] CHK009 Is the non-root user name requirement consistent — must it be `appuser` or can it be language-specific (e.g., `node`, `www-data`)? [Ambiguity, Spec §FR-013]
- [ ] CHK010 Are HEALTHCHECK parameters (interval, timeout, retries, start_period) specified uniformly, or are stack-specific variations documented? [Gap, Spec §FR-014]
- [ ] CHK011 Are resource limit values (memory, CPU) specified per service role, or is variation between stacks acceptable? [Gap, Spec §FR-016]
- [ ] CHK012 Are Docker label requirements (`com.brewnet.stack`, `com.brewnet.role`) specified with exact allowed values for 5 stacks? [Completeness, TRD §2.3]
- [ ] CHK013 Is the `.dockerignore` content pattern specified, or is "must exist" sufficient? [Clarity, Spec §FR-017]

## Requirement Consistency — Environment Variables

- [ ] CHK014 Are the mandatory environment variables for all 3 DB drivers (postgres, mysql, sqlite3) consistently listed across PRD, TRD, and .env.example? [Consistency, PRD §5.2]
- [ ] CHK015 Is the `DB_DRIVER` allowed values set consistently documented as exactly `postgres | mysql | sqlite3` in all references? [Consistency, Constitution §III]
- [ ] CHK016 Are stack-specific environment variables (e.g., Node's `PRISMA_DB_PROVIDER`, Java's `SPRING_PROFILES_ACTIVE`) documented as exceptions to the common set? [Completeness, Gap]
- [ ] CHK017 Is it clearly specified which env vars are required vs optional, and what happens when optional ones are missing? [Clarity, Gap]

## Requirement Consistency — Makefile & Workflow

- [ ] CHK018 Are all 8 Makefile targets (dev, build, up, down, logs, test, clean, validate) specified with exact behavior descriptions? [Completeness, Spec §FR-006]
- [ ] CHK019 Is the `test` target's stack-specific test command documented for each stack (e.g., `npm test`, `pytest`, `go test ./...`)? [Completeness, Gap]
- [ ] CHK020 Is the `validate` target's path to `shared/scripts/validate.sh` relative path requirement (e.g., `../../shared/scripts/validate.sh`) specified? [Clarity, TRD §2.4]
- [ ] CHK021 Is the DB_DRIVER→COMPOSE_PROFILES auto-selection logic specified uniformly (sqlite3 = no profile, others = profile name)? [Consistency, TRD §2.4]

## Requirement Consistency — Frontend

- [ ] CHK022 Is the requirement for "identical frontend copy" precise enough — does it mean byte-identical or functionally equivalent? [Clarity, Constitution §II]
- [ ] CHK023 Are nginx reverse proxy requirements (`/api/` and `/health` to backend:8080) specified consistently for all stacks? [Consistency, TRD §4.3]
- [ ] CHK024 Is the Vite dev proxy configuration requirement documented alongside the nginx prod config? [Completeness, Gap]

## Requirement Consistency — Docker Compose

- [ ] CHK025 Are the docker-compose network names (`brewnet`, `brewnet-internal`) and their properties (`internal: true`) specified consistently? [Consistency, Spec §FR-015]
- [ ] CHK026 Is the `depends_on.required: false` pattern for DB services documented as mandatory for all stacks? [Completeness, TRD §2.3]
- [ ] CHK027 Are host port mappings (PostgreSQL→5433, MySQL→3307) consistently specified across PRD port conventions and TRD compose template? [Consistency, PRD §5.5]
- [ ] CHK028 Are volume names (pg-data, mysql-data, sqlite-data) required to be identical across all stacks? [Consistency, Gap]

## Requirement Consistency — README Structure

- [ ] CHK029 Are the mandatory README sections (Quick Start, API Endpoints, DB Switching, Project Structure, Makefile Targets, Validation) specified with exact section names? [Clarity, Spec §FR-018]
- [ ] CHK030 Is the bilingual requirement (English + Korean annotations) specific enough about which parts are English vs Korean? [Clarity, Spec §FR-019]

## Scenario Coverage

- [ ] CHK031 Are acceptance scenarios for DB switching (postgres→mysql→sqlite3) defined for all 5 stacks, not just the MVP (Node)? [Coverage, Spec §US1-US5]
- [ ] CHK032 Is the behavior specified when `DB_DRIVER` has an invalid value for each stack's error handling approach? [Edge Case, Spec §Edge Cases]
- [ ] CHK033 Are graceful degradation requirements specified when DB is unreachable but the server should still start? [Gap, Edge Case]
- [ ] CHK034 Is the behavior defined when `make validate` runs before services are fully healthy? [Coverage, Gap]
- [ ] CHK035 Are requirements specified for what happens when the frontend can't reach the backend (`/api/hello` fails)? [Coverage, Gap]

## Cross-Document Consistency

- [ ] CHK036 Do the stack counts match across all documents (spec, plan, research, tasks, constitution, CI workflow) after .NET removal? [Consistency]
- [ ] CHK037 Does the CI matrix (5 stacks × 3 DBs = 15 jobs) match across TRD §6.1, tasks.md, and validate-stacks.yml? [Consistency]
- [ ] CHK038 Are the technology versions (Go 1.22+, Rust 1.75+, etc.) consistent across PRD, TRD, CLAUDE.md, and constitution.md? [Consistency]
- [ ] CHK039 Are the Docker base images consistent between TRD stack sections and CLAUDE.md Stack-Specific Tech table? [Consistency]
- [ ] CHK040 Is the license (MIT) consistently referenced across all document headers/footers? [Consistency]

## Notes

- Check items off as completed: `[x]`
- [Spec §X] references spec.md sections; [Contract §X] references contracts/api-spec.md
- [Gap] indicates requirement is missing entirely
- [Ambiguity] indicates requirement exists but is unclear
- [Consistency] indicates potential conflict between documents
- After completing this checklist, update failing items with specific findings and file locations
