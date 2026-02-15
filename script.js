// Configuration
const API_URL = 'http://localhost:3000/api';

let courses = [];
let cart = [];
let filteredCategory = 'all';
let currentUser = null;
let currentToken = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    loadCoursesFromAPI();
    loadCartFromStorage();
    updateCartCount();
});

// Check if user is logged in
function checkAuthentication() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        currentUser = JSON.parse(user);
        currentToken = token;
        updateUIForLoggedInUser();
        loadUserPurchases();
    } else {
        updateUIForLoggedOutUser();
    }
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('userMenuBtn').style.display = 'flex';
    document.getElementById('userName').textContent = currentUser.username;

    if (currentUser.role === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('userMenuBtn').style.display = 'none';
    document.getElementById('userDropdown').style.display = 'none';
}

// Toggle user dropdown menu
function toggleUserMenu(e) {
    e.preventDefault();
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

// Logout function
function logout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart_' + (currentUser?.id || 'guest'));
    
    currentUser = null;
    currentToken = null;
    cart = [];
    
    updateUIForLoggedOutUser();
    updateCartCount();
    location.reload();
}

// Load courses from API
async function loadCoursesFromAPI() {
    try {
        const response = await fetch(`${API_URL}/courses`);
        if (!response.ok) throw new Error('Failed to load courses');
        courses = await response.json();
        displayCourses(courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        const coursesGrid = document.getElementById('coursesGrid');
        if (coursesGrid) {
            coursesGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Make sure the server is running! Start it with: node server.js</p>';
        }
    }
}

// Load user purchases
async function loadUserPurchases() {
    if (!currentToken || !currentUser) return;

    try {
        const response = await fetch(`${API_URL}/purchases`, {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayUserPurchases(data.purchases);
        }
    } catch (error) {
        console.error('Error loading purchases:', error);
    }
}

// Display user purchases
function displayUserPurchases(purchases) {
    const container = document.getElementById('purchasesContainer');
    
    if (purchases.length === 0) {
        container.innerHTML = '<p class="login-prompt">You haven\'t purchased any courses yet. <a href="#courses">Browse courses</a></p>';
        return;
    }

    const purchasesHTML = purchases.map(purchase => {
        const course = courses.find(c => c.id === purchase.courseId);
        return `
            <div class="purchase-card">
                <div class="purchase-header">
                    <div class="purchase-header-text">
                        <h3>${purchase.title}</h3>
                        <p>${course ? course.level : 'Course'}</p>
                    </div>
                    <div class="purchase-icon">${course?.icon || '📚'}</div>
                </div>
                <div class="purchase-content">
                    ${course?.description ? `<p>${course.description}</p>` : ''}
                    <p class="purchase-date">📅 Purchased: ${new Date(purchase.purchasedAt).toLocaleDateString()}</p>
                    ${purchase.videoUrl ? `
                        <a href="#" class="access-btn" onclick="viewCourse(${purchase.courseId}); return false;">▶️ Watch Course</a>
                    ` : `
                        <a href="#" class="access-btn" style="background-color: #999; cursor: not-allowed;">⏳ Video Coming Soon</a>
                    `}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="purchases-grid">${purchasesHTML}</div>`;
}

// View purchased course
function viewCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (course) {
        showCourseDetail(course);
    }
}

// Display courses based on filter
function displayCourses(coursesToDisplay) {
    const coursesGrid = document.getElementById('coursesGrid');
    coursesGrid.innerHTML = '';

    coursesToDisplay.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.onclick = () => showCourseDetail(course);
        
        const videoIndicator = course.videoUrl ? '<span style="position: absolute; top: 10px; right: 10px; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">📹 Video</span>' : '';
        const alreadyPurchased = currentUser && currentUser.purchases && currentUser.purchases.find(p => p.courseId === course.id);
        const alreadyPurchasedBadge = alreadyPurchased ? '<span style="position: absolute; top: 10px; left: 10px; background-color: #28a745; color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8rem;">✓ Owned</span>' : '';
        
        courseCard.innerHTML = `
            <div class="course-image" style="position: relative;">
                ${course.icon}
                ${videoIndicator}
                ${alreadyPurchasedBadge}
            </div>
            <div class="course-content">
                <span class="course-category">${capitalizeCategory(course.category)}</span>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-info">
                    <span class="course-level">📚 ${course.level}</span>
                    <span class="course-students">👥 ${course.students}</span>
                </div>
                <div class="course-price">$${course.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${course.id})">${alreadyPurchased ? 'Already Owned' : 'Add to Cart'}</button>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
}

// Filter courses by category
function filterCourses(category) {
    filteredCategory = category;
    
    if (category === 'all') {
        displayCourses(courses);
    } else {
        const filtered = courses.filter(course => course.category === category);
        displayCourses(filtered);
    }
    
    // Scroll to courses section
    document.getElementById('courses').scrollIntoView({ behavior: 'smooth' });
}

// Show course detail modal
function showCourseDetail(course) {
    const modal = document.getElementById('courseModal');
    const courseDetail = document.getElementById('courseDetail');
    
    const videoPlayer = course.videoUrl ? `
        <div style="margin-bottom: 1.5rem; background: #000; border-radius: 8px; overflow: hidden;">
            <video width="100%" height="400" controls style="display: block;">
                <source src="${course.videoUrl}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </div>
    ` : '<p style="text-align: center; color: #999; padding: 2rem; background: #f5f7fa; border-radius: 8px;">📹 Video coming soon...</p>';
    
    courseDetail.innerHTML = `
        ${videoPlayer}
        <h2 class="course-detail-title">${course.title}</h2>
        <span class="course-detail-category">${capitalizeCategory(course.category)}</span>
        <p class="course-detail-description">${course.description}</p>
        <div class="course-detail-price">$${course.price.toFixed(2)}</div>
        <div class="course-detail-info">
            <p><strong>Level:</strong> ${course.level}</p>
            <p><strong>Students Enrolled:</strong> ${course.students}</p>
            <p><strong>Course Duration:</strong> 8-12 weeks</p>
            <p><strong>Certificate:</strong> Yes, upon completion</p>
        </div>
        <button class="modal-add-btn" onclick="addToCart(${course.id}); closeModal();">Add to Cart</button>
    `;
    
    modal.classList.add('show');
}

// Close modal
function closeModal() {
    const modal = document.getElementById('courseModal');
    modal.classList.remove('show');
}

// Add course to cart
function addToCart(courseId) {
    if (!currentUser) {
        alert('Please login first to add courses to cart');
        window.location.href = 'login.html';
        return;
    }

    const course = courses.find(c => c.id === courseId);
    
    // Check if already purchased
    if (currentUser.purchases && currentUser.purchases.find(p => p.courseId === courseId)) {
        alert('You already own this course!');
        return;
    }
    
    // Check if already in cart
    const existingItem = cart.find(item => item.id === courseId);
    if (existingItem) {
        alert('This course is already in your cart!');
        return;
    }
    
    cart.push({...course});
    saveCartToStorage();
    updateCartCount();
    updateCartDisplay();
    
    alert(`${course.title} added to cart!`);
}

// Remove item from cart
function removeFromCart(courseId) {
    cart = cart.filter(item => item.id !== courseId);
    saveCartToStorage();
    updateCartCount();
    updateCartDisplay();
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        updateCartSummary();
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-details">
                <h4>${item.title}</h4>
                <p>${capitalizeCategory(item.category)}</p>
            </div>
            <div class="item-price">$${item.price.toFixed(2)}</div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Update cart count in navbar
function updateCartCount() {
    document.querySelector('.cart-count').textContent = cart.length;
}

// Checkout
async function checkout() {
    if (!currentUser) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ courses: cart.map(c => c.id) })
        });

        const data = await response.json();

        if (response.ok) {
            // Update user purchases in localStorage
            currentUser.purchases = [...(currentUser.purchases || []), ...data.courses];
            localStorage.setItem('user', JSON.stringify(currentUser));

            const total = data.totalWithTax;
            alert(`Thank you for your purchase! Total: $${total.toFixed(2)}\n\nYou will receive a confirmation email shortly.\n\nYour courses are now available in "My Courses" section.`);
            
            cart = [];
            saveCartToStorage();
            updateCartCount();
            updateCartDisplay();
            loadUserPurchases();
            displayCourses(courses);
        } else {
            alert('Purchase failed: ' + data.error);
        }
    } catch (error) {
        alert('Error during checkout: ' + error.message);
    }
}

// Capitalize category name
function capitalizeCategory(category) {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Local Storage functions
function saveCartToStorage() {
    const cartKey = 'cart_' + (currentUser?.id || 'guest');
    localStorage.setItem(cartKey, JSON.stringify(cart));
}

function loadCartFromStorage() {
    const cartKey = 'cart_' + (currentUser?.id || 'guest');
    const saved = localStorage.getItem(cartKey);
    if (saved) {
        cart = JSON.parse(saved);
        updateCartDisplay();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('courseModal');
    if (event.target === modal) {
        closeModal();
    }
}
