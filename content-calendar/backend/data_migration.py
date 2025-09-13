#!/usr/bin/env python3
"""
Data migration script to import existing social media data
into the new content calendar system
"""

import json
import sys
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from main import ScheduledPost, Base

# Add parent directory to path to import existing scoring functions
sys.path.append('../../')

def calculate_instagram_score(post):
    """Use existing Instagram scoring logic"""
    likes = post.get('likesCount', 0) or 0
    comments = post.get('commentsCount', 0) or 0

    # Handle video metrics with correction logic from existing system
    raw_video_views = post.get('videoViewCount', 0) or 0
    raw_video_plays = post.get('videoPlayCount', 0) or 0

    if raw_video_plays > raw_video_views and raw_video_plays > 0:
        video_views = raw_video_plays
        video_plays = raw_video_views
    else:
        video_views = raw_video_views
        video_plays = raw_video_plays

    return (likes * 1) + (comments * 5) + (video_views * 0.1) + (video_plays * 0.5)

def calculate_linkedin_score(post):
    """Use existing LinkedIn scoring logic"""
    stats = post.get('stats', {})
    likes = stats.get('like', 0) or 0
    total_reactions = stats.get('total_reactions', 0) or 0
    comments = stats.get('comments', 0) or 0
    shares = stats.get('shares', 0) or 0

    return (likes * 2) + (total_reactions * 2) + (comments * 10) + (shares * 15)

def format_instagram_date(timestamp_str):
    """Convert Instagram timestamp to datetime"""
    try:
        return datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
    except:
        return datetime.now()

def format_linkedin_date(date_str):
    """Convert LinkedIn date to datetime"""
    try:
        return datetime.fromisoformat(date_str.replace(' ', 'T'))
    except:
        return datetime.now()

def truncate_text(text, max_length=100):
    """Truncate text for title"""
    if not text:
        return "No content"
    return text[:max_length] + "..." if len(text) > max_length else text

def migrate_instagram_data(session, data_file):
    """Migrate Instagram data to calendar system"""

    print(f"📸 Migrating Instagram data from {data_file}...")

    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            instagram_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {data_file}")
        return 0
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in file: {data_file}")
        return 0

    migrated_count = 0
    seen_ids = set()

    for post in instagram_data:
        # Skip duplicates
        post_id = post.get('id', '')
        if post_id in seen_ids:
            continue
        seen_ids.add(post_id)

        # Calculate performance score
        actual_score = calculate_instagram_score(post)

        # Create scheduled post entry (marking as "published" since these are historical)
        scheduled_post = ScheduledPost(
            title=truncate_text(post.get('caption', 'Instagram Post')),
            content=post.get('caption', 'No caption') or 'No caption',
            platform='instagram',
            post_type='video' if post.get('type') == 'Video' else 'image',
            scheduled_date=format_instagram_date(post.get('timestamp', '')),
            predicted_score=actual_score,  # Use actual as predicted for historical data
            actual_score=actual_score,
            status='published',
            media_url=post.get('url', ''),
            hashtags=None  # Could extract from caption if needed
        )

        session.add(scheduled_post)
        migrated_count += 1

        if migrated_count % 10 == 0:
            print(f"  📸 Migrated {migrated_count} Instagram posts...")

    print(f"✅ Migrated {migrated_count} Instagram posts")
    return migrated_count

def migrate_linkedin_data(session, data_file):
    """Migrate LinkedIn data to calendar system"""

    print(f"💼 Migrating LinkedIn data from {data_file}...")

    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            linkedin_data = json.load(f)
    except FileNotFoundError:
        print(f"❌ File not found: {data_file}")
        return 0
    except json.JSONDecodeError:
        print(f"❌ Invalid JSON in file: {data_file}")
        return 0

    migrated_count = 0
    seen_urns = set()

    for post in linkedin_data:
        # Skip duplicates
        activity_urn = post.get('activity_urn', '')
        if activity_urn in seen_urns:
            continue
        seen_urns.add(activity_urn)

        # Calculate performance score
        actual_score = calculate_linkedin_score(post)

        # Determine post type
        media_type = 'text'
        if post.get('media'):
            media_type = post.get('media', {}).get('type', 'text').lower()

        # Create scheduled post entry
        posted_at = post.get('posted_at', {})
        scheduled_post = ScheduledPost(
            title=truncate_text(post.get('text', 'LinkedIn Post')),
            content=post.get('text', 'No content') or 'No content',
            platform='linkedin',
            post_type=media_type,
            scheduled_date=format_linkedin_date(posted_at.get('date', '') if posted_at else ''),
            predicted_score=actual_score,
            actual_score=actual_score,
            status='published',
            media_url=post.get('post_url', ''),
            hashtags=None
        )

        session.add(scheduled_post)
        migrated_count += 1

        if migrated_count % 10 == 0:
            print(f"  💼 Migrated {migrated_count} LinkedIn posts...")

    print(f"✅ Migrated {migrated_count} LinkedIn posts")
    return migrated_count

