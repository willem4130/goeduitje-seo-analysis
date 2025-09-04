#!/usr/bin/env python3

import json
import datetime
from pathlib import Path

def calculate_instagram_score(post):
    """Calculate Instagram success score based on engagement metrics"""
    likes = post.get('likesCount', 0) or 0
    comments = post.get('commentsCount', 0) or 0
    video_views = post.get('videoViewCount', 0) or 0
    video_plays = post.get('videoPlayCount', 0) or 0
    
    # Instagram Success Score Formula
    score = (likes * 1) + (comments * 5) + (video_views * 0.1) + (video_plays * 0.5)
    return round(score, 1)

def calculate_linkedin_score(post):
    """Calculate LinkedIn success score based on professional engagement"""
    stats = post.get('stats', {})
    likes = stats.get('like', 0) or 0
    total_reactions = stats.get('total_reactions', 0) or 0
    comments = stats.get('comments', 0) or 0
    shares = stats.get('shares', 0) or 0
    
    # LinkedIn Success Score Formula (professional platform weights)
    score = (likes * 2) + (total_reactions * 2) + (comments * 10) + (shares * 15)
    return round(score, 1)

def format_date(timestamp_str):
    """Format timestamp to Dutch date"""
    try:
        dt = datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        return dt.strftime('%d-%m-%Y')
    except:
        return timestamp_str[:10] if timestamp_str else 'Unknown'

def format_linkedin_date(date_str):
    """Format LinkedIn date"""
    try:
        dt = datetime.datetime.fromisoformat(date_str.replace(' ', 'T'))
        return dt.strftime('%d-%m-%Y')
    except:
        return date_str[:10] if date_str else 'Unknown'

def truncate_text(text, max_length=100):
    """Truncate text for display"""
    if not text:
        return "No content"
    return text[:max_length] + "..." if len(text) > max_length else text

def get_score_class(score, platform):
    """Get CSS class based on score"""
    if platform == 'instagram':
        if score >= 100: return 'score-excellent'
        if score >= 50: return 'score-good'
        if score >= 20: return 'score-average'
        return 'score-poor'
    else:  # linkedin
        if score >= 50: return 'score-excellent'
        if score >= 20: return 'score-good'
        if score >= 10: return 'score-average'
        return 'score-poor'

