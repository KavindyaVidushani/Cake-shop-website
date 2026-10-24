// Cake data with LKR pricing
const foodData = [
    {
        id: 1,
        name: "Chocolate Truffle Cake",
        price: 1500.00,
        category: "chocolate",
        image: "img/chocolate-cake.jpeg",
        description: "Rich, velvety layers of dark chocolate ganache and fudge frosting."
    },
    {
        id: 2,
        name: "Classic Fudge Chocolate Cake",
        price: 2500.00,
        category: "chocolate",
        image: "img/fudge-cake.jpeg",
        description: "Decadent moist chocolate sponge coated in rich chocolate buttercream."
    },
    {
        id: 3,
        name: "Rainbow Birthday Cake",
        price: 2700.00,
        category: "birthday",
        image: "img/birthday-cake.jpeg",
        description: "Colorful multi-layer sponge cake with vanilla buttercream and sprinkles."
    },
    {
        id: 4,
        name: "Red Velvet Celebration Cake",
        price: 3800.00,
        category: "birthday",
        image: "img/red-velvet.jpeg",
        description: "Traditional red velvet sponge layered with smooth cream cheese frosting."
    },
    {
        id: 5,
        name: "Elegant Tiered Wedding Cake",
        price: 15000.00,
        category: "wedding",
        image: "img/wedding-cake.jpeg",
        description: "Exquisite multi-tier floral decorated wedding cake with rich butter icing."
    },
    {
        id: 6,
        name: "White Fondant Wedding Cake",
        price: 18500.00,
        category: "wedding",
        image: "img/fondant-wedding.jpeg",
        description: "Stunning custom fondant wedding cake with delicate sugar flowers."
    }
];

// Cart array
let cart = [];

// DOM Elements
const cartLink = document.getElementById('cartLink');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.querySelector('.cart-count');
const featuredFoods = document.getElementById('featuredFoods');
const checkoutBtn = document.getElementById('checkoutBtn');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    loadCartFromLocalStorage();
    if (featuredFoods) displayFeaturedFoods();
    updateCartUI();
    
    // Event Listeners
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }
    if (closeCart) closeCart.addEventListener('click', closeCartModal);
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            closeCartModal();
        }
    });
});

