# OPEER 🚀

> **Connect, Collaborate, and Build with Peers across Campuses.**

OPEER is a platform designed to bridge the gap between students across different universities. Whether you're looking for a hackathon partner, want to join a campus hub to stay updated, or need to recruit skilled peers for your next big project, OPEER makes it seamless.

![Dashboard](assets/dashboard.png)

## ✨ Features

- **🌐 Campus Hubs**: Join dedicated threads for your college (e.g., `/iitb`, `/stanford`) to find and connect with peers from your institute.
- **🤝 Project Recruiting**: Create projects and recruit team members based on specific skills (e.g., Python, React, UI/UX).
- **🛤️ Roadmap & Tasks**: Built-in Kanban board to manage project tasks and track progress efficiently.
- **💬 Real-time Chat**: Collaborate with your team using the integrated project chat.
- **👤 Smart Profiles**: Showcase your portfolio, GitHub stats, and skills to stand out.

## 📸 Screenshots

| Joined Hubs | Campus Discovery |
|:---:|:---:|
| ![Joined Hubs](assets/joined_hubs.png) | ![Campus Hubs](assets/campus_hubs.png) |

## 🛠️ Tech Stack

**Frontend**
- React 19
- Vite
- Lucide React (Icons)
- CSS Modules / Custom Styling

**Backend**
- Node.js & Express
- PostgreSQL (Database)
- Prisma ORM
- Passport.js (Authentication via GitHub & Google)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Start-OPEER/OPEER.git
   cd OPEER
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Set up environment variables
   # Create a .env file based on .env.example
   
   # Run Database Migrations
   npx prisma migrate dev
   
   # Start the server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repo.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the OPEER Team
</p>
