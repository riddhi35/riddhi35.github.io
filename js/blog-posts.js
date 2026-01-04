// blog.js - Main Blog Listing Page Functionality

// =============================================
// CONFIGURATION
// =============================================
const CONFIG = {
    postsPerPage: 6,
    jsonFilePath: 'data/blog-posts.json',
    blogPostFolder: 'blogs/'
};

// =============================================
// UTILITY FUNCTIONS
// =============================================

// Format date to display nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Calculate reading time (simplified)
function calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content ? content.length / 5 : 300; // Rough estimate
    return Math.ceil(wordCount / wordsPerMinute);
}

// =============================================
// DATA LOADING
// =============================================

// Load blog data from JSON
async function loadBlogData() {
    try {
        const response = await fetch(CONFIG.jsonFilePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Process posts - add formatted date and reading time if not present
        data.posts = data.posts.map(post => ({
            ...post,
            formattedDate: formatDate(post.date),
            calculatedReadTime: post.readTime || `${calculateReadingTime(post.content)} min read`
        }));
        
        return data;
    } catch (error) {
        console.error('Error loading blog data:', error);
        showErrorMessage();
        return { posts: [], categories: {} };
    }
}

// Show error message if data fails to load
function showErrorMessage() {
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        postsGrid.innerHTML = `
            <div class="error-message">
                <h3>Unable to load blog posts</h3>
                <p>Please check if the data file exists and try again.</p>
                <button onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// =============================================
// DISPLAY FUNCTIONS
// =============================================

// Display featured post
function displayFeaturedPost(post) {
    const featuredSection = document.getElementById('featured-post');
    if (!featuredSection) return;
    
    // Create video HTML if video exists
    let videoHTML = '';
    if (post.video) {
        videoHTML = `
            <div class="video-preview" style="margin: 20px 0;">
                <div class="video-thumbnail" onclick="playFeaturedVideo(this)" 
                     style="background: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('${post.coverImage}');
                            background-size: cover; height: 200px; border-radius: 10px; 
                            display: flex; align-items: center; justify-content: center; cursor: pointer;">
                    <div class="play-button" style="width: 60px; height: 60px; background: #e74c3c; 
                         border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-play" style="color: white; font-size: 24px; margin-left: 5px;"></i>
                    </div>
                </div>
                <div class="video-player" style="display: none; margin-top: 10px;">
                    <video controls style="width:100%; border-radius: 10px;">
                        <source src="${post.video}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        `;
    }
    
    // Create tags HTML
    let tagsHTML = '';
    if (post.tags && post.tags.length > 0) {
        tagsHTML = `
            <div class="tags" style="margin-top: 20px;">
                ${post.tags.map(tag => `<span class="tag" onclick="filterByTag('${tag}')">${tag}</span>`).join(' ')}
            </div>
        `;
    }
    
    featuredSection.innerHTML = `
        <div class="featured-post">
            <img src="${post.coverImage}" alt="${post.title}" class="featured-image">
            <div class="featured-content">
                <div class="post-meta">
                    <span class="category-tag" onclick="filterByCategory('${post.category}')">${post.category}</span>
                    <span>${post.formattedDate || post.date}</span>
                    <span>${post.calculatedReadTime || post.readTime}</span>
                </div>
                <h2>${post.title}</h2>
                <p>${post.excerpt}</p>
                ${videoHTML}
                ${tagsHTML}
                <a href="${CONFIG.blogPostFolder}${post.slug}.html" class="read-more">Read Full Post →</a>
            </div>
        </div>
    `;
}

