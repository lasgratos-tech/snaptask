# SnapTask API — OpenAPI V1 (Minimal)

SnapTask is a **pay-per-task API** for executing single, deterministic AI tasks.
It is **not** a chatbot.
It is **not** a platform.
It is a transactional API.

---

## [Base URL](https://api.snaptaskapp.ai)
(Private access — local testing only for now)


## Access

The API is currently in private preview.
To test SnapTask, request an API key and access details.

## Quick overview

SnapTask is called via a single HTTP endpoint.

A developer sends:
- an API key (Authorization header)
- a task definition (JSON body)

SnapTask then:
- validates the request
- checks pricing and balance
- either executes the task or explicitly refuses it

POST /v1/tasks/execute
|
|-- Headers
|     Authorization: Bearer sk_xxx
|     Content-Type: application/json
|
|-- Body (JSON)
|     taskCode
|     version
|     input
