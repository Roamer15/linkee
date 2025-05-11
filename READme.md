# 🚀 Linkee - Powerful URL Shortener

**Linkee** is a full-stack, modern URL shortening service built with:

* **Frontend:** React + CSS (SPA)
* **Backend:** Express + PostgreSQL (Node.js)
* **Deployment:** Railway

---

## ✨ Features

* 🔗 **Instant Link Shortening**
  Paste any URL and get a short, trackable link in seconds.

* 📊 **Analytics Ready** (Upcoming)
  Track clicks, geolocation, and referrers.

* 👥 **User Authentication**
  Secure signup/login for managing your links.

* ⚙️ **REST API**
  Easily integrate with your apps using the public API.

---

## 🛠 Tech Stack

| Frontend           | Backend                   |
| ------------------ | ------------------------- |
| React (Vite)       | Express.js                |
| CSS                | PostgreSQL                |
| React Router (SPA) | JWT Authentication        |
| Fetch API          | Nodemailer (Email Verify) |
| Responsive Design  | Crypto (Safe ID gen)      |

---

## 🔗 Live Demo

👉 [**https://linkee.up.railway.app/**](https://linkee.up.railway.app/)

---

## 🚩 How to Run Locally

### 1️⃣ Clone the Repo

```bash
git clone https://github.com/your-username/linkee.git
cd linkee
```

### 2️⃣ Set Up the Backend

```bash
cd backend
cp .env.example .env
# Fill in your environment variables
npm install
npm run dev
```

✅ **Env vars you'll need:**

```
BASE_URL=your-frontend-url
JWT_SECRET=your-secret
DB_HOST=your-smtp-host
DB_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-app-password // You can get one on google apps under security
```

### 3️⃣ Set Up the Frontend

```bash
cd ../frontend
npm install
npm run dev
```

---

## 🔧 API Endpoints

| Method | Endpoint             | Description                      |
| ------ | -------------------- | -------------------------------- |
| POST   | `/api/shorten`       | Shorten a URL                    |
| GET    | `/api/:shortCode`    | Redirect to original URL         |
| POST   | `/api/auth/register` | User registration                |
| POST   | `/api/auth/login`    | User login                       |
| GET    | `/api/my-urls`         | Fetch user links (auth required) |

---

## 🚨 TODO / Roadmap

* [ ] ✨ Add analytics dashboard
* [ ] 🛡️ Improve error handling UX
* [ ] 📈 SEO optimization
* [ ] 🖥️ Add Admin panel
* [ ] 🌐 Custom domain support

---

## 🙌 Credits

Built by **Ian Beleke** ❤️
Contributions & feedback welcome!

---

# 📜 License

MIT © 2025 Linkee

