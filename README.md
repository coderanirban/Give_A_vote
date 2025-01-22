# Pollify - Interactive Polling Application

Pollify is a real-time polling application built using the MERN (MongoDB, Express.js, React, Node.js) stack. It enables users to create polls, vote, and view results dynamically.

## Features

- **Responsive Navigation Bar**: Includes links to different sections and a hamburger menu for mobile users.
- **Dark Mode Support**: Toggle between light and dark themes.
- **Real-Time Polling**: Create, vote, and view live poll results.
- **User Authentication**: Sign up, log in, and manage user accounts.
- **Leaderboard**: Track top contributors and popular polls.

## Technology Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Icons**: React Icons (e.g., FiSun, FiMoon, AiOutlineMenu, AiOutlineClose)

## Installation

### Clone the repository
```bash
git clone https://github.com/yourusername/pollify.git
cd pollify
```

### Install dependencies

**Install server dependencies:**
```bash
cd server
npm install
```

**Install client dependencies:**
```bash
cd client
npm install
```

### Set up environment variables
Create a `.env` file in the `server` directory and add the following:
```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret-key>
PORT=5000
```

### Start the application

**Start the server:**
```bash
cd server
npm start
```

**Start the client:**
```bash
cd client
npm start
```

### Access the application
Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

## Folder Structure
```
pollify/
├── client/              # React.js frontend
│   ├── public/          # Static files
│   ├── src/             # React components and pages
│       ├── components/  # Reusable UI components (e.g., Navbar)
│       ├── pages/       # Application pages
│       ├── styles/      # CSS and Tailwind configuration
│   └── package.json     # Client dependencies and scripts
├── server/              # Node.js backend
│   ├── config/          # Database and server configuration
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication middleware
│   └── package.json     # Server dependencies and scripts
└── README.md            # Project documentation
```

## Responsive Navbar Features

- **Dynamic Links**: Links to Home, Show Poll, Create Poll, Leaderboard, Sign Up, and Log In.
- **Hamburger Menu**: Visible on smaller screens.
- **Dark Mode Toggle**: Switch between light and dark themes using FiSun and FiMoon icons.
- **Close Button**: Closes the mobile menu.

## Contribution Guidelines

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to your branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Happy polling with Pollify! 🚀
