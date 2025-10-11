# 🎥 YouTube Clone Backend

A comprehensive backend API for a YouTube-like video sharing platform built with Node.js, Express, and MongoDB. This project includes user authentication, video upload and management, comments, likes, subscriptions, and more.

## 🌟 Features

### 🔐 Authentication & Authorization

- User registration and login with JWT tokens
- Password encryption using bcrypt
- Access and refresh token mechanism
- Protected routes with middleware

### 👤 User Management

- Complete user profile management
- Avatar and cover image upload
- Password change functionality
- Channel profile with subscriber statistics
- Watch history tracking

### 🎬 Video Management

- Video upload with thumbnail
- Video CRUD operations (Create, Read, Update, Delete)
- Video publishing toggle
- Pagination support for video listings
- Video metadata (title, description, duration, views)

### 💬 Comments System

- Add, edit, and delete comments on videos
- Paginated comment listings
- Comment ownership validation

### 👍 Like System

- Like/unlike videos, comments, and tweets
- Toggle-based like functionality
- Get all liked videos by user

### 📺 Subscription System

- Subscribe/unsubscribe to channels
- Get subscriber list for channels
- Get subscribed channels for users

### 🎵 Additional Features

- Tweet/post creation and management
- Playlist creation and management
- Cloud storage integration with Cloudinary
- File upload handling with Multer
- Error handling with custom API responses

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & Security

- **JWT (JSON Web Tokens)** - Authentication
- **bcrypt** - Password hashing
- **cookie-parser** - Cookie parsing

### File Upload & Storage

- **Cloudinary** - Cloud-based image and video storage
- **Multer** - Multipart form data handling

### Development Tools

- **nodemon** - Development server auto-restart
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **prettier** - Code formatting

## 📁 Project Structure

```
backend_youtube_project/
├── src/
│   ├── controllers/          # Request handlers
│   │   ├── user.controller.js
│   │   ├── video.controller.js
│   │   ├── comment.controller.js
│   │   ├── like.controller.js
│   │   ├── subscription.controller.js
│   │   ├── playlist.controller.js
│   │   └── tweet.controller.js
│   ├── models/              # Database schemas
│   │   ├── user.model.js
│   │   ├── video.model.js
│   │   ├── comments.model.js
│   │   ├── like.model.js
│   │   ├── subsCriptions.model.js
│   │   ├── playlist.model.js
│   │   └── tweet.model.js
│   ├── routes/              # API routes
│   │   ├── user.routes.js
│   │   ├── video.route.js
│   │   ├── comment.route.js
│   │   └── like.router.js
│   ├── middleware/          # Custom middleware
│   │   ├── auth.middleware.js
│   │   └── multer.middleware.js
│   ├── utils/               # Utility functions
│   │   ├── ApiError.js
│   │   ├── ApiResponse.js
│   │   ├── asyncHandler.js
│   │   ├── cloudinary.js
│   │   └── cloudinary-configure.js
│   ├── db/                  # Database connection
│   │   └── index.js
│   ├── app.js              # Express app configuration
│   ├── index.js            # Server entry point
│   └── constants.js        # Application constants
├── public/
│   └── temp/               # Temporary file storage
├── .env                    # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for file storage

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/raz421/youtube_clone.git
   cd youtube_clone
   ```

2. **Install Node.js dependencies**

   ```bash
   npm install
   ```

   **Alternative package managers:**

   ```bash
   # Using Yarn
   yarn install

   # Using pnpm
   pnpm install
   ```

3. **Install global dependencies (optional)**

   ```bash
   # Install nodemon globally for development
   npm install -g nodemon

   # Install PM2 for production process management
   npm install -g pm2
   ```

4. **Create environment file**

   ```bash
   # On Windows
   copy .env.example .env

   # On Linux/Mac
   cp .env.example .env
   ```

5. **Create required directories**

   ```bash
   # Create temp directory for file uploads
   mkdir -p public/temp
   ```

6. **Configure environment variables**

   ```env
   # Server Configuration
   PORT=8000
   CORS_ORIGIN=*

   # Database
   MONGO_URI=mongodb://localhost:27017
   # Or use MongoDB Atlas
   # MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net

   # JWT Secrets
   ACCESSTOKEN_TOKEN_SECRET=your_access_token_secret
   ACCESSTOKEN_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   REFRESH_TOKEN_EXPIRY=10d

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

7. **Start the development server**

   ```bash
   npm run dev
   ```

   **Alternative ways to start:**

   ```bash
   # Using nodemon directly
   nodemon src/index.js

   # Using node (production)
   node src/index.js
   ```

8. **Verify installation**

   ```bash
   # Check if server is running
   curl http://localhost:8000

   # Or open in browser
   http://localhost:8000
   ```

The server will start on `http://localhost:8000`

