# Unibazzar Frontend

Welcome to **Unibazzar** – your campus marketplace for students, merchants, tutors, and administrators. Unibazzar is designed to empower university communities by providing a seamless platform for buying, selling, and offering services within your campus ecosystem.

## 🎉 Introduction

Unibazzar connects students, merchants, and tutors in a vibrant digital marketplace. Whether you want to buy textbooks, offer tutoring, sell products, or manage campus activities, Unibazzar brings all these features together in one modern, easy-to-use web application.

**Key Goals:**

- Foster student entrepreneurship and collaboration
- Simplify campus commerce and service exchange
- Provide secure, role-based dashboards for every user type
- Enable real-time communication and feedback

**Why Unibazzar?**

- Built for campus life: tailored dashboards for students, merchants, tutors, and admins
- Modern tech stack: React, Vite, Redux, Tailwind CSS
- Fast, responsive, and mobile-friendly
- Open-source and community-driven

Join us in transforming campus commerce and collaboration!

### 1. Clone the Repository

```bash
git clone https://github.com/UniBazzar/unibazzar-frontend.git
```

- The frontend now uses a `.env` file for API endpoint configuration.

- All API calls will use this value. No need to manually update URLs in source files.

### 4. Start the Development Server

```bash
npm run dev
```

- The app will be available at [http://localhost:5173](http://localhost:5173) (or as shown in your terminal).

### 5. Backend Setup (Required)

- You must have the backend API running at the URL specified in your `.env` file (`VITE_API_URL`).
- Ensure CORS is enabled for your frontend origin in the backend settings.

---

## 🧑‍💻 Project Structure

```
src/
  components/         # Reusable UI and feature components
  pages/              # Main pages (Marketplace, Login, Profile, etc.)
  redux/              # Redux slices and store
  mock/               # Mock data for development
  styles/             # Tailwind and global CSS
  App.jsx             # Main app entry
  main.jsx            # ReactDOM entry
```

---

- **Add to Cart:** Click the cart icon on any product to add it to your cart.
- **Cart Persistence:** Cart state is saved in localStorage.
- **Authentication:** Login required for most features.
- **Role Dashboards:** Merchants, students, tutors, and admins have custom dashboards.

---

## 📝 Scripts

- `npm run dev` — Start the development server
- `npm run lint` — Lint the codebase

---

## 🧩 Customization

- **API URLs:** Change API endpoints in `src/pages/MarketplacePage.jsx` if your backend is on a different host/port.
- **Theme:** Tailwind CSS is used for styling. Customize in `src/index.css` or `tailwind.config.js`.
- **Mock Data:** Use files in `src/mock/` for local testing without a backend.

---

## 🐞 Troubleshooting

- **401 Unauthorized:** Make sure you are logged in and your token is valid.
- **CORS Errors:** Ensure your backend allows requests from your frontend's origin.
- **API Not Found:** Check that your backend is running and accessible at the expected URL.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- Built with ❤️ by the UniBazzar team.
- Thanks to all open-source contributors!
