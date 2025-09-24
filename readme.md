<div align="center">
  <img width="851" height="287" alt="Group 238551" src="https://github.com/user-attachments/assets/8b4b4363-9b75-44a5-b0c7-9eff6ba5ec3b" />
  <p align="center">
    Talk to the world, one stranger at a time.
    <br />
    <a href="https://gup-shup.me"><strong>Explore the Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/PrathamX595/GupShup/issues">Report Bug</a>
    ·
    <a href="https://github.com/PrathamX595/GupShup/issues">Request Feature</a>
  </p>
  <a href="https://peerlist.io/prtm_sth/project/gupshup" target="_blank" rel="noreferrer">
	  <img
		  src="https://peerlist.io/api/v1/projects/embed/PRJHA9ERLD798NN9K2A8NKD96GDJDB?showUpvote=true&theme=dark"
			alt="GupShup"
			style="width: auto; height: 72px;"
		/>
	</a>
</div>

---

## About The Project

GupShup is a modern, anonymous video chat platform that connects you with random strangers from around the globe. Inspired by platforms like Omegle, it provides a seamless and engaging way to have spontaneous conversations, share stories, and make new connections in a safe and respectful environment.

The project is built with a modern tech stack, featuring a Next.js frontend and a Node.js/Express backend, all written in TypeScript and containerized with Docker for easy deployment.

---

## ✨ Features

- **Anonymous Video & Text Chat**: Instantly connect with strangers for video and text conversations.
- **Random Pairing**: Get matched with a new person from anywhere in the world with a single click.
- **User Authentication**: Secure sign-up, login, and Google OAuth for a personalized experience.
- **User Profiles**: Manage your account, update your username, and upload a custom avatar.
- **Upvote System**: Show appreciation for great conversations by upvoting users.
- **Real-time Reactions**: Express yourself with quick emoji reactions during a chat.
- **Media Controls**: Easily toggle your camera and microphone.
- **Keyboard Shortcuts**: Navigate conversations efficiently (`Space` for next, `V` for video, `M` for mic).
- **Privacy Focused**: No personal data is shared by default. Video and audio tracks are disabled at the start of each chat.
- **Community Guidelines**: Clear rules and policies to ensure a safe and respectful community.

---

## 🛠️ Tech Stack

This project is a monorepo containing the frontend and backend services.

| Service      | Technologies                                                                                                                                                                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [Socket.IO Client](https://socket.io/), [WebRTC](https://webrtc.org/)                                                          |
| **Backend**  | [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [MongoDB](https://www.mongodb.com/), [Redis](https://redis.io/), [Socket.IO](https://socket.io/), [JWT](https://jwt.io/), [Passport.js](https://www.passportjs.org/) |
| **DevOps**   | [Docker](https://www.docker.com/)                                                                                                                                                                                                                                                      |

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**

    ```sh
    git clone https://github.com/PrathamX595/GupShup.git
    cd GupShup
    ```

2.  **Set up Backend (`gupshup-backend`)**

    - Navigate to the backend directory:
      ```sh
      cd gupshup-backend
      ```
    - Create a `.env` file from the example and fill in your configuration:
      ```sh
      cp .env.example .env
      ```
    - Install dependencies:
      ```sh
      npm install
      ```

3.  **Set up Frontend (`gupshup`)**
    - Navigate to the frontend directory:
      ```sh
      cd ../gupshup
      ```
    - Create a `.env.local` file and add the backend URL:
      ```
      NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
      ```
    - Install dependencies:
      ```sh
      npm install
      ```

### Running the Application

1.  **Start the Backend Server**

    - In the `gupshup-backend` directory:
      ```sh
      npm run dev
      ```
    - The backend will be running on `http://localhost:5000` (or your configured port).

2.  **Start the Frontend Development Server**
    - In the `gupshup` directory:
      ```sh
      npm run dev
      ```
    - Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running with Docker

You can also run the entire stack using Docker.

1.  **Build the Docker images:**

    ```sh
    # In the root directory
    docker build -t gupshup-frontend -f ./gupshup/Dockerfile ./gupshup
    docker build -t gupshup-backend -f ./gupshup-backend/Dockerfile ./gupshup-backend
    ```

2.  **Run the containers:**
    You'll need to create a Docker network and run your database (MongoDB/Redis) containers first, then run the application containers. A `docker-compose.yml` file would simplify this process.

---

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` files.

#### Backend (`gupshup-backend/.env`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# URLs
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Nodemailer (for email verification)
MAIL_USER=your_gmail_address
MAIL_APP_PASS=your_gmail_app_password

# Redis
REDIS_URL=redis://your_redis_host:6379
REDIS_PASSWORD=your_redis_password
REDIS_ROOM_SET=available_rooms
```

#### Frontend (`gupshup/.env.local`)

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📜 License

Distributed under the Apache 2.0 License. See `LICENSE` for more information.

---

## 📬 Contact

Pratham - [@Pratham_595](https://x.com/Pratham_595) - sethpratham67@gmail.com

Project Link: [https://github.com/PrathamX595/GupShup](https://github.com/PrathamX595/GupShup)