## 📦 Available Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "build": "echo 'No build step required for Node.js'",
    "test": "echo 'No tests specified' && exit 1",
    "lint": "prettier --check .",
    "lint:fix": "prettier --write .",
    "clean": "rm -rf public/temp/*",
    "prod": "NODE_ENV=production node src/index.js"
  }
}
```

**Script Usage:**

```bash
npm run dev      # Start development server with auto-restart
npm start        # Start production server
npm run lint     # Check code formatting
npm run lint:fix # Fix code formatting
npm run clean    # Clean temporary files
npm run prod     # Start in production mode
```

## 📡 API Endpoints

### 🔐 Authentication Routes

```
POST   /api/v1/users/register          # User registration
POST   /api/v1/users/login             # User login
POST   /api/v1/users/logout            # User logout
POST   /api/v1/users/refresh-token     # Refresh access token
```

### 👤 User Routes

```
GET    /api/v1/users/current-user      # Get current user
PATCH  /api/v1/users/updateDetails     # Update user details
PATCH  /api/v1/users/updateAvatar      # Update user avatar
PATCH  /api/v1/users/updateCoverImage  # Update cover image
POST   /api/v1/users/change-password   # Change password
GET    /api/v1/users/c/:username       # Get channel profile
GET    /api/v1/users/history           # Get watch history
```

### 🎬 Video Routes

```
POST   /api/v1/video/publish-video     # Upload new video
GET    /api/v1/video/v/allvideos       # Get all videos (paginated)
GET    /api/v1/video/v/:id             # Get video by ID
PATCH  /api/v1/video/v/update-video-details/:id  # Update video
DELETE /api/v1/video/v/video-delete/:id          # Delete video
GET    /api/v1/video/v/video-publish-toggle/:id  # Toggle publish status
```

### 💬 Comment Routes

```
POST   /api/v1/comment/add-comment/v/:videoId    # Add comment
GET    /api/v1/comment/allComments/v/:videoId    # Get video comments
GET    /api/v1/comment/update-comment/:id        # Update comment
GET    /api/v1/comment/delete-comment/:id        # Delete comment
```

### 👍 Like Routes

```
GET    /api/v1/like/l/getAllLikedVideos          # Get liked videos
GET    /api/v1/like/l/toggleVideoLike/:videoId   # Toggle video like
GET    /api/v1/like/l/toggleCommentLike/:commentId # Toggle comment like
GET    /api/v1/like/l/toggleTweetLike/:tweetId   # Toggle tweet like
```

## 📊 Data Models

### User Model

```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  fullname: String (required),
  avatar: String (required),
  coverImage: String,
  password: String (required, hashed),
  refreshToken: String,
  watchHistory: [ObjectId]
}
```

### Video Model

```javascript
{
  videoFile: String (required),
  thumbnail: String (required),
  title: String (required),
  description: String (required),
  duration: Number (required),
  views: Number (default: 0),
  isPublished: Boolean (default: false),
  owner: ObjectId (ref: User)
}
```

### Comment Model

```javascript
{
  content: String (required),
  video: ObjectId (ref: Video),
  owner: ObjectId (ref: User)
}
```

## 🔒 Authentication Flow

1. **Registration**: User provides details + avatar/cover images
2. **Login**: Returns access token (short-lived) and refresh token (long-lived)
3. **Protected Routes**: Require valid access token in Authorization header
4. **Token Refresh**: Use refresh token to get new access token when expired

### Example Authentication Header

```
Authorization: Bearer your_access_token_here
```

## 📤 File Upload

The API supports file uploads for:

- **User avatars** (required during registration)
- **Cover images** (optional)
- **Videos** (with thumbnails)

Files are temporarily stored locally and then uploaded to Cloudinary for permanent storage.

### Upload Example

```javascript
// For video upload
const formData = new FormData();
formData.append("video", videoFile);
formData.append("thumbnail", thumbnailFile);
formData.append("title", "Video Title");
formData.append("description", "Video Description");
```

## 🐛 Error Handling

The API uses consistent error responses:

```javascript
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errors": []
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=8000
NODE_ENV=development
CORS_ORIGIN=*

# Database Configuration
MONGO_URI=mongodb://localhost:27017
# For MongoDB Atlas (replace with your connection string)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/backend_youtube_db

