# Admin access

All new accounts created through `POST /api/auth/register` receive the `user`
role. A role cannot be supplied by the client. Create or promote an admin from
the backend directory using the one-time setup command:

```powershell
$env:ADMIN_NAME = "Store Admin"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "use-a-long-unique-password"
npm run admin:create
Remove-Item Env:ADMIN_NAME, Env:ADMIN_EMAIL, Env:ADMIN_PASSWORD
```

The command creates the account if the email is new; if it already exists, it
promotes that account without changing its password. Keep the admin credentials
private and do not commit them to source control.

## Frontend authentication

Register or log in using the existing `/api/auth/register` and `/api/auth/login`
routes. Both return `token` and a `user` object containing `id`, `name`, `email`,
and `role`. Send the token on protected requests as:

```http
Authorization: Bearer <token>
```

Use `GET /api/auth/me` to retrieve the current account and role after a page
reload. The backend checks the current database role on every protected request;
frontend role checks are for UI only and do not replace API authorization.

## Admin endpoints

All endpoints below require a valid admin token:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/admin/dashboard` | Dashboard counts and paid-order revenue |
| GET | `/api/admin/products?page=1&limit=10` | List products, including unpublished products |
| POST | `/api/products` | Create a product; send multipart form data with `name`, `category`, `price`, `discountedPrice`, and `image`; optional `isPublished` |
| PATCH | `/api/products/:id` | Edit product fields, set `isPublished`, and optionally replace `image` |
| DELETE | `/api/products/:id` | Delete a product |
| GET | `/api/admin/orders?page=1&limit=10` | List orders with customer name and email |
| PATCH | `/api/admin/orders/:id` | Update `orderStatus` and/or `paymentStatus` |
| GET | `/api/admin/users?page=1&limit=10` | List users without password or reset-token fields |

Product publication is controlled with `isPublished: true` or `false`.
Unpublished products are omitted from the public product list and product-by-ID
endpoint. Existing products remain public unless explicitly unpublished.

Allowed order statuses are `pending`, `confirmed`, `processing`, `shipped`,
`delivered`, and `cancelled`. Allowed payment statuses are `pending`, `paid`,
`failed`, and `refunded`.