// Display featured cakes
function displayFeaturedFoods() {
    featuredFoods.innerHTML = '';
    const featuredItems = foodData.slice(0, 3);
    
    featuredItems.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${food.image}" alt="${food.name}">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <span class="price">LKR ${food.price.toLocaleString('en-LK', {minimumFractionDigits: 2})}</span>
                <button class="add-to-cart" data-id="${food.id}">Add to Cart</button>
            </div>
        `;
        featuredFoods.appendChild(foodCard);
    });
    
    attachAddToCartListeners();
}

// Add item to cart
function addToCart(foodId) {
    const food = foodData.find(item => item.id === foodId);
    
    if (food) {
        const existingItem = cart.find(item => item.id === foodId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: food.id,
                name: food.name,
                price: food.price,
                image: food.image,
                quantity: 1
            });
        }
        
        saveCartToLocalStorage();
        updateCartUI();
        alert(`${food.name} added to cart! 🍰`);
    }
}

// Remove item from cart
function removeFromCart(foodId) {
    cart = cart.filter(item => item.id !== foodId);
    saveCartToLocalStorage();
    updateCartUI();
}

// Update item quantity
function updateQuantity(foodId, change) {
    const item = cart.find(item => item.id === foodId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(foodId);
        } else {
            saveCartToLocalStorage();
            updateCartUI();
        }
    }
}

// Update cart UI
function updateCartUI() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;
    
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        if (cartTotal) cartTotal.textContent = '0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="item-info">
                <h4>${item.name}</h4>
                <p class="item-price">LKR ${item.price.toLocaleString('en-LK', {minimumFractionDigits: 2})} each</p>
            </div>
            <div class="item-quantity">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
            </div>
            <p class="item-total">LKR ${itemTotal.toLocaleString('en-LK', {minimumFractionDigits: 2})}</p>
            <button class="remove-item" data-id="${item.id}">×</button>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    if (cartTotal) cartTotal.textContent = total.toLocaleString('en-LK', {minimumFractionDigits: 2});
    
    // Event listeners inside cart
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(parseInt(this.getAttribute('data-id')), -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            updateQuantity(parseInt(this.getAttribute('data-id')), 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            removeFromCart(parseInt(this.getAttribute('data-id')));
        });
    });
}

function openCart() {
    if (cartModal) cartModal.style.display = 'flex';
}

function closeCartModal() {
    if (cartModal) cartModal.style.display = 'none';
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const order = {
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    generateBillPreview(order);
    
    cart = [];
    saveCartToLocalStorage();
    updateCartUI();
    closeCartModal();
}

// Bill preview generator
function generateBillPreview(order) {
    let billContent = `
=====================================
          SWEET DELIGHTS
       ORDER RECEIPT & BILL
=====================================

Date: ${new Date(order.timestamp).toLocaleString()}

Items:
-------------------------------------
`;
    
    order.items.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        billContent += `${item.name}
  Price: LKR ${item.price.toFixed(2)} x ${item.quantity} = LKR ${itemTotal}
-------------------------------------
`;
    });
    
    billContent += `
Total Amount: LKR ${order.total.toFixed(2)}

=====================================
    Thank you for your order!
  Visit us again at Sweet Delights
=====================================
`;
    
    showBillPreview(billContent, order);
}

function showBillPreview(billContent, order) {
    let billModal = document.getElementById('billModal');
    if (!billModal) {
        billModal = document.createElement('div');
        billModal.id = 'billModal';
        billModal.className = 'cart-modal';
        billModal.innerHTML = `
            <div class="cart-content" style="width: 90%; max-width: 700px;">
                <div class="cart-header">
                    <h2>Order Bill Preview</h2>
                    <span class="close-btn" id="closeBill">&times;</span>
                </div>
                <div class="cart-body" style="padding: 20px;">
                    <div id="billPreview"></div>
                    <div class="cart-footer" style="display: flex; gap: 10px; justify-content: center;">
                        <button class="btn-primary" id="downloadTxt" style="background: #28a745;">Download as TXT</button>
                        <button class="btn-primary" id="closeBillBtn">Close</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(billModal);
        
        document.getElementById('closeBill').addEventListener('click', () => billModal.style.display = 'none');
        document.getElementById('closeBillBtn').addEventListener('click', () => billModal.style.display = 'none');
        document.getElementById('downloadTxt').addEventListener('click', () => downloadBillAsTxt(billContent, order));
        
        window.addEventListener('click', (event) => {
            if (event.target === billModal) billModal.style.display = 'none';
        });
    }
    
    document.getElementById('billPreview').textContent = billContent;
    billModal.style.display = 'flex';
}

function downloadBillAsTxt(billContent, order) {
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sweet-delights-bill-${new Date(order.timestamp).getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) cart = JSON.parse(savedCart);
}

// Menu page display & filters
function displayMenuFoods(category = 'all') {
    const menuFoods = document.getElementById('menuFoods');
    if (!menuFoods) return;
    
    menuFoods.innerHTML = '';
    const filteredFoods = category === 'all' 
        ? foodData 
        : foodData.filter(food => food.category === category);
    
    filteredFoods.forEach(food => {
        const foodCard = document.createElement('div');
        foodCard.className = 'food-card';
        foodCard.innerHTML = `
            <img src="${food.image}" alt="${food.name}">
            <div class="food-info">
                <h3>${food.name}</h3>
                <p>${food.description}</p>
                <span class="price">LKR ${food.price.toLocaleString('en-LK', {minimumFractionDigits: 2})}</span>
                <button class="add-to-cart" data-id="${food.id}">Add to Cart</button>
            </div>
        `;
        menuFoods.appendChild(foodCard);
    });
    
    attachAddToCartListeners();
}

function attachAddToCartListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            addToCart(parseInt(this.getAttribute('data-id')));
        });
    });
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            displayMenuFoods(this.getAttribute('data-category'));
        });
    });
}

// Initialize page-specific scripts
if (document.querySelector('.menu-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCartFromLocalStorage();
        updateCartUI();
        displayMenuFoods();
        setupFilterButtons();
    });
}

if (document.querySelector('.about-page') || document.querySelector('.contact-page')) {
    document.addEventListener('DOMContentLoaded', () => {
        loadCartFromLocalStorage();
        updateCartUI();
    });
}

// Contact form handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const contactMessage = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };
        
        const messages = JSON.parse(localStorage.getItem('contactMessages')) || [];
        messages.push(contactMessage);
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        contactForm.reset();
        alert('Thank you for your message! We will get back to you soon.');
    });
}