def process_instagram_data():
    """Process Instagram JSON data"""
    with open('socials_scrapes/dataset_instagram-scraper_2025-09-04_13-39-02-289.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    processed_posts = []
    for post in data:
        score = calculate_instagram_score(post)
        processed_post = {
            'score': score,
            'caption': post.get('caption', 'No caption'),
            'type': post.get('type', 'Image'),
            'date': format_date(post.get('timestamp', '')),
            'likes': post.get('likesCount', 0) or 0,
            'comments': post.get('commentsCount', 0) or 0,
            'video_views': post.get('videoViewCount', 0) or 0,
            'video_plays': post.get('videoPlayCount', 0) or 0,
            'url': post.get('url', '')
        }
        processed_posts.append(processed_post)
    
    # Sort by score descending
    processed_posts.sort(key=lambda x: x['score'], reverse=True)
    return processed_posts

def process_linkedin_data():
    """Process LinkedIn JSON data"""
    with open('socials_scrapes/dataset_linkedin-company-posts_2025-09-04_13-39-39-919.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    processed_posts = []
    for post in data:
        score = calculate_linkedin_score(post)
        posted_at = post.get('posted_at', {})
        
        processed_post = {
            'score': score,
            'text': post.get('text', 'No content'),
            'type': post.get('media', {}).get('type', 'text').capitalize() if post.get('media') else 'Text',
            'date': format_linkedin_date(posted_at.get('date', '') if posted_at else ''),
            'total_reactions': post.get('stats', {}).get('total_reactions', 0) or 0,
            'likes': post.get('stats', {}).get('like', 0) or 0,
            'comments': post.get('stats', {}).get('comments', 0) or 0,
            'shares': post.get('stats', {}).get('shares', 0) or 0,
            'url': post.get('post_url', '')
        }
        processed_posts.append(processed_post)
    
    # Sort by score descending
    processed_posts.sort(key=lambda x: x['score'], reverse=True)
    return processed_posts

def generate_instagram_table(posts):
    """Generate Instagram posts table HTML"""
    total_likes = sum(post['likes'] for post in posts)
    avg_score = sum(post['score'] for post in posts) / len(posts) if posts else 0
    
    stats_html = f"""
    <div class="stats-summary">
        <div class="stat-item">
            <div class="stat-value">{len(posts)}</div>
            <div class="stat-label">Posts</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{total_likes}</div>
            <div class="stat-label">Total Likes</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{round(avg_score, 1)}</div>
            <div class="stat-label">Avg Score</div>
        </div>
    </div>
    """
    
    rows = []
    for post in posts:
        score_class = get_score_class(post['score'], 'instagram')
        video_views = post['video_views'] if post['video_views'] > 0 else '-'
        video_plays = post['video_plays'] if post['video_plays'] > 0 else '-'
        
        row = f"""
        <tr>
            <td><div class="success-score {score_class}">{post['score']}</div></td>
            <td class="post-text">{truncate_text(post['caption'], 150)}</td>
            <td><span class="post-type {'type-video' if post['type'] == 'Video' else 'type-image'}">{post['type']}</span></td>
            <td class="date-cell">{post['date']}</td>
            <td class="metric-value">{post['likes']}</td>
            <td class="metric-value">{post['comments']}</td>
            <td class="metric-value">{video_views}</td>
            <td class="metric-value">{video_plays}</td>
        </tr>
        """
        rows.append(row)
    
    table_html = f"""
    <div class="platform-header instagram-header">
        <h2 class="platform-title">📸 Instagram Posts</h2>
        {stats_html}
    </div>
    <table class="posts-table">
        <thead>
            <tr>
                <th>Success Score</th>
                <th>Post Content</th>
                <th>Type</th>
                <th>Datum</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Video Views</th>
                <th>Video Plays</th>
            </tr>
        </thead>
        <tbody>
            {''.join(rows)}
        </tbody>
    </table>
    """
    
    return table_html

def generate_linkedin_table(posts):
    """Generate LinkedIn posts table HTML"""
    total_reactions = sum(post['total_reactions'] for post in posts)
    avg_score = sum(post['score'] for post in posts) / len(posts) if posts else 0
    
    stats_html = f"""
    <div class="stats-summary">
        <div class="stat-item">
            <div class="stat-value">{len(posts)}</div>
            <div class="stat-label">Posts</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{total_reactions}</div>
            <div class="stat-label">Total Reactions</div>
        </div>
        <div class="stat-item">
            <div class="stat-value">{round(avg_score, 1)}</div>
            <div class="stat-label">Avg Score</div>
        </div>
    </div>
    """
    
    rows = []
    for post in posts:
        score_class = get_score_class(post['score'], 'linkedin')
        
        row = f"""
        <tr>
            <td><div class="success-score {score_class}">{post['score']}</div></td>
            <td class="post-text">{truncate_text(post['text'], 150)}</td>
            <td><span class="post-type {'type-video' if post['type'] == 'Video' else 'type-image'}">{post['type']}</span></td>
            <td class="date-cell">{post['date']}</td>
            <td class="metric-value">{post['total_reactions']}</td>
            <td class="metric-value">{post['likes']}</td>
            <td class="metric-value">{post['comments']}</td>
            <td class="metric-value">{post['shares']}</td>
        </tr>
        """
        rows.append(row)
    
    table_html = f"""
    <div class="platform-header linkedin-header">
        <h2 class="platform-title">💼 LinkedIn Posts</h2>
        {stats_html}
    </div>
    <table class="posts-table">
        <thead>
            <tr>
                <th>Success Score</th>
                <th>Post Content</th>
                <th>Type</th>
                <th>Datum</th>
                <th>Total Reactions</th>
                <th>Likes</th>
                <th>Comments</th>
                <th>Shares</th>
            </tr>
        </thead>
        <tbody>
            {''.join(rows)}
        </tbody>
    </table>
    """
    
    return table_html

def generate_instagram_page():
    """Generate Instagram-only static HTML page"""
    
    # Process data
    instagram_posts = process_instagram_data()
    
    # Generate table
    instagram_table = generate_instagram_table(instagram_posts)
    
    html_content = f"""<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Instagram Posts Overview - GoedUitje.nl</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 2rem;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 2rem;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .header h1 {{
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }}
        
        .nav-links {{
            margin-bottom: 1rem;
        }}
        
        .nav-link {{
            display: inline-block;
            padding: 0.5rem 1rem;
            margin: 0 0.5rem;
            background: #e9ecef;
            border-radius: 6px;
            text-decoration: none;
            color: #495057;
            transition: all 0.2s ease;
        }}
        
        .nav-link:hover {{
            background: #dee2e6;
        }}
        
        .nav-link.active {{
            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
            color: white;
        }}
        
        .platform-section {{
            margin-bottom: 3rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .platform-header {{
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        
        .instagram-header {{
            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
        }}
        
        .platform-title {{
            font-size: 1.5rem;
            font-weight: 600;
        }}
        
        .stats-summary {{
            display: flex;
            gap: 2rem;
        }}
        
        .stat-item {{
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 1.2rem;
            font-weight: 700;
        }}
        
        .stat-label {{
            font-size: 0.9rem;
            opacity: 0.9;
        }}
        
        .posts-table {{
            width: 100%;
            border-collapse: collapse;
        }}
        
        .posts-table th {{
            background: #f8f9fa;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
            font-size: 0.9rem;
        }}
        
        .posts-table td {{
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
        }}
        
        .posts-table tr:hover {{
            background: #f8f9fa;
        }}
        
        .post-text {{
            max-width: 300px;
            line-height: 1.4;
            font-size: 0.9rem;
        }}
        
        .success-score {{
            font-weight: 700;
            padding: 0.5rem;
            border-radius: 6px;
            text-align: center;
            color: white;
            min-width: 60px;
        }}
        
        .score-excellent {{ background: #28a745; }}
        .score-good {{ background: #17a2b8; }}
        .score-average {{ background: #ffc107; color: #333; }}
        .score-poor {{ background: #dc3545; }}
        
        .metric-value {{
            font-weight: 600;
            text-align: center;
        }}
        
        .date-cell {{
            font-size: 0.9rem;
            color: #666;
            white-space: nowrap;
        }}
        
        .post-type {{
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }}
        
        .type-video {{
            background: #e3f2fd;
            color: #1976d2;
        }}
        
        .type-image {{
            background: #f3e5f5;
            color: #7b1fa2;
        }}
        
        .methodology {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }}
        
        .methodology h3 {{
            color: #856404;
            margin-bottom: 0.5rem;
        }}
        
        .methodology p {{
            color: #856404;
            font-size: 0.9rem;
            line-height: 1.5;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>📸 Instagram Posts Performance</h1>
            <div class="nav-links">
                <a href="index.html" class="nav-link">🏠 Hoofdmenu</a>
                <a href="instagram-posts-overview.html" class="nav-link active">📸 Instagram</a>
                <a href="linkedin-posts-overview.html" class="nav-link">💼 LinkedIn</a>
            </div>
            <p>Gedetailleerd overzicht van alle Instagram posts met success metrics</p>
            <p><small>Gebaseerd op data uit: socials_scrapes/dataset_instagram-scraper_2025-09-04_13-39-02-289.json | Gegenereerd: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M')}</small></p>
        </header>
        
        <div class="methodology">
            <h3>📊 Instagram Success Score Methodologie</h3>
            <p><strong>Score Berekening:</strong> (Likes × 1) + (Comments × 5) + (Video Views × 0.1) + (Video Plays × 0.5)<br>
            <strong>Kleuren:</strong> Groen (≥100), Blauw (≥50), Geel (≥20), Rood (&lt;20)<br>
            <strong>Sorting:</strong> Posts gesorteerd van hoogste naar laagste success score</p>
        </div>
        
        <div class="video-metrics-explanation">
            <h3>🎬 Instagram Video Metrics Uitgelegd</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
                <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; border-left: 4px solid #1976d2;">
                    <h4><strong>📺 Video Views</strong></h4>
                    <p><strong>Definitie:</strong> Aantal keer dat video is gestart (minimaal 3 seconden bekeken)</p>
                    <p><strong>Betekenis:</strong> Totale reach - hoeveel mensen je content hebben gezien</p>
                    <p><strong>Gewicht in score:</strong> 0.1x (hoge volume, lagere waarde)</p>
                </div>
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; border-left: 4px solid #28a745;">
                    <h4><strong>▶️ Video Plays</strong></h4>
                    <p><strong>Definitie:</strong> Aantal daadwerkelijke starts van de video (op play knop gedrukt)</p>
                    <p><strong>Betekenis:</strong> Bewuste interesse - mensen kozen ervoor om je video af te spelen</p>
                    <p><strong>Gewicht in score:</strong> 0.5x (lagere volume, hogere waarde)</p>
                </div>
            </div>
            <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid #ffc107;">
                <p><strong>💡 Praktijk:</strong> Video Views zijn meestal hoger (auto-play), Video Plays tonen echte interesse. 
                Een hoge Views/Plays ratio betekent dat mensen de video zien maar niet bewust afspelen - mogelijk minder boeiende opening.</p>
            </div>
        </div>
        
        <!-- Instagram Section -->
        <section class="platform-section">
            {instagram_table}
        </section>
    </div>
</body>
</html>"""
    
    return html_content

def generate_linkedin_page():
    """Generate LinkedIn-only static HTML page"""
    
    # Process data
    linkedin_posts = process_linkedin_data()
    
    # Generate table
    linkedin_table = generate_linkedin_table(linkedin_posts)
    
    html_content = f"""<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LinkedIn Posts Overview - GoedUitje.nl</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 2rem;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 2rem;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .header h1 {{
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }}
        
        .nav-links {{
            margin-bottom: 1rem;
        }}
        
        .nav-link {{
            display: inline-block;
            padding: 0.5rem 1rem;
            margin: 0 0.5rem;
            background: #e9ecef;
            border-radius: 6px;
            text-decoration: none;
            color: #495057;
            transition: all 0.2s ease;
        }}
        
        .nav-link:hover {{
            background: #dee2e6;
        }}
        
        .nav-link.active {{
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
            color: white;
        }}
        
        .platform-section {{
            margin-bottom: 3rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .platform-header {{
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        
        .linkedin-header {{
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
        }}
        
        .platform-title {{
            font-size: 1.5rem;
            font-weight: 600;
        }}
        
        .stats-summary {{
            display: flex;
            gap: 2rem;
        }}
        
        .stat-item {{
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 1.2rem;
            font-weight: 700;
        }}
        
        .stat-label {{
            font-size: 0.9rem;
            opacity: 0.9;
        }}
        
        .posts-table {{
            width: 100%;
            border-collapse: collapse;
        }}
        
        .posts-table th {{
            background: #f8f9fa;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
            font-size: 0.9rem;
        }}
        
        .posts-table td {{
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
        }}
        
        .posts-table tr:hover {{
            background: #f8f9fa;
        }}
        
        .post-text {{
            max-width: 300px;
            line-height: 1.4;
            font-size: 0.9rem;
        }}
        
        .success-score {{
            font-weight: 700;
            padding: 0.5rem;
            border-radius: 6px;
            text-align: center;
            color: white;
            min-width: 60px;
        }}
        
        .score-excellent {{ background: #28a745; }}
        .score-good {{ background: #17a2b8; }}
        .score-average {{ background: #ffc107; color: #333; }}
        .score-poor {{ background: #dc3545; }}
        
        .metric-value {{
            font-weight: 600;
            text-align: center;
        }}
        
        .date-cell {{
            font-size: 0.9rem;
            color: #666;
            white-space: nowrap;
        }}
        
        .post-type {{
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }}
        
        .type-video {{
            background: #e3f2fd;
            color: #1976d2;
        }}
        
        .type-image {{
            background: #f3e5f5;
            color: #7b1fa2;
        }}
        
        .methodology {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }}
        
        .methodology h3 {{
            color: #856404;
            margin-bottom: 0.5rem;
        }}
        
        .methodology p {{
            color: #856404;
            font-size: 0.9rem;
            line-height: 1.5;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>💼 LinkedIn Posts Performance</h1>
            <div class="nav-links">
                <a href="index.html" class="nav-link">🏠 Hoofdmenu</a>
                <a href="instagram-posts-overview.html" class="nav-link">📸 Instagram</a>
                <a href="linkedin-posts-overview.html" class="nav-link active">💼 LinkedIn</a>
            </div>
            <p>Gedetailleerd overzicht van alle LinkedIn posts met success metrics</p>
            <p><small>Gebaseerd op data uit: socials_scrapes/dataset_linkedin-company-posts_2025-09-04_13-39-39-919.json | Gegenereerd: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M')}</small></p>
        </header>
        
        <div class="methodology">
            <h3>📊 LinkedIn Success Score Methodologie</h3>
            <p><strong>Score Berekening:</strong> (Likes × 2) + (Total Reactions × 2) + (Comments × 10) + (Shares × 15)<br>
            <strong>Kleuren:</strong> Groen (≥50), Blauw (≥20), Geel (≥10), Rood (&lt;10)<br>
            <strong>Sorting:</strong> Posts gesorteerd van hoogste naar laagste success score</p>
        </div>
        
        <!-- LinkedIn Section -->
        <section class="platform-section">
            {linkedin_table}
        </section>
    </div>
</body>
</html>"""
    
    return html_content

def generate_full_html():
    """Generate complete static HTML page"""
    
    # Process data
    instagram_posts = process_instagram_data()
    linkedin_posts = process_linkedin_data()
    
    # Generate tables
    instagram_table = generate_instagram_table(instagram_posts)
    linkedin_table = generate_linkedin_table(linkedin_posts)
    
    html_content = f"""<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Social Media Posts Overview - GoedUitje.nl</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
            padding: 2rem;
        }}
        
        .container {{
            max-width: 1400px;
            margin: 0 auto;
        }}
        
        .header {{
            text-align: center;
            margin-bottom: 2rem;
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        
        .header h1 {{
            font-size: 2.5rem;
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }}
        
        .platform-section {{
            margin-bottom: 3rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }}
        
        .platform-header {{
            color: white;
            padding: 1.5rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        
        .instagram-header {{
            background: linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%);
        }}
        
        .linkedin-header {{
            background: linear-gradient(135deg, #0077b5 0%, #00a0dc 100%);
        }}
        
        .platform-title {{
            font-size: 1.5rem;
            font-weight: 600;
        }}
        
        .stats-summary {{
            display: flex;
            gap: 2rem;
        }}
        
        .stat-item {{
            text-align: center;
        }}
        
        .stat-value {{
            font-size: 1.2rem;
            font-weight: 700;
        }}
        
        .stat-label {{
            font-size: 0.9rem;
            opacity: 0.9;
        }}
        
        .posts-table {{
            width: 100%;
            border-collapse: collapse;
        }}
        
        .posts-table th {{
            background: #f8f9fa;
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #dee2e6;
            font-size: 0.9rem;
        }}
        
        .posts-table td {{
            padding: 1rem;
            border-bottom: 1px solid #dee2e6;
            vertical-align: top;
        }}
        
        .posts-table tr:hover {{
            background: #f8f9fa;
        }}
        
        .post-text {{
            max-width: 300px;
            line-height: 1.4;
            font-size: 0.9rem;
        }}
        
        .success-score {{
            font-weight: 700;
            padding: 0.5rem;
            border-radius: 6px;
            text-align: center;
            color: white;
            min-width: 60px;
        }}
        
        .score-excellent {{ background: #28a745; }}
        .score-good {{ background: #17a2b8; }}
        .score-average {{ background: #ffc107; color: #333; }}
        .score-poor {{ background: #dc3545; }}
        
        .metric-value {{
            font-weight: 600;
            text-align: center;
        }}
        
        .date-cell {{
            font-size: 0.9rem;
            color: #666;
            white-space: nowrap;
        }}
        
        .post-type {{
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }}
        
        .type-video {{
            background: #e3f2fd;
            color: #1976d2;
        }}
        
        .type-image {{
            background: #f3e5f5;
            color: #7b1fa2;
        }}
        
        .methodology {{
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }}
        
        .methodology h3 {{
            color: #856404;
            margin-bottom: 0.5rem;
        }}
        
        .methodology p {{
            color: #856404;
            font-size: 0.9rem;
            line-height: 1.5;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>Social Media Posts Performance</h1>
            <p>Gedetailleerd overzicht van alle Instagram en LinkedIn posts met success metrics</p>
            <p><small>Gebaseerd op data uit: socials_scrapes/ directory | Gegenereerd: {datetime.datetime.now().strftime('%d-%m-%Y %H:%M')}</small></p>
        </header>
        
        <div class="methodology">
            <h3>📊 Success Score Methodologie</h3>
            <p><strong>Instagram:</strong> Score = (Likes × 1) + (Comments × 5) + (Video Views × 0.1) + (Video Plays × 0.5)<br>
            <strong>LinkedIn:</strong> Score = (Likes × 2) + (Total Reactions × 2) + (Comments × 10) + (Shares × 15)<br>
            <strong>Sorting:</strong> Posts gesorteerd van hoogste naar laagste success score</p>
        </div>
        
        <!-- Instagram Section -->
        <section class="platform-section">
            {instagram_table}
        </section>
        
        <!-- LinkedIn Section -->
        <section class="platform-section">
            {linkedin_table}
        </section>
    </div>
</body>
</html>"""
    
    return html_content

if __name__ == "__main__":
    # Generate separate Instagram and LinkedIn pages
    instagram_html = generate_instagram_page()
    linkedin_html = generate_linkedin_page()
    
    # Write Instagram page
    with open('instagram-posts-overview.html', 'w', encoding='utf-8') as f:
        f.write(instagram_html)
    
    # Write LinkedIn page
    with open('linkedin-posts-overview.html', 'w', encoding='utf-8') as f:
        f.write(linkedin_html)
    
    print("✅ Instagram posts overview generated: instagram-posts-overview.html")
    print("✅ LinkedIn posts overview generated: linkedin-posts-overview.html")