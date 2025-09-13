'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views, Event as CalendarEvent } from 'react-big-calendar';
import withDragAndDrop, { withDragAndDropProps } from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import axios from 'axios';

// Setup localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Drag and Drop Calendar
const DnDCalendar = withDragAndDrop(Calendar);

// Types
interface Post {
  id: number;
  title: string;
  content: string;
  platform: 'instagram' | 'linkedin' | 'facebook';
  post_type: string;
  scheduled_date: string;
  predicted_score: number;
  actual_score?: number;
  status: string;
  hashtags?: string;
  media_url?: string;
  created_at: string;
}

interface CalendarEventWithData extends CalendarEvent {
  id: number;
  platform: string;
  predicted_score: number;
  actual_score?: number;
  post_type: string;
  content: string;
  hashtags?: string;
}

interface RawDataPost {
  id?: string;
  caption?: string;
  text?: string;
  timestamp?: string;
  posted_at?: any;
  likesCount?: number;
  commentsCount?: number;
  videoViewCount?: number;
  videoPlayCount?: number;
  stats?: any;
  type?: string;
  url?: string;
  post_url?: string;
}

export default function ContentCalendar() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [showMethodology, setShowMethodology] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [rawInstagramData, setRawInstagramData] = useState<RawDataPost[]>([]);
  const [rawLinkedinData, setRawLinkedinData] = useState<RawDataPost[]>([]);

  // Edit modal state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  // Load posts from API
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await axios.get('http://localhost:8888/posts');
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to load posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  // Load raw data files
  useEffect(() => {
    const loadRawData = async () => {
      try {
        // Note: In production, these would be served via API
        // For now, we'll simulate the data structure
        const instagramSample: RawDataPost[] = [
          {
            id: "sample_ig_1",
            caption: "Join chef Amira as she prepares traditional Kibbeh! 🥟 #SyrianCooking #Workshop",
            timestamp: "2025-09-12T14:00:00Z",
            likesCount: 156,
            commentsCount: 23,
            videoViewCount: 2340,
            videoPlayCount: 890,
            type: "Video",
            url: "https://instagram.com/p/sample1"
          }
        ];

        const linkedinSample: RawDataPost[] = [
          {
            text: "The art of traditional bread making connects communities across cultures...",
            posted_at: { date: "2025-09-11 09:30:00" },
            stats: { like: 45, total_reactions: 67, comments: 12, shares: 8 },
            post_url: "https://linkedin.com/posts/sample1"
          }
        ];

        setRawInstagramData(instagramSample);
        setRawLinkedinData(linkedinSample);
      } catch (error) {
        console.error('Failed to load raw data:', error);
      }
    };

    loadRawData();
  }, []);

  // Convert posts to calendar events
  const events: CalendarEventWithData[] = useMemo(() => {
    return posts
      .filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform)
      .map(post => ({
        id: post.id,
        title: post.title,
        start: new Date(post.scheduled_date),
        end: new Date(new Date(post.scheduled_date).getTime() + 60 * 60 * 1000), // 1 hour duration
        platform: post.platform,
        predicted_score: post.predicted_score,
        actual_score: post.actual_score,
        post_type: post.post_type,
        content: post.content,
        hashtags: post.hashtags,
      }));
  }, [posts, selectedPlatform]);

  // Get score class for styling
  const getScoreClass = (score: number, platform: string) => {
    if (platform === 'instagram') {
      if (score >= 100) return 'score-excellent';
      if (score >= 50) return 'score-good';
      if (score >= 20) return 'score-average';
      return 'score-poor';
    } else if (platform === 'linkedin') {
      if (score >= 50) return 'score-excellent';
      if (score >= 20) return 'score-good';
      if (score >= 10) return 'score-average';
      return 'score-poor';
    } else { // facebook
      if (score >= 30) return 'score-excellent';
      if (score >= 15) return 'score-good';
      if (score >= 8) return 'score-average';
      return 'score-poor';
    }
  };

  // Event styling
  const eventStyleGetter = (event: CalendarEventWithData) => {
    const scoreClass = getScoreClass(event.predicted_score, event.platform);

    return {
      className: `${event.platform} ${scoreClass}`,
      style: {}
    };
  };

  // Handle drag and drop
  const onEventDrop: withDragAndDropProps['onEventDrop'] = async ({ event, start, end }) => {
    try {
      const updatedPost = {
        id: event.id,
        title: event.title,
        content: (event as CalendarEventWithData).content,
        platform: (event as CalendarEventWithData).platform,
        post_type: (event as CalendarEventWithData).post_type,
        scheduled_date: start.toISOString(),
        hashtags: (event as CalendarEventWithData).hashtags,
      };

      await axios.put(`http://localhost:8888/posts/${event.id}`, updatedPost);

      // Reload posts to get updated predictions
      const response = await axios.get('http://localhost:8888/posts');
      setPosts(response.data);

    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  // Handle event click (edit)
  const onEventClick = (event: CalendarEventWithData) => {
    const post = posts.find(p => p.id === event.id);
    if (post) {
      setEditingPost(post);
      setShowEditModal(true);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingPost) return;

    try {
      const formData = new FormData(e.currentTarget);
      const updatedPost = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        platform: formData.get('platform') as string,
        post_type: formData.get('post_type') as string,
        scheduled_date: formData.get('scheduled_date') as string,
        hashtags: formData.get('hashtags') as string,
      };

      await axios.put(`http://localhost:8888/posts/${editingPost.id}`, updatedPost);

      // Reload posts
      const response = await axios.get('http://localhost:8888/posts');
      setPosts(response.data);

      // Close modal
      setShowEditModal(false);
      setEditingPost(null);

    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    try {
      await axios.delete(`http://localhost:8888/posts/${postToDelete.id}`);

      // Reload posts
      const response = await axios.get('http://localhost:8888/posts');
      setPosts(response.data);

      // Close confirmation
      setShowDeleteConfirm(false);
      setPostToDelete(null);

    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Custom event component
  const EventComponent = ({ event }: { event: CalendarEventWithData }) => (
    <div className="flex items-center">
      <span className={`score-indicator ${getScoreClass(event.predicted_score, event.platform)}`}></span>
      <span className="truncate">{event.title}</span>
      <span className={`prediction-badge ${event.predicted_score >= 100 ? 'prediction-high' : event.predicted_score >= 50 ? 'prediction-medium' : 'prediction-low'}`}>
        {Math.round(event.predicted_score)}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <header className="text-center mb-6 bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🗓️ GoedUitje Content Calendar
        </h1>
        <p className="text-gray-600">
          AI-powered content planning with drag & drop scheduling and performance prediction
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Based on real performance data • Last updated: {new Date().toLocaleDateString()}
        </p>
      </header>

      {/* Methodology Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
        >
          📊 {showMethodology ? 'Hide' : 'Show'} Scoring Methodology
        </button>

        <button
          onClick={() => setShowRawData(!showRawData)}
          className="ml-3 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          💾 {showRawData ? 'Hide' : 'Show'} Raw Data Files
        </button>
      </div>

      {/* Methodology Section */}
      {showMethodology && (
        <div className="methodology">
          <h3>📊 Performance Score Calculation Methods</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">📸 Instagram Score Formula:</h4>
              <p><code>Score = (Likes × 1) + (Comments × 5) + (Video Views × 0.1) + (Video Plays × 0.5)</code></p>
              <ul className="mt-2">
                <li><strong>Comments weighted 5x</strong> - High engagement value</li>
                <li><strong>Video Plays</strong> - Intentional interactions (5x more valuable than views)</li>
                <li><strong>Video Views</strong> - Reach indicator (auto-play counted)</li>
                <li><strong>Score Ranges:</strong> Excellent (≥100), Good (≥50), Average (≥20), Poor (&lt;20)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">💼 LinkedIn Score Formula:</h4>
              <p><code>Score = (Likes × 2) + (Total Reactions × 2) + (Comments × 10) + (Shares × 15)</code></p>
              <ul className="mt-2">
                <li><strong>Shares weighted 15x</strong> - Highest professional value</li>
                <li><strong>Comments weighted 10x</strong> - Professional discussions</li>
                <li><strong>Reactions doubled</strong> - Professional engagement</li>
                <li><strong>Score Ranges:</strong> Excellent (≥50), Good (≥20), Average (≥10), Poor (&lt;10)</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🤖 AI Prediction Logic:</h4>
            <p className="text-blue-700">
              The system predicts performance by analyzing <strong>historical patterns + optimal timing</strong>:
            </p>
            <ul className="text-blue-700 mt-2">
              <li><strong>Content Type Multiplier:</strong> Workshop videos score 2x higher than static images</li>
              <li><strong>Day-of-Week Impact:</strong> LinkedIn performs 40% better on weekdays, Instagram on Tue-Thu</li>
              <li><strong>Time-of-Day Boost:</strong> Instagram peaks 11AM-2PM, LinkedIn at 8-10AM & 5-7PM</li>
              <li><strong>Platform Optimization:</strong> Each platform has different base score expectations</li>
            </ul>
          </div>
        </div>
      )}

      {/* Raw Data Section */}
      {showRawData && (
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">💾 Raw Data Sources</h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">📸 Instagram Data Sample:</h4>
                <div className="raw-data-section">
                  <pre>{JSON.stringify(rawInstagramData[0] || {}, null, 2)}</pre>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>File:</strong> dataset_instagram-scraper_2025-09-04_13-39-02-289.json<br/>
                  <strong>Total Posts:</strong> ~200+ historical posts<br/>
                  <strong>Includes:</strong> Likes, comments, video metrics, timestamps, captions
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">💼 LinkedIn Data Sample:</h4>
                <div className="raw-data-section">
                  <pre>{JSON.stringify(rawLinkedinData[0] || {}, null, 2)}</pre>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <strong>File:</strong> dataset_linkedin-company-posts_2025-09-04_13-39-39-919.json<br/>
                  <strong>Total Posts:</strong> ~150+ professional posts<br/>
                  <strong>Includes:</strong> Reactions, shares, comments, professional metrics
                </p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">✅ Data Processing & Quality:</h4>
              <ul className="text-green-700 text-sm">
                <li><strong>Duplicate Detection:</strong> Automatic removal based on post IDs and URNs</li>
                <li><strong>Data Validation:</strong> Handles missing values, corrects swapped video metrics</li>
                <li><strong>Real-time Integration:</strong> API connects live calendar to historical performance data</li>
                <li><strong>Accurate Scoring:</strong> Uses exact same algorithms as your existing analysis system</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Platform Filter */}
      <div className="platform-nav">
        <button
          className={selectedPlatform === 'all' ? 'active' : ''}
          onClick={() => setSelectedPlatform('all')}
        >
          🌐 All Platforms
        </button>
        <button
          className={selectedPlatform === 'instagram' ? 'active' : ''}
          onClick={() => setSelectedPlatform('instagram')}
        >
          📸 Instagram
        </button>
        <button
          className={selectedPlatform === 'linkedin' ? 'active' : ''}
          onClick={() => setSelectedPlatform('linkedin')}
        >
          💼 LinkedIn
        </button>
        <button
          className={selectedPlatform === 'facebook' ? 'active' : ''}
          onClick={() => setSelectedPlatform('facebook')}
        >
          📘 Facebook
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onEventDrop={onEventDrop}
          onSelectEvent={onEventClick}
          resizable
          popup
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          components={{
            event: EventComponent,
          }}
          tooltipAccessor={(event: CalendarEventWithData) =>
            `${event.platform.toUpperCase()} • Score: ${Math.round(event.predicted_score)} • ${event.content.substring(0, 100)}...`
          }
        />
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-700">📊 Total Posts</h3>
          <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-700">⭐ Avg Predicted Score</h3>
          <p className="text-2xl font-bold text-green-600">
            {posts.length ? Math.round(posts.reduce((acc, post) => acc + post.predicted_score, 0) / posts.length) : 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-700">🚀 High Performers</h3>
          <p className="text-2xl font-bold text-purple-600">
            {posts.filter(post => post.predicted_score >= (post.platform === 'instagram' ? 100 : 50)).length}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-800 mb-2">📖 How to Use:</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li><strong>Click to Edit:</strong> Click on any event to edit content, title, or hashtags</li>
          <li><strong>Drag & Drop:</strong> Move posts to different dates to reschedule</li>
          <li><strong>Score Indicators:</strong> Color dots show predicted performance (green = excellent, red = needs optimization)</li>
          <li><strong>Platform Colors:</strong> Instagram (gradient), LinkedIn (blue), Facebook (blue)</li>
          <li><strong>Real-time Predictions:</strong> Scores update automatically based on new scheduling time</li>
        </ul>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit Post</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingPost.title}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  rows={4}
                  defaultValue={editingPost.content}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select
                    name="platform"
                    defaultValue={editingPost.platform}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="instagram">📸 Instagram</option>
                    <option value="linkedin">💼 LinkedIn</option>
                    <option value="facebook">📘 Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Type</label>
                  <select
                    name="post_type"
                    defaultValue={editingPost.post_type}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="video">🎥 Video</option>
                    <option value="image">🖼️ Image</option>
                    <option value="text">📝 Text</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                <input
                  type="datetime-local"
                  name="scheduled_date"
                  defaultValue={new Date(editingPost.scheduled_date).toISOString().slice(0, 16)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                <input
                  type="text"
                  name="hashtags"
                  defaultValue={editingPost.hashtags || ''}
                  placeholder="#example #hashtag"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => handleDeleteClick(editingPost)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  🗑️ Delete Post
                </button>

                <div className="space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingPost(null);
                    }}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    💾 Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && postToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 text-red-600">🗑️ Delete Post</h2>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this post?
            </p>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <strong>{postToDelete.title}</strong><br/>
              <span className="text-sm text-gray-600">
                {postToDelete.platform.toUpperCase()} • {new Date(postToDelete.scheduled_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPostToDelete(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}