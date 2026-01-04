// blog-post.js - Individual Blog Post Page Functionality

console.log("✅ blog-post.js loaded successfully!");

// =============================================
// CONFIGURATION
// =============================================
const CONFIG = {
    jsonFilePath: 'data/blog-posts.json',
    relatedPostsCount: 3
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Get post slug from URL filename
function getPostSlug() {
    const path = window.location.pathname;
    const filename = path.split('/').pop(); // Get filename like "first-january-2026.html"
    return filename.replace('.html', ''); // Remove .html to get slug
}

// Format date nicely
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// =============================================
// LOAD AND DISPLAY BLOG POST
// =============================================

async function loadBlogPost() {
    console.log("🔄 Loading blog post...");
    
    const slug = getPostSlug();
    console.log("📄 Post slug:", slug);
    
    if (!slug) {
        showError("No post specified in URL");
        return;
    }
    
    try {
        // Load blog data
        console.log("📂 Loading JSON data from:", CONFIG.jsonFilePath);
        const response = await fetch(`../${CONFIG.jsonFilePath}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load blog data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const posts = data.posts || [];
        console.log("✅ JSON loaded successfully. Total posts:", posts.length);
        
        // Find current post
        const currentPost = posts.find(post => post.slug === slug);
        
        if (!currentPost) {
            showError(`Post not found: ${slug}`);
            return;
        }
        
        console.log("✅ Found post:", currentPost.title);
        
        // Set page title
        document.title = `${currentPost.title} | Riddhi's Blog`;
        
        // Set header background
        setHeaderBackground(currentPost.coverImage);
        
        // Display post information
        displayPostInfo(currentPost);
        
        // Display post content
        displayPostContent(currentPost);
        
        // Display tags
        displayTags(currentPost.tags || []);
        
        // Find and display related posts
        displayRelatedPosts(currentPost, posts);
        
        // Set up navigation between posts
        setupPostNavigation(currentPost, posts);
        
        console.log("🎉 Blog post loaded successfully!");
        
    } catch (error) {
        console.error("❌ Error loading blog post:", error);
        showError(`Failed to load post: ${error.message}`);
    }
}

// =============================================
// DISPLAY FUNCTIONS
// =============================================

// Set header background image
function setHeaderBackground(coverImage) {
    const header = document.querySelector('.blog-post-header');
    if (header && coverImage) {
        header.style.background = `linear-gradient(rgba(44, 62, 80, 0.9), rgba(44, 62, 80, 0.95)), url('../${coverImage}')`;
        header.style.backgroundSize = 'cover';
        header.style.backgroundPosition = 'center';
    }
}

// Display post information
function displayPostInfo(post) {
    const elements = {
        'post-title': post.title,
        'post-date': formatDate(post.date),
        'post-read-time': post.readTime || '2 min read',
        'post-category': post.category || 'Uncategorized'
    };
    
    for (const [id, content] of Object.entries(elements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }
}

// Display post content
function displayPostContent(post) {
    const contentContainer = document.getElementById('post-content');
    if (!contentContainer) return;
    
    let contentHTML = '';
    
    // If post has structured content array, use it
    if (post.content && Array.isArray(post.content)) {
        post.content.forEach(item => {
            if (item.type === 'paragraph') {
                contentHTML += `<p class="content-paragraph">${item.text}</p>`;
            } else if (item.type === 'image') {
                contentHTML += `
                    <div class="content-image-container">
                        <img src="../${item.src}" alt="${item.caption || ''}" class="content-image">
                        ${item.caption ? `<p class="image-caption">${item.caption}</p>` : ''}
                    </div>
                `;
            } else if (item.type === 'video' && item.src) {
                contentHTML += `
                    <div class="video-container">
                        <video controls>
                            <source src="../${item.src}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            }
        });
    } 
    // Fallback: Use excerpt or placeholder text
    else {
        contentHTML = `
            <p class="content-paragraph">${post.excerpt || 'No content available for this post.'}</p>
            ${post.video ? `
                <div class="video-container">
                    <h3>Watch the video:</h3>
                    <video controls>
                        <source src="../${post.video}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            ` : ''}
            <p class="content-paragraph">Full content coming soon...</p>
        `;
    }
    
    contentContainer.innerHTML = contentHTML;
}

// Display tags
function displayTags(tags) {
    const tagsContainer = document.getElementById('post-tags');
    if (!tagsContainer) return;
    
    if (!tags || tags.length === 0) {
        tagsContainer.innerHTML = '<p>No tags for this post.</p>';
        return;
    }
    
    tagsContainer.innerHTML = tags.map(tag => 
        `<a href="../blog.html?tag=${encodeURIComponent(tag)}" class="tag">${tag}</a>`
    ).join('');
}

// Display related posts
function displayRelatedPosts(currentPost, allPosts) {
    const relatedContainer = document.getElementById('related-posts');
    if (!relatedContainer) return;
    
    // Find related posts (same category, exclude current post)
    const relatedPosts = allPosts
        .filter(post => 
            post.id !== currentPost.id && 
            post.category === currentPost.category
        )
        .slice(0, CONFIG.relatedPostsCount);
    
    if (relatedPosts.length === 0) {
        relatedContainer.innerHTML = '<p>No related posts found.</p>';
        return;
    }
    
    let relatedHTML = '<h2>Related Posts</h2><div class="related-grid">';
    
    relatedPosts.forEach(post => {
        relatedHTML += `
            <div class="blog-card">
                <img src="../${post.coverImage || 'images/IMG_20230216_150120.jpg'}" alt="${post.title}">
                <div class="card-content">
                    <div class="post-meta">
                        <span class="category-tag">${post.category}</span>
                        <span>${formatDate(post.date)}</span>
                    </div>
                    <h3>${post.title}</h3>
                    <p>${post.excerpt?.substring(0, 100) || 'Read more...'}...</p>
                    <a href="${post.slug}.html" class="read-more">Read More →</a>
                </div>
            </div>
        `;
    });
    
    relatedHTML += '</div>';
    relatedContainer.innerHTML = relatedHTML;
}

// Set up navigation between posts
function setupPostNavigation(currentPost, allPosts) {
    const currentIndex = allPosts.findIndex(post => post.id === currentPost.id);
    
    // Previous post
    const prevPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;
    const prevLink = document.getElementById('prev-post');
    if (prevLink && prevPost) {
        prevLink.href = `${prevPost.slug}.html`;
        prevLink.textContent = `← ${prevPost.title}`;
        prevLink.style.display = 'block';
    } else if (prevLink) {
        prevLink.style.display = 'none';
    }
    
    // Next post
    const nextPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const nextLink = document.getElementById('next-post');
    if (nextLink && nextPost) {
        nextLink.href = `${nextPost.slug}.html`;
        nextLink.textContent = `${nextPost.title} →`;
        nextLink.style.display = 'block';
    } else if (nextLink) {
        nextLink.style.display = 'none';
    }
}

// =============================================
// ERROR HANDLING
// =============================================

function showError(message) {
    const contentContainer = document.getElementById('post-content') || document.body;
    
    const errorHTML = `
        <div class="error-container">
            <h2>⚠️ Something went wrong</h2>
            <p>${message}</p>
            <div class="error-actions">
                <button onclick="location.reload()" class="btn-retry">⟳ Try Again</button>
                <a href="../blog.html" class="btn-back">← Back to Blog</a>
            </div>
        </div>
    `;
    
    if (contentContainer.id === 'post-content') {
        contentContainer.innerHTML = errorHTML;
    } else {
        const main = document.querySelector('main') || document.body;
        main.innerHTML = errorHTML;
    }
    
    // Add error CSS if not already present
    addErrorCSS();
}

function addErrorCSS() {
    if (document.querySelector('#error-css')) return;
    
    const style = document.createElement('style');
    style.id = 'error-css';
    style.textContent = `
        .error-container {
            text-align: center;
            padding: 60px 20px;
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .error-container h2 {
            color: #e74c3c;
            margin-bottom: 20px;
        }
        
        .error-container p {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1rem;
        }
        
        .error-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .btn-retry, .btn-back {
            padding: 12px 25px;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
        }
        
        .btn-retry {
            background: #e74c3c;
            color: white;
        }
        
        .btn-retry:hover {
            background: #c0392b;
        }
        
        .btn-back {
            background: #3498db;
            color: white;
        }
        
        .btn-back:hover {
            background: #2980b9;
        }
    `;
    document.head.appendChild(style);
}

// =============================================
// VIDEO PLAYER ENHANCEMENTS
// =============================================

function enhanceVideoPlayers() {
    document.querySelectorAll('video').forEach(video => {
        // Add custom controls
        video.addEventListener('play', function() {
            this.parentElement.classList.add('playing');
        });
        
        video.addEventListener('pause', function() {
            this.parentElement.classList.remove('playing');
        });
    });
}

// =============================================
// INITIALIZATION
// =============================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM loaded, starting blog post...");
    
    // Start loading the post
    loadBlogPost();
    
    // Enhance video players
    setTimeout(enhanceVideoPlayers, 1000);
});

// =============================================
// GLOBAL EXPORTS (for debugging)
// =============================================

// Make functions available in console for debugging
window.debugBlogPost = {
    getPostSlug,
    reload: loadBlogPost,
    showError
};

console.log("🚀 Blog post script ready!");