// Display all posts (with pagination)
function displayAllPosts(posts, page = 1) {
    const postsGrid = document.getElementById('posts-grid');
    if (!postsGrid) return;
    
    // Calculate pagination
    const startIndex = (page - 1) * CONFIG.postsPerPage;
    const endIndex = startIndex + CONFIG.postsPerPage;
    const postsToShow = posts.slice(startIndex, endIndex);
    
    // Display posts
    postsGrid.innerHTML = postsToShow.map(post => `
        <div class="blog-card">
            <img src="${post.coverImage}" alt="${post.title}">
            <div class="card-content">
                <div class="post-meta">
                    <span class="category-tag" onclick="filterByCategory('${post.category}')">${post.category}</span>
                    <span>${post.formattedDate || post.date}</span>
                    <span>${post.calculatedReadTime || post.readTime}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="${CONFIG.blogPostFolder}${post.slug}.html" class="read-more">Read More →</a>
                
                ${post.tags && post.tags.length > 0 ? `
                    <div class="tags" style="margin-top: 15px; font-size: 0.8rem;">
                        ${post.tags.slice(0, 3).map(tag => 
                            `<span class="tag" onclick="filterByTag('${tag}')">${tag}</span>`
                        ).join(' ')}
                        ${post.tags.length > 3 ? `<span class="tag">+${post.tags.length - 3}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Display pagination if needed
    displayPagination(posts.length, page);
}

// Display pagination controls
function displayPagination(totalPosts, currentPage) {
    const totalPages = Math.ceil(totalPosts / CONFIG.postsPerPage);
    if (totalPages <= 1) return;
    
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    let paginationHTML = '<div class="pagination">';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="changePage(${currentPage - 1})" class="page-btn">← Previous</button>`;
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            paginationHTML += `<span class="page-number active">${i}</span>`;
        } else {
            paginationHTML += `<button onclick="changePage(${i})" class="page-number">${i}</button>`;
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="changePage(${currentPage + 1})" class="page-btn">Next →</button>`;
    }
    
    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    const filteredPosts = window.currentFilteredPosts || window.allPosts;
    displayAllPosts(filteredPosts, page);
    
    // Scroll to top of posts
    const postsGrid = document.getElementById('posts-grid');
    if (postsGrid) {
        postsGrid.scrollIntoView({ behavior: 'smooth' });
    }
}

// Display categories with counts
function displayCategories(categories) {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    categoriesList.innerHTML = Object.entries(categories).map(([category, count]) => `
        <li>
            <a href="#" onclick="filterByCategory('${category}'); return false;">
                ${category}
                <span class="count">${count}</span>
            </a>
        </li>
    `).join('');
}

// Display recent posts
function displayRecentPosts(posts) {
    const recentPosts = document.getElementById('recent-posts');
    if (!recentPosts) return;
    
    // Get 3 most recent posts (excluding featured)
    const recent = posts
        .filter(post => !post.featured)
        .slice(0, 3);
    
    recentPosts.innerHTML = recent.map(post => `
        <li>
            <a href="${CONFIG.blogPostFolder}${post.slug}.html">${post.title}</a>
            <span class="recent-date">${post.formattedDate || post.date}</span>
        </li>
    `).join('');
}

// Display tags cloud
function displayTagsCloud(posts) {
    const tagsCloud = document.getElementById('tags-cloud');
    if (!tagsCloud) return;
    
    // Extract and count all tags
    const tagCount = {};
    posts.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        }
    });
    
    // Sort by frequency and take top 15
    const sortedTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    if (sortedTags.length === 0) {
        tagsCloud.innerHTML = '<p>No tags yet</p>';
        return;
    }
    
    tagsCloud.innerHTML = sortedTags.map(([tag, count]) => `
        <a href="#" onclick="filterByTag('${tag}'); return false;" class="tag">
            ${tag}
        </a>
    `).join('');
}

// =============================================
// FILTER FUNCTIONS
// =============================================

// Filter posts by category
function filterByCategory(category) {
    const filteredPosts = window.allPosts.filter(post => 
        post.category === category || post.subcategory === category
    );
    
    window.currentFilteredPosts = filteredPosts;
    displayAllPosts(filteredPosts, 1);
    
    // Update active filter display
    updateActiveFilter(`Category: ${category}`);
    
    // Update URL without reloading
    history.pushState({}, '', `?category=${encodeURIComponent(category)}`);
}

// Filter posts by tag
function filterByTag(tag) {
    const filteredPosts = window.allPosts.filter(post => 
        post.tags && post.tags.includes(tag)
    );
    
    window.currentFilteredPosts = filteredPosts;
    displayAllPosts(filteredPosts, 1);
    
    // Update active filter display
    updateActiveFilter(`Tag: ${tag}`);
    
    // Update URL without reloading
    history.pushState({}, '', `?tag=${encodeURIComponent(tag)}`);
}

// Clear all filters
function clearFilters() {
    window.currentFilteredPosts = null;
    displayAllPosts(window.allPosts, 1);
    
    // Clear active filter display
    updateActiveFilter('');
    
    // Reset URL
    history.pushState({}, '', 'blog.html');
}

// Update active filter display
function updateActiveFilter(filterText) {
    const filterDisplay = document.getElementById('active-filter');
    if (!filterDisplay) return;
    
    if (filterText) {
        filterDisplay.innerHTML = `
            <div class="active-filter">
                <span>${filterText}</span>
                <button onclick="clearFilters()" class="clear-filter">× Clear</button>
            </div>
        `;
        filterDisplay.style.display = 'block';
    } else {
        filterDisplay.style.display = 'none';
    }
}

// Check URL for filters on page load
function checkUrlFilters() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const tag = urlParams.get('tag');
    
    if (category) {
        filterByCategory(category);
    } else if (tag) {
        filterByTag(tag);
    }
}

// =============================================
// VIDEO PLAYER FUNCTION
// =============================================

// Play featured video
function playFeaturedVideo(thumbnail) {
    const videoPlayer = thumbnail.nextElementSibling;
    const video = videoPlayer.querySelector('video');
    
    thumbnail.style.display = 'none';
    videoPlayer.style.display = 'block';
    video.play();
}

// =============================================
// SEARCH FUNCTIONALITY
// =============================================

// Search posts
function searchPosts() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        clearFilters();
        return;
    }
    
    const filteredPosts = window.allPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
        post.category.toLowerCase().includes(searchTerm)
    );
    
    window.currentFilteredPosts = filteredPosts;
    displayAllPosts(filteredPosts, 1);
    
    // Update active filter display
    updateActiveFilter(`Search: "${searchTerm}"`);
}

// Initialize search
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchPosts();
            }
        });
    }
}

// =============================================
// INITIALIZATION
// =============================================

// Initialize blog
async function initBlog() {
    const blogData = await loadBlogData();
    const { posts, categories } = blogData;
    
    // Store posts globally
    window.allPosts = posts;
    
    // Find featured post
    const featuredPost = posts.find(post => post.featured);
    
    // Display content
    if (featuredPost) {
        displayFeaturedPost(featuredPost);
    }
    
    // Display all non-featured posts
    const nonFeaturedPosts = posts.filter(post => !post.featured);
    displayAllPosts(nonFeaturedPosts, 1);
    
    // Display sidebar content
    displayCategories(categories);
    displayRecentPosts(posts);
    displayTagsCloud(posts);
    
    // Initialize search
    initSearch();
    
    // Check for URL filters
    checkUrlFilters();
    
    // Add CSS for additional elements
    addCustomCSS();
}

// Add custom CSS for dynamic elements
function addCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            text-align: center;
            padding: 40px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 10px;
            color: #856404;
        }
        
        .error-message button {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 15px;
        }
        
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            margin: 40px 0;
            padding: 20px;
        }
        
        .page-btn, .page-number {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .page-btn:hover, .page-number:hover {
            background: #f8f9fa;
        }
        
        .page-number.active {
            background: #e74c3c;
            color: white;
            border-color: #e74c3c;
        }
        
        .active-filter {
            background: #e8f4fc;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .clear-filter {
            background: none;
            border: 1px solid #e74c3c;
            color: #e74c3c;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
        }
        
        .clear-filter:hover {
            background: #e74c3c;
            color: white;
        }
        
        .search-box {
            margin-bottom: 30px;
        }
        
        .search-box input {
            width: 100%;
            padding: 12px 20px;
            border: 2px solid #ddd;
            border-radius: 25px;
            font-size: 1rem;
        }
        
        .search-box input:focus {
            outline: none;
            border-color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
}

// =============================================
// EVENT LISTENERS
// =============================================

// Handle browser back/forward buttons
window.addEventListener('popstate', function() {
    checkUrlFilters();
});

// =============================================
// RUN WHEN PAGE LOADS
// =============================================
document.addEventListener('DOMContentLoaded', initBlog);

// Make functions available globally
window.filterByCategory = filterByCategory;
window.filterByTag = filterByTag;
window.clearFilters = clearFilters;
window.changePage = changePage;
window.playFeaturedVideo = playFeaturedVideo;
window.searchPosts = searchPosts;
