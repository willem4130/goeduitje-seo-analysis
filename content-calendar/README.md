# 🗓️ GoedUitje Content Calendar

AI-powered social media content planning with drag-and-drop scheduling and performance prediction based on your real Instagram and LinkedIn data.

## ✨ Features

- **🎯 Drag & Drop Calendar**: Visual scheduling with react-big-calendar
- **🤖 AI Performance Prediction**: Uses your historical data to predict post success
- **📊 Real Scoring System**: Same algorithms as your existing analysis
- **📱 Mobile Responsive**: Works on all devices
- **🔄 Real-time Updates**: Predictions update when you reschedule posts
- **📈 Platform Intelligence**: Instagram, LinkedIn, and Facebook optimization

## 🚀 Quick Start

### 1. Backend Setup (Python FastAPI)

```bash
cd content-calendar/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run data migration (imports your existing social media data)
python data_migration.py

# Start the API server
python main.py
```

The API will be running at `http://localhost:8000`

### 2. Frontend Setup (Next.js)

```bash
cd content-calendar/frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The calendar will be available at `http://localhost:3000`

## 📊 How the Scoring System Works

### Instagram Performance Score
```
Score = (Likes × 1) + (Comments × 5) + (Video Views × 0.1) + (Video Plays × 0.5)
```

**Why this formula:**
- **Comments are 5x more valuable** than likes (deeper engagement)
- **Video Plays** (intentional action) worth 5x more than auto-play Views
- **Workshop videos consistently score 1000+** in your data

### LinkedIn Performance Score
```
Score = (Likes × 2) + (Total Reactions × 2) + (Comments × 10) + (Shares × 15)
```

**Why this formula:**
- **Shares are 15x more valuable** (professional amplification)
- **Comments worth 10x** (meaningful professional discussions)
- **Professional content performs differently** than consumer social

## 🎯 AI Prediction Logic

The system predicts performance using:

1. **Historical Base Scores**: Your actual performance data by content type
2. **Optimal Timing Multipliers**:
   - Instagram: Tuesday-Thursday, 11AM-2PM optimal
   - LinkedIn: Weekday mornings (8-10AM) and evenings (5-7PM)
3. **Content Type Intelligence**: Workshop videos predict 2-3x higher scores

## 📁 Real Data Integration

The system uses your actual data files:
- `socials_scrapes/dataset_instagram-scraper_2025-09-04_13-39-02-289.json`
- `socials_scrapes/dataset_linkedin-company-posts_2025-09-04_13-39-39-919.json`

**Data Quality Features:**
- ✅ Automatic duplicate detection and removal
- ✅ Corrects swapped video metrics (Views vs Plays)
- ✅ Handles missing values gracefully
- ✅ Preserves all original data for transparency

## 🎨 Using the Calendar

### Basic Operations
- **Drag any post** to reschedule - predictions update automatically
- **Color coding**: Instagram (gradient), LinkedIn (blue), Facebook (blue)
- **Score indicators**: Green dots = high predicted performance
- **Platform filtering**: View specific platforms or all together

### Score Interpretation
- **Instagram**: 100+ excellent, 50+ good, 20+ average, <20 needs work
- **LinkedIn**: 50+ excellent, 20+ good, 10+ average, <10 needs work
- **Facebook**: 30+ excellent, 15+ good, 8+ average, <8 needs work

## 🔧 Development

### Project Structure
```
content-calendar/
├── backend/           # Python FastAPI server
│   ├── main.py       # API endpoints
│   ├── data_migration.py # Import your existing data
│   └── requirements.txt
└── frontend/         # Next.js React app
    ├── src/app/      # App router structure
    ├── package.json  # Dependencies
    └── tailwind.config.ts # Styling
```

### API Endpoints
- `GET /posts` - List all scheduled posts
- `POST /posts` - Create new post with prediction
- `PUT /posts/{id}` - Update post (triggers new prediction)
- `POST /predict` - Get performance prediction for parameters
- `GET /analytics/optimal-times/{platform}` - Platform-specific best times

## 📈 Performance Data Access

The calendar includes full access to:
- **Raw JSON data** from your social media scrapes
- **Exact scoring calculations** with transparent methodology
- **Historical performance patterns** for all platforms
- **Real-time prediction confidence scores**

## 🚦 Deployment

### Local Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Database: SQLite file `content_calendar.db`

### Production Ready
- ✅ Environment variables for API URLs
- ✅ CORS configuration for cross-origin requests
- ✅ Error handling and validation
- ✅ Mobile-responsive design
- ✅ Real performance data integration

## 🤖 Next Steps

1. **Test the drag-drop functionality** - Move posts around and see predictions update
2. **Analyze your high-performing content** - Use the scoring to identify what works
3. **Plan content strategically** - Schedule posts at optimal predicted times
4. **Track actual vs predicted performance** - Refine the AI over time

## 💡 Pro Tips

- **Workshop behind-the-scenes videos** consistently score highest on Instagram
- **Professional insights and cultural stories** perform best on LinkedIn
- **Tuesday 2PM** is your golden time for Instagram workshop content
- **Weekday mornings** are optimal for LinkedIn professional posts

Your calendar now combines the power of your existing performance analysis with interactive planning - making content scheduling both data-driven and intuitive!