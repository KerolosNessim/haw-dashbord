# Admin Client Portfolio API

Source of truth for requests and sample bodies: [`postman/client_portfolio_module_collection.json`](../postman/client_portfolio_module_collection.json).

## Base

- `{API_ROOT}/api` (e.g. `https://api.example.com/api`)
- Admin: `Authorization: Bearer {token}`, `Accept: application/json`
- Login: `POST /v1/admin/login`

## Envelope

```json
{
  "status": "true",
  "message": "...",
  "data": {},
  "errors": null
}
```

Map `errors` field keys (e.g. `headline.ar`) to form inputs on 422.

## Section (singleton)

| Method | Path |
|--------|------|
| GET | `/v1/admin/client-portfolio/section` |
| PUT | `/v1/admin/client-portfolio/section` |

First GET may be **404** → empty form; PUT upserts.

## Items

| Method | Path |
|--------|------|
| GET | `/v1/admin/client-portfolio` |
| GET | `/v1/admin/client-portfolio/items/{id}` |
| POST | `/v1/admin/client-portfolio/items` (multipart) |
| PUT | `/v1/admin/client-portfolio/items/{id}` (JSON, text-only) |
| POST | `/v1/admin/client-portfolio/items/{id}` + `_method=PUT` (multipart, images) |
| DELETE | `/v1/admin/client-portfolio/items/{id}` |

No **slug** field. Use `full_case_study_link` (`https://…` or `/path`).

`service_ids: []` on update clears service links.

## Dashboard

- Route: `/client-portfolio`
- Permissions: `home-content.view` / `home-content.update`

Public previews (no token): `GET /v1/client-portfolio`, `GET /v1/client-portfolio/{id}`.
