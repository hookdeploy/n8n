# n8n-nodes-hookdeploy

**Verified by n8n** — available on n8n Cloud and all self-hosted instances.

[n8n](https://n8n.io) community node for [HookDeploy](https://hookdeploy.dev) — webhook capture, inspection, routing, and private tunnel infrastructure. Use it in workflows to manage endpoints, inspect captured webhook requests, replay traffic, and administer organization members.

## Installation

### Option 1: n8n nodes panel (recommended)

On **n8n Cloud** or any **self-hosted** instance:

1. Open the node picker in the workflow editor.
2. Search for **HookDeploy**.
3. Install with one click — verified nodes are available to all users.

### Option 2: Community Nodes (self-hosted manual install)

For self-hosted instances that prefer manual installation, open **Settings → Community Nodes**, choose **Install**, and enter:

```
n8n-nodes-hookdeploy
```

Alternatively, install from the command line in your n8n environment:

```bash
npm install n8n-nodes-hookdeploy
```

Restart n8n after installation if the node does not appear immediately.

## Credentials

1. Sign in to the [HookDeploy dashboard](https://hookdeploy.dev).
2. Open **Settings → API Keys** (or your organization’s API key management page).
3. Create an API key with the permissions you need.
4. In n8n, add a **HookDeploy API** credential and paste the key (format: `hd_live_xxxx`).
5. Use **Test** to confirm the key — a successful test calls `GET /v1/me` and returns your organization details.

## Supported operations

| Resource | Operation | Description |
| --- | --- | --- |
| **Endpoint** | Create | Create a new webhook endpoint |
| **Endpoint** | List Endpoints | List all endpoints |
| **Endpoint** | Pause | Pause an endpoint by ID |
| **Endpoint** | Resume | Resume a paused endpoint by ID |
| **Request** | List Requests | List captured requests for an endpoint (supports `limit` and `before` cursor) |
| **Request** | Get | Get a single captured request |
| **Request** | Replay | Replay a captured request to a target URL |
| **Member** | Invite | Invite a member by email and role |
| **Member** | Deactivate | Deactivate a member by email |
| **Member** | Reactivate | Reactivate a member by email |

Member roles: `super_admin`, `admin`, `developer`, `viewer`, `finance`.

## Trigger events

Use the **HookDeploy Trigger** node and choose an **Event** plus **Endpoint ID**:

| Event | Webhook payload `event` | Description |
| --- | --- | --- |
| **New Webhook Received** | `request.received` | A webhook was captured on the endpoint |
| **Forwarding Succeeded** | `forwarding.succeeded` | HookDeploy successfully forwarded a webhook to a destination |
| **Forwarding Failed** | `forwarding.failed` | HookDeploy failed to forward a webhook to a destination |

## Development

```bash
npm install --legacy-peer-deps
npm run build
npm run lint
npm run dev
```

`npm run dev` starts a local n8n instance at [http://localhost:5678](http://localhost:5678) with this node loaded.

## Links

- [HookDeploy](https://hookdeploy.dev)
- [HookDeploy API](https://api.hookdeploy.dev/v1)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE) — Copyright SnapStack Technologies Inc.
