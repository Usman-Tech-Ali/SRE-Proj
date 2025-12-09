This is a minimal React frontend for the reengineered SG Technologies POS system.

It assumes the Django backend is running on `http://localhost:8000` and exposes
its REST API under `/api/` as configured in `webapp/pos_backend/urls.py`.

Key commands:

1. Install dependencies:

```bash
cd webapp/frontend
npm install
```

2. Start the Vite dev server:

```bash
npm run dev
```

By default Vite runs on `http://localhost:5173`.

3. Open the frontend in your browser:

```text
http://localhost:5173
```

The frontend currently:

- Fetches and displays the list of products from `GET /api/products/`.
- Provides a basic skeleton for extending into full cashier/admin views
  (product management, billing, rentals, returns, and reports).


