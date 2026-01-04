// Get post slug from URL
function getPostSlug() {
    const path = window.location.pathname;
    const filename = path.split('/').pop();
    return filename.replace('.html', '');
}

// Load and display blog post
async function loadBlogPost() {
    const slug = getPostSlug();
    
    try {
        // Load all posts
        const response = await fetch('../data/blog-posts.json');
        const data = await response.json();
        const posts = data.posts;
        
        // Find current post
        const currentPost = posts.find(post => post.slug === slug);
        
        if (!currentPost) {
            document.getElementById('post-content').innerHTML = `
                <h2>Post not found</h2>
                <p>This post doesn't exist or has been removed.</p>
                <a href="../blog.html">← Back to Blog</a>
            `;
            return;
        }
        
        // Set header background
        const header = document.querySelector('.blog-post-header');
        if (header && currentPost.coverImage) {
            header.style.setProperty('--header-bg', `url('../${currentPost.coverImage}')`);
        }
        
        // Display post info
        document.title = `${currentPost.title} | Riddhi's Blog`;
        document.getElementById('post-title').textContent = currentPost.title;
        document.getElementById('post-date').textContent = currentPost.date;
        document.getElementById('post-read-time').textContent = currentPost.readTime;
        document.getElementById('post-category').textContent = currentPost.category;
        
        // Display content
        const contentContainer = document.getElementById('post-content');
        contentContainer.innerHTML = '';
        
        currentPost.content.forEach(item => {
            if (item.type === 'paragraph') {
                const p = document.createElement('p');
                p.className = 'content-paragraph';
                p.textContent = item.text;
                contentContainer.appendChild(p);
            } else if (item.type === 'image') {
                const div = document.createElement('div');
                div.className = 'content-image-container';
                div.innerHTML = `
                    <img src="../${item.src}" alt="${item.caption || ''}" class="content-image">
                    ${item.caption ? `<p class="image-caption">${item.caption}</p>` : ''}
                `;
                contentContainer.appendChild(div);
            } else if (item.type === 'video') {
                const div = document.createElement('div');
                div.className = 'video-container';
                div.innerHTML = `
                    <video controls>
                        <source src="../${item.src}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
                contentContainer.appendChild(div);
            }
        });
        
        // Display tags
        const tagsContainer = document.getElementById('post-tags');
        if (currentPost.tags && currentPost.tags.length > 0) {
            tagsContainer.innerHTML = currentPost.tags.map(tag => 
                `<a href="../blog.html?tag=${tag}" class="tag">${tag}</a>`
            ).join('');
        }
        
        // Find related posts (same category, excluding current)
        const relatedPosts = posts
            .filter(post => 
                post.id !== currentPost.id && 
                post.category === currentPost.category
            )
            .slice(0, 3);
        
        if (relatedPosts.length > 0) {
            displayRelatedPosts(relatedPosts);
        }
        
        // Find previous/next posts
        const currentIndex = posts.findIndex(post => post.id === currentPost.id);
        const prevPost = posts[currentIndex + 1];
        const nextPost = posts[currentIndex - 1];
        
        if (prevPost) {
            document.getElementById('prev-post').href = `../blogs/${prevPost.slug}.html`;
            document.getElementById('prev-post').textContent = `← ${prevPost.title}`;
        }
        
        if (nextPost) {
            document.getElementById('next-post').href = `../blogs/${nextPost.slug}.html`;
            document.getElementById('next-post').textContent = `${nextPost.title} →`;
        }
        
    } catch (error) {
        console.error('Error loading blog post:', error);
    }
}

function displayRelatedPosts(posts) {
    const relatedContainer = document.getElementById('related-posts');
    
    relatedContainer.innerHTML = posts.map(post => `
        <div class="blog-card">
            <img src="../${post.coverImage}" alt="${post.title}">
            <div class="card-content">
                <div class="post-meta">
                    <span class="category-tag">${post.category}</span>
                    <span>${post.date}</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt.substring(0, 100)}...</p>
                <a href="../blogs/${post.slug}.html" class="read-more">Read More →</a>
            </div>
        </div>
    `).join('');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadBlogPost);
