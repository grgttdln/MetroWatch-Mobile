# MetroWatch-Mobile

A React Native mobile application for community-based reporting and social impact tracking. Users can report infrastructure issues, earn incentives, and contribute to community improvement efforts.

## Features

- **User Authentication**: Secure login and registration system
- **Report Creation**: Upload photos and create detailed reports of infrastructure issues
- **Social Layer**: Community feed with voting system for reports
- **Incentives System**: Earn points and redeem rewards for active participation
- **Profile Management**: Track your impact and contribution statistics
- **Real-time Updates**: Live community feed with upvoting/downvoting

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Expo CLI**: Install globally with `npm install -g @expo/cli`
- **Expo Go app** on your mobile device (available on App Store/Google Play)
- **Supabase account** for backend services

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd MetroWatch-Mobile
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

   or

   ```bash
   yarn install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add your Supabase configuration:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
   ```

   **To get these values:**

   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Create a new project or select existing one
   - Go to Settings > API
   - Copy the Project URL and Anon public key

## Supabase Database Setup

The application requires specific database tables. Set up your Supabase database with these tables:

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  city VARCHAR(100),
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Reports Table

```sql
CREATE TABLE reports (
  report_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(100) NOT NULL,
  location VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  url TEXT UNIQUE NOT NULL,
  upvote INTEGER DEFAULT 0,
  downvote INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'Not Resolved',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Storage Bucket

Create a storage bucket named `reports` in your Supabase dashboard for image uploads.

## Running the Application

1. **Start the development server:**

   ```bash
   npm start
   ```

   or

   ```bash
   expo start
   ```

2. **Choose your platform:**
   - Press `i` for iOS simulator (requires Xcode on macOS)
   - Press `a` for Android emulator (requires Android Studio)
   - Press `w` for web browser
   - Scan the QR code with Expo Go app on your mobile device

## Platform-Specific Setup

### iOS Development

- **macOS required** for iOS development
- Install **Xcode** from the App Store
- iOS Simulator will be available after Xcode installation

### Android Development

- Install **Android Studio**
- Set up Android emulator through Android Studio
- Ensure Android SDK and tools are properly configured

### Physical Device Testing

- Install **Expo Go** from App Store (iOS) or Google Play (Android)
- Ensure your computer and mobile device are on the same Wi-Fi network
- Scan the QR code displayed in terminal/browser

## Available Scripts

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `npm start`       | Start the development server |
| `npm run android` | Start on Android emulator    |
| `npm run ios`     | Start on iOS simulator       |
| `npm run web`     | Start web version            |
| `npm run lint`    | Run ESLint for code quality  |

## Project Structure

```
MetroWatch-Mobile/
├── app/                    # Main application screens
│   ├── Auth/              # Authentication screens
│   ├── Dashboard/         # Social layer and community feed
│   ├── Incentives/        # Rewards and points system
│   ├── Profile/           # User profile and statistics
│   └── Reports/           # Report creation and details
├── components/            # Reusable UI components
├── navigation/            # Navigation configuration
├── services/              # Backend services (Supabase)
├── assets/                # Images, fonts, and static files
└── package.json           # Dependencies and scripts
```

## Key Dependencies

- **Expo SDK 53**: Cross-platform development framework
- **React Native**: Mobile app framework
- **Supabase**: Backend-as-a-Service for database and authentication
- **Expo Router**: File-based navigation
- **React Navigation**: Tab and stack navigation
- **Expo Image Picker**: Camera and gallery access
- **Expo Location**: GPS and location services

## Environment Configuration

The app requires these permissions on mobile devices:

- **Camera**: For taking photos of reports
- **Photo Library**: For selecting existing images
- **Location**: For geotagging reports
- **Storage**: For saving vouchers and images

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**

   ```bash
   npx expo start --clear
   ```

2. **Package conflicts:**

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Supabase connection errors:**

   - Verify environment variables are correctly set
   - Check Supabase project status
   - Ensure API keys have proper permissions

4. **Image upload failures:**
   - Verify storage bucket exists and is public
   - Check device permissions for camera/gallery
   - Ensure stable internet connection

### Platform-Specific Issues

**iOS:**

- Ensure iOS simulator is running before starting app
- Check Xcode command line tools installation

**Android:**

- Verify Android emulator is running
- Check Android SDK path configuration
- Enable USB debugging for physical devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## Support

For technical support or questions:

- Check the troubleshooting section above
- Review Expo documentation
- Check Supabase documentation for backend issues

## License

This project is licensed under the MIT License.
