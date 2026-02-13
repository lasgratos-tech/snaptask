# SNAPTASK V4 — API CONTRACT

## 1) Base Namespace

All V4 endpoints are under `/v4`.

---

## 2) Error Model

All error responses use one of the following payloads:

```
{
  "error": "STRING_CODE"
}
```

or

```
{
  "error": "STRING_CODE",
  "message": "string"
}
```

No error taxonomy is implied beyond the `error` string.

---

## 3) Core Schemas

### 3.1 Money
```
{
  "amount": "integer",
  "currency": "string (ISO-4217)"
}
```

### 3.2 Locale
```
{
  "code": "EN | FR | NO | ES | AR",
  "direction": "LTR | RTL"
}
```

### 3.3 TaskDescriptor
```
{
  "taskId": "string",
  "version": "string",
  "category": "DOCUMENT | PROOF | ANALYSIS | TRANSFORMATION",
  "title": "string",
  "description": "string",
  "locale": "Locale",
  "price": "Money",
  "outputFormat": "string",
  "inputSchema": "object (bounded, immutable)"
}
```

### 3.4 TaskExecution
```
{
  "executionId": "string",
  "taskId": "string",
  "version": "string",
  "locale": "Locale",
  "status": "PENDING | RUNNING | COMPLETED | FAILED",
  "createdAt": "string (timestamp)",
  "completedAt": "string (timestamp, optional)",
  "outputRef": "string (optional)"
}
```

### 3.5 ExecutionReceipt
```
{
  "receiptId": "string",
  "executionId": "string",
  "taskId": "string",
  "version": "string",
  "status": "DELIVERED | FAILED",
  "issuedAt": "string (timestamp)",
  "outputRef": "string (optional)"
}
```

---

## 4) Endpoints

### 4.1 Catalogue

**GET** `/v4/catalogue`

Response:
```
{
  "version": "string",
  "tasks": [ TaskDescriptor ]
}
```

---

### 4.2 Task Definition

**GET** `/v4/tasks/{taskId}/versions/{version}`

Response:
```
TaskDescriptor
```

---

### 4.3 Multi-Task Execution

**POST** `/v4/executions`

Request:
```
{
  "locale": "Locale",
  "currency": "string (ISO-4217)",
  "tasks": [
    {
      "taskId": "string",
      "version": "string",
      "input": "object"
    }
  ]
}
```

Response:
```
{
  "executionRequestId": "string",
  "status": "PENDING | RUNNING | COMPLETED | FAILED"
}
```

**GET** `/v4/executions/{executionRequestId}`

Response:
```
{
  "executionRequestId": "string",
  "status": "PENDING | RUNNING | COMPLETED | FAILED",
  "taskResults": [
    {
      "taskId": "string",
      "version": "string",
      "status": "DELIVERED | FAILED",
      "outputRef": "string (optional)",
      "receiptRef": "string (optional)"
    }
  ]
}
```

---

### 4.4 Payment Boundary

Payment is an explicit boundary and is separate from execution creation.

**POST** `/v4/payments/authorize`

Request:
```
{
  "executionRequestId": "string",
  "amount": "Money"
}
```

Response:
```
{
  "paymentRef": "string",
  "status": "AUTHORIZED | FAILED"
}
```

**GET** `/v4/payments/{paymentRef}`

Response:
```
{
  "paymentRef": "string",
  "status": "AUTHORIZED | FAILED | SETTLED",
  "executionRequestId": "string"
}
```

Execution is permitted only for an `executionRequestId` with an `AUTHORIZED` payment status.

---

### 4.5 Receipts

**GET** `/v4/receipts/{receiptRef}`

Response:
```
ExecutionReceipt
```

**GET** `/v4/receipts/{receiptRef}/download`

Response:
```
Binary receipt document
```

---

## 5) Multi-Task Execution Semantics

- A multi-task request contains multiple task entries, each executed independently under one `executionRequestId`.
- Each task produces its own `TaskResult` and `ExecutionReceipt`.
- Failure of one task does not imply failure of the entire request; the overall status reflects the aggregate of task results.
