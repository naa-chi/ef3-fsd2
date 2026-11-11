
<div align="center">

# 🦖 DinoBox

**A beautifully chaotic delivery simulation.**

Browse products · Track packages through unpredictable journeys · Experience the thrill of modern logistics.

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.1.2-6DB33F?logo=springboot&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-007396?logo=openjdk&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?logo=mysql&logoColor=white)
![Tests](https://img.shields.io/badge/tests-57%20backend%20%2B%20frontend-brightgreen)

</div>

---

## ✨ What is this?

DinoBox is a full-stack **delivery simulation** where users can:

- 🛍️ **Shop** — browse ~120 seeded products across 7 categories
- 🛒 **Checkout** — cart, delivery address, simulated balance deduction
- 📦 **Track** — every order runs through a live state machine (`PENDING → EN_ROUTE → ARRIVED | LOST | WE_HAVE_NO_IDEA`) with random timings persisted in `localStorage`
- 💰 **Top up / Refund** — Robux-style balance, auto-refunded on lost packages
- 🌍 **Multi-language** — 12 languages with auto-detection (`navigator.language`)
- 🎨 **Theme** — late-2000s Web 2.0 light/dark toggle

> ⚠️ This is a **simulation**. No real payments, no real delivery, no real tracking. All money is fake CLP.

---

## 🧱 Tech Stack

| Layer     | Stack                                                                      |
| --------- | -------------------------------------------------------------------------- |
| **Backend**   | Spring Boot 4 · Java 21 · Spring Data JPA · Hibernate 7 · MySQL 8 · Lombok · SpringDoc OpenAPI |
| **Frontend**  | React 18 · Vite 5 · React Router 6 · Framer Motion · Tailwind CSS 3 · Axios · Vitest |
| **Database**  | MySQL 8 (`DinoRawrX3` schema, auto-created on first boot)                  |
| **Tests**     | JUnit 5 + Mockito (backend, 57 tests) · Vitest + Testing Library (frontend) |

---

## 🗂️ Project Structure

```
ef3-fsd2/
├── Backend/
│   └── package/                          # Spring Boot app (Maven)
│       ├── src/main/java/com/example/demo/
│       │   ├── PackageApplication.java   # main class
│       │   ├── config/
│       │   │   └── OpenApiConfig.java    # Swagger/OpenAPI metadata
│       │   ├── orders/                   # Order entity, receipt generation, refunds
│       │   │   ├── controller/  model/  repository/  service/
│       │   ├── packages/                 # Package entity, travel history, tracking codes
│       │   │   ├── controller/  model/  repository/  service/
│       │   └── products/                 # Product catalogue CRUD
│       │       ├── controller/  model/  repository/  service/
│       ├── src/main/resources/
│       │   └── application.properties    # port 3770, MySQL datasource, JPA config
│       ├── src/test/java/…               # JUnit/Mockito tests (controllers + services)
│       └── pom.xml
│
└── Frontend/
    ├── src/
    │   ├── App.jsx                       # routing + providers (i18n, auth, cart, balance, toast)
    │   ├── main.jsx
    │   ├── index.css                     # Web 2.0 theme (light/dark) + Tailwind entry
    │   ├── components/                   # Navbar, ProductCard, OrderTracker, Toast, …
    │   ├── context/                      # AuthContext, CartContext, BalanceContext
    │   ├── hooks/                        # useLocation, usePackageSimulation
    │   ├── i18n/                         # I18nContext + translations (12 languages)
    │   ├── pages/                        # Home, Products, Cart, Orders, Account, Balance, Login, Register
    │   ├── services/                     # api.js (Axios wrapper around /api/v1)
    │   └── __tests__/                    # Vitest + Testing Library tests
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js                    # dev server :5173, proxy /api → :3770
    └── product_gen.py                    # seed script: POST ~120 products to the backend
```

---

## 🚀 How to Run

### Prerequisites

- **Java 21** (`java -version` → `21.x`)
- **Node 18+** (`node -v`)
- **MySQL 8** running on `localhost:3306`, user `root`, empty password
  _(matches `Backend/package/src/main/resources/application.properties`)_

The schema `DinoRawrX3` is created automatically on first backend boot.

---

### 🖥️ 1 · Backend

```bash
cd Backend/package
./mvnw spring-boot:run            # Windows: .\mvnw.cmd spring-boot:run
```

- Runs on **http://localhost:3770**
- Swagger UI: **http://localhost:3770/swagger-ui.html**
- OpenAPI JSON: **http://localhost:3770/v3/api-docs**

> 🚨 **Never run `sudo ./mvnw`** — it leaves `target/` owned by root and breaks the next build with `Operation not permitted`. If that ever happens: `sudo chown -R $USER:$USER . && rm -rf target`.

**Seed the database with ~120 products (optional but recommended):**

```bash
cd Frontend
pip install requests          # first time only
python product_gen.py --count 120
```

Run `python product_gen.py --dry-run` to inspect the generated JSON without POSTing.

**Run backend tests:**

```bash
cd Backend/package
./mvnw test
```

---

### 🌐 2 · Frontend

```bash
cd Frontend
npm install                   # first time only
npm run dev
```

- Runs on **http://localhost:5173**
- `/api/*` is proxied to `http://localhost:3770` (see `vite.config.js`)

**Other frontend commands:**

```bash
npm run build                 # production bundle → dist/
npm run preview               # serve the built bundle
npm run test                  # Vitest watch mode
npm run test:ui               # Vitest UI dashboard
```

---

## 🔌 API Cheat Sheet

| Method | Path                              | Purpose                                |
| ------ | --------------------------------- | -------------------------------------- |
| `GET`    | `/api/v1/products`                  | List all products                      |
| `GET`    | `/api/v1/products/{id}`             | Get one product                        |
| `POST`   | `/api/v1/products`                  | Create product (used by `product_gen.py`) |
| `PUT`    | `/api/v1/products/{id}`             | Update product                         |
| `DELETE` | `/api/v1/products/{id}`             | Delete product                         |
| `GET`    | `/api/v1/Packages`                  | List all packages                      |
| `POST`   | `/api/v1/Packages`                  | Create package (auto-generates tracking code) |
| `GET`    | `/api/v1/Packages/track/{code}`     | **Public** tracking lookup              |
| `PUT`    | `/api/v1/Packages/{id}`             | Update state + append travel history   |
| `POST`   | `/api/v1/orders`                    | Create order receipt                   |
| `GET`    | `/api/v1/orders/history/{username}` | Order history for a user               |
| `PUT`    | `/api/v1/orders/{id}`               | Update order's `currentState`          |
| `PUT`    | `/api/v1/orders/{id}/refund`        | Process refund (idempotency-guarded)   |

> Interactive docs with request/response schemas: **http://localhost:3770/swagger-ui.html**

---

## 🧪 Test Coverage Snapshot

```
Backend   ─ 57 tests · 3 controller suites · 3 service suites · context load
Frontend  ─ App, CartContext, MathBackground (Vitest + Testing Library)
```

Run everything:

```bash
(cd Backend/package && ./mvnw test) && (cd Frontend && npm run test -- --run)
```

---

## 🛠️ Troubleshooting

| Symptom                                                | Fix                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| `Operation not permitted` during `./mvnw`               | `sudo chown -R $USER:$USER . && rm -rf target`               |
| `Port 3770 already in use`                             | `lsof -ti:3770 \| xargs kill -9`                             |
| `Port 5173 already in use`                             | `lsof -ti:5173 \| xargs kill -9` or `npm run dev -- --port 5174` |
| Frontend says *"Failed to load products"*              | Backend isn't running on `:3770` — start it first            |
| `Communications link failure` (backend)                | MySQL isn't running; check `application.properties`          |
| Products table exists but is empty                     | Run `python product_gen.py` from `Frontend/`                 |

---

<div align="center">

🦖 **DinoBox © 2026** · A delivery simulation experiment · built with too much coffee and too many emojis.

</div>
```

---

**Where to put it:** save as `README.md` at the repo root, i.e. `ef3-fsd2/README.md` (sibling of `Backend/` and `Frontend/`). GitHub will render it automatically on the repo landing page.

Then commit:

```bash
git add README.md
git commit -m "docs: add project README with setup, structure, and API reference"
git push
```

And on the other PC:

```bash
git pull
```