# JWT Configuration
ACCESSTOKEN_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESSTOKEN_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration (Get from https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Environment Variables Reference

| Variable                   | Description               | Required | Default       | Example                     |
| -------------------------- | ------------------------- | -------- | ------------- | --------------------------- |
| `PORT`                     | Server port number        | No       | `5000`        | `8000`                      |
| `NODE_ENV`                 | Environment mode          | No       | `development` | `production`                |
| `CORS_ORIGIN`              | CORS allowed origins      | No       | `*`           | `http://localhost:3000`     |
| `MONGO_URI`                | MongoDB connection string | Yes      | -             | `mongodb://localhost:27017` |
| `ACCESSTOKEN_TOKEN_SECRET` | JWT access token secret   | Yes      | -             | `your_secret_key_123`       |
| `ACCESSTOKEN_TOKEN_EXPIRY` | Access token expiry time  | No       | `1d`          | `15m`, `1h`, `1d`           |
| `REFRESH_TOKEN_SECRET`     | JWT refresh token secret  | Yes      | -             | `your_refresh_secret_456`   |
| `REFRESH_TOKEN_EXPIRY`     | Refresh token expiry time | No       | `10d`         | `7d`, `30d`                 |
| `CLOUDINARY_CLOUD_NAME`    | Cloudinary cloud name     | Yes      | -             | `your_cloud`                |
| `CLOUDINARY_API_KEY`       | Cloudinary API key        | Yes      | -             | `123456789012345`           |
| `CLOUDINARY_API_SECRET`    | Cloudinary API secret     | Yes      | -             | `your_api_secret`           |

## �️ Development Setup

### 1. Database Setup

**Option A: Local MongoDB**

```bash
# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB service
# Windows: Start MongoDB service from Services
# macOS/Linux: sudo systemctl start mongod

# Verify MongoDB is running
mongosh
```

**Option B: MongoDB Atlas (Recommended)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new free cluster
3. Create database user
4. Whitelist your IP address
5. Get connection string and update `MONGO_URI`

### 2. Cloudinary Setup

1. Create free account at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Update environment variables

### 3. Testing the API

**Using cURL:**

```bash
# Test server health
curl http://localhost:8000

# Test user registration
curl -X POST http://localhost:8000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "fullname": "Test User",
    "password": "password123"
  }'
```

**Using Postman:**

1. Import the API collection (create one with all endpoints)
2. Set environment variables for base URL and tokens
3. Test all endpoints systematically

## 🐳 Docker Setup (Optional)

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "run", "dev"]
```

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongodb

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

**Run with Docker:**

```bash
# Build and start containers
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### MongoDB Atlas Setup

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGO_URI`

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get API credentials from dashboard
3. Update environment variables

### Production Deployment

**1. Server Setup**

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Clone and setup project
git clone https://github.com/raz421/youtube_clone.git
cd youtube_clone
npm install --production
```

**2. Environment Configuration**

```bash
# Create production environment file
nano .env.production

# Set production environment
export NODE_ENV=production
```

**3. PM2 Process Management**

```bash
# Start application with PM2
pm2 start src/index.js --name "youtube-api"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

**4. Nginx Configuration**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**5. SSL Setup with Certbot**

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

**6. Monitoring and Logs**

```bash
# View PM2 logs
pm2 logs youtube-api

# Monitor PM2 processes
pm2 monit

# Restart application
pm2 restart youtube-api

# Stop application
pm2 stop youtube-api
```

## 🔍 Troubleshooting

### Common Issues

**1. MongoDB Connection Failed**

```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

**2. Port Already in Use**

```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>

# Or change port in .env file
PORT=3000
```

**3. File Upload Issues**

```bash
# Check temp directory permissions
ls -la public/temp/

# Create temp directory if missing
mkdir -p public/temp
chmod 755 public/temp
```

**4. JWT Token Issues**

- Ensure JWT secrets are set in environment variables
- Check token expiry times
- Verify token format in Authorization header

**5. Cloudinary Upload Errors**

- Verify API credentials
- Check file size limits
- Ensure internet connectivity

### Debug Mode

Enable debug logging:

```javascript
// Add to src/index.js
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

### Performance Optimization

**1. Enable Gzip Compression**

```bash
npm install compression
```

```javascript
// Add to app.js
import compression from "compression";
app.use(compression());
```

**2. Rate Limiting**

```bash
npm install express-rate-limit
```

```javascript
// Add to app.js
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api", limiter);
```

**3. Database Indexing**

```javascript
// Add indexes to your models
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
videoSchema.index({ owner: 1 });
videoSchema.index({ createdAt: -1 });
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Your Name**

- GitHub: [@raz421](https://github.com/raz421)
- Email: maharazbhuiyan3@gmail.com

## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the powerful database
- Cloudinary for reliable cloud storage
- All the open-source contributors who made this possible

---

**Happy Coding! 🚀**