def create_sample_future_posts(session):
    """Create sample future posts for calendar demonstration"""

    print("📅 Creating sample future posts...")

    sample_posts = [
        {
            "title": "Workshop Behind-the-Scenes: Syrian Cooking",
            "content": "Join chef Amira as she prepares traditional Kibbeh for tonight's workshop! 🥟✨ #SyrianCooking #WorkshopLife",
            "platform": "instagram",
            "post_type": "video",
            "days_from_now": 1,
            "hashtags": "#SyrianCooking #WorkshopLife #TraditionalFood"
        },
        {
            "title": "Cultural Food Story - LinkedIn",
            "content": "The art of traditional bread making connects communities across cultures. Here's how our refugee chefs preserve culinary heritage through GoedUitje workshops.",
            "platform": "linkedin",
            "post_type": "image",
            "days_from_now": 2
        },
        {
            "title": "Weekend Workshop Announcement",
            "content": "🍽️ This Saturday: Persian Kitchen Fundamentals! Learn to make perfect Polo and aromatic stews. Limited spots available - book now!",
            "platform": "facebook",
            "post_type": "image",
            "days_from_now": 3
        },
        {
            "title": "Chef Spotlight: Iraqi Traditions",
            "content": "Meet Chef Hassan - bringing 20 years of Baghdad culinary traditions to Amsterdam. His lamb biryani is legendary! 🍛",
            "platform": "instagram",
            "post_type": "image",
            "days_from_now": 5
        },
        {
            "title": "Community Impact Story",
            "content": "Through food, we build bridges. Our cooking workshops have connected over 500 people this year, creating lasting cultural exchanges. #CommunityImpact",
            "platform": "linkedin",
            "post_type": "text",
            "days_from_now": 7
        }
    ]

    created_count = 0
    base_date = datetime.now()

    for post_data in sample_posts:
        scheduled_date = base_date + timedelta(days=post_data["days_from_now"])

        # Get performance prediction (mock using our algorithm)
        from main import predict_post_performance
        prediction = predict_post_performance(
            post_data["platform"],
            post_data["post_type"],
            scheduled_date
        )

        scheduled_post = ScheduledPost(
            title=post_data["title"],
            content=post_data["content"],
            platform=post_data["platform"],
            post_type=post_data["post_type"],
            scheduled_date=scheduled_date,
            predicted_score=prediction["predicted_score"],
            status="scheduled",
            hashtags=post_data.get("hashtags")
        )

        session.add(scheduled_post)
        created_count += 1

    print(f"✅ Created {created_count} sample future posts")
    return created_count

def main():
    """Main migration function"""

    print("🚀 Starting data migration for Content Calendar...")
    print("=" * 50)

    # Database setup
    SQLALCHEMY_DATABASE_URL = "sqlite:///./content_calendar.db"
    engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        # Migrate historical data
        instagram_file = "../../socials_scrapes/dataset_instagram-scraper_2025-09-04_13-39-02-289.json"
        linkedin_file = "../../socials_scrapes/dataset_linkedin-company-posts_2025-09-04_13-39-39-919.json"

        total_migrated = 0
        total_migrated += migrate_instagram_data(session, instagram_file)
        total_migrated += migrate_linkedin_data(session, linkedin_file)

        # Create sample future posts
        total_sample = create_sample_future_posts(session)

        # Commit all changes
        session.commit()

        print("=" * 50)
        print(f"🎉 Migration completed successfully!")
        print(f"📊 Historical posts migrated: {total_migrated}")
        print(f"📅 Sample future posts created: {total_sample}")
        print(f"💾 Database saved to: content_calendar.db")

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    main()