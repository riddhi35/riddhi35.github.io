// Load blog data from JSON
async function loadBlogData() {
    try {
        const response = await fetch('data/blog-posts.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading blog data:', error);
        return { posts: [], categories: {} };
    }
}

// Display featured post
function displayFeaturedPost(post) {
    const featuredSection = document.getElementById('featured-post');
    
    let videoHTML = '';
    if (post.video) {
        videoHTML = `
            <div class="video-container" style="margin: 20px 0;">
                <video controls style="width:100%; border-radius: 10px;">
                    <source src="${post.video}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>
        `;
    }
    
    featuredSection.innerHTML = `
        <div class="featured-post">
            <img src="${post.coverImage}" alt="${post.title}" class="featured-image">
            <div class="featured-content">
                <div class="post-meta">
                    <span class="category-tag">${post.category}</span>
                    <span>${post.date}</span>
                    <span>${post.readTime}</span>
                </div>
                <h2>${post.title}</h2>
                <p>${post.excerpt}</p>
                ${videoHTML}
                <a href="#" class="read-more">Read Full Post →</a>
                
                <div class="tags" style="margin-top: 20px;">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                </div>
            </div>
        </div>
    `;
}

// Display all posts
function displayAllPosts(posts) {
    const postsGrid = document.getElementById('posts-grid');
    
    // Filter out featured post
    const nonFeaturedPosts = posts.filter(post => !post.featured);
    
    postsGrid.innerHTML = nonFeaturedPosts.map(post => `
        <div class="blog-card">
            <img src="${post.coverImage}" alt="${post.title}">
            <div class="card-content">
                <div class="post-meta">
                    <span class="category-tag">${post.category}</span>
                    <span>${post.date}</span>
                    <span>${post.readTime}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="#" class="read-more">Read More →</a>
                
                <div class="tags" style="margin-top: 15px; font-size: 0.8rem;">
                    ${post.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                </div>
            </div>
        </div>
    `).join('');
}

// Display categories
function displayCategories(categories) {
    const categoriesList = document.getElementById('categories-list');
    
    categoriesList.innerHTML = Object.entries(categories).map(([category, count]) => `
        <li>
            <a href="#">
                ${category}
                <span class="count">${count}</span>
            </a>
        </li>
    `).join('');
}

// Display recent posts
function displayRecentPosts(posts) {
    const recentPosts = document.getElementById('recent-posts');
    
    // Get 3 most recent posts
    const recent = posts.slice(0, 3);
    
    recentPosts.innerHTML = recent.map(post => `
        <li>
            <a href="#">${post.title}</a>
            <span class="recent-date">${post.date}</span>
        </li>
    `).join('');
}

// Display tags cloud
function displayTagsCloud(posts) {
    const tagsCloud = document.getElementById('tags-cloud');
    
    // Extract all tags
    let allTags = [];
    posts.forEach(post => {
        allTags = allTags.concat(post.tags);
    });
    
    // Count tag frequency
    const tagCount = {};
    allTags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
    
    // Display top 15 tags
    const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    tagsCloud.innerHTML = sortedTags.map(([tag, count]) => `
        <a href="#" class="tag">${tag}</a>
    `).join('');
}

// Initialize blog
async function initBlog() {
    const blogData = await loadBlogData();
    const { posts, categories } = blogData;
    
    // Find featured post
    const featuredPost = posts.find(post => post.featured);
    
    if (featuredPost) {
        displayFeaturedPost(featuredPost);
    }
    
    displayAllPosts(posts);
    displayCategories(categories);
    displayRecentPosts(posts);
    displayTagsCloud(posts);
}

// Run when page loads
document.addEventListener('DOMContentLoaded', initBlog);
