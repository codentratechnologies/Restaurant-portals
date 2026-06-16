# Restaurant Backend

Pure Python backend for the **Dineos Restaurant Portal**.

## Structure

```
restaurant-backend/
├── main.py                  # Entry point
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (create from .env.example)
├── .env.example
│
├── firebase/
│   └── __init__.py          # Firebase Realtime DB initialization
│
├── config/
│   └── README.md            # Place Firebase service account key here
│
├── models/                  # Python dataclasses
│   ├── restaurant.py
│   ├── menu.py
│   └── order.py
│
└── services/                # Firebase CRUD operations
    ├── restaurant_service.py
    ├── menu_service.py
    └── order_service.py
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Firebase credentials
2. Place your Firebase service account JSON key in `config/`
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run:
   ```bash
   python main.py
   ```

## Scope

This backend handles **restaurant-facing** operations:
- 🍽  Menu management (add, update, delete, toggle availability)
- 📦 Order management (create, status updates, daily summary)
- 🏪 Restaurant profile (read, update)

> **Admin operations** (user management, restaurant verification, seeding) are handled by `admin-backend/`.
