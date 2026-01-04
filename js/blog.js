// blog.js - SIMPLIFIED WORKING VERSION
console.log("Blog.js is loading...");

async function loadBlogData() {
    try {
        console.log("Attempting to load blog data...");
        
        // Test if the file exists
        const response = await fetch('data/blog-posts.json');
        
        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`);
            showError("Could not load blog data file. Please check if 'data/blog-posts.json' exists.");
            return null;
        }
        
        const data = await response.json();
        console.log("Blog data loaded successfully:", data);
        return data;
        
    } catch (error) {
        console.error("Error loading blog data:", error);
        showError("Failed to load blog posts. Please check console for details.");
        return null;
    }
}

function showError(message) {
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 40px; background: #fff3cd; border-radius: 10px; margin: 20px;">
                <h3>⚠️ Loading Error</h3>
                <p>${message}</p>
                <p><small>Check browser console (F12) for details</small></p>
            </div>
        `;
    }
}

function displayPosts(posts) {
    console.log("Displaying posts:", posts);
    
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) {
        console.error("Cannot find #posts-grid element!");
        return;
    }
    
    if (!posts || posts.length === 0) {
        postsGrid.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>No posts yet</h3>
                <p>Add your first blog post!</p>
            </div>
        `;
        return;
    }
    
    postsGrid.innerHTML = posts.map(post => `
        <div class="blog-card" style="background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1);">
            <img src="${post.coverImage || 'images/IMG_20230216_150120.jpg'}" 
                 alt="${post.title}" 
                 style="width: 100%; height: 200px; object-fit: cover;">
            <div style="padding: 20px;">
                <div style="display: flex; gap: 15px; margin-bottom: 10px; color: #777; font-size: 0.9rem;">
                    <span style="background: #e74c3c; color: white; padding: 3px 10px; border-radius: 15px;">
                        ${post.category || 'Uncategorized'}
                    </span>
                    <span>${post.date || 'No date'}</span>
                    <span>${post.readTime || '2 min read'}</span>
                </div>
                <h3 style="font-family: 'Playfair Display', serif; margin: 10px 0; color: #2c3e50;">
                    ${post.title || 'Untitled Post'}
                </h3>
                <p style="color: #555; margin: 10px 0;">
                    ${post.excerpt || 'No excerpt available...'}
                </p>
                <a href="blogs/${post.slug || 'post'}.html" 
                   style="color: #e74c3c; text-decoration: none; font-weight: 500; display: inline-block; margin-top: 15px;">
                    Read More →
                </a>
            </div>
        </div>
    `).join('');
}

async function initBlog() {
    console.log("Initializing blog...");
    
    const blogData = await loadBlogData();
    
    if (!blogData) {
        console.log("No blog data loaded");
        return;
    }
    
    // Display all posts
    displayPosts(blogData.posts || []);
    
    console.log("Blog initialization complete!");
}

// Start when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, starting blog...");
    initBlog();
});
