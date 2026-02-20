// script.js
document.addEventListener('DOMContentLoaded', function () {
    // Handle login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (username && password) {
                alert('Login successful! Redirecting...');
                // In a real app, you would redirect here:
                // window.location.href = 'dashboard.html';
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Handle banner toggle functionality
    const banner = document.querySelector('.vertical-banner');
    const toggle = document.querySelector('.banner-toggle');
    if (banner && toggle) {
        // Ensure initial state is "open"
        banner.classList.remove('collapsed');
        document.body.classList.remove('banner-collapsed');
        toggle.setAttribute('aria-expanded', 'true');

        toggle.addEventListener('click', function (e) {
            e.stopPropagation();
            const isCollapsed = banner.classList.toggle('collapsed');
            document.body.classList.toggle('banner-collapsed', isCollapsed);
            toggle.setAttribute('aria-expanded', String(!isCollapsed));
        });
    }

    // Handle submenu toggle
    const submenuToggle = document.querySelector('.submenu-toggle');
    if (submenuToggle) {
        submenuToggle.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent the link from navigating
            const parent = this.parentElement;
            parent.classList.toggle('open');
        });
    }

    // Handle visitor statistics
    function updateVisitorStats() {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

        let stats = JSON.parse(localStorage.getItem('visitorStats')) || {
            lifetime: 0,
            today: 0,
            lastVisitDate: '',
            monthly: 0,
            lastVisitMonth: ''
        };

        // Increment lifetime visitors on every visit
        stats.lifetime += 1;

        // Handle daily visitors
        if (stats.lastVisitDate !== today) {
            stats.today = 1; // Reset for the new day
            stats.lastVisitDate = today;
        } else {
            stats.today += 1;
        }

        // Handle monthly visitors
        if (stats.lastVisitMonth !== currentMonth) {
            stats.monthly = 1; // Reset for the new month
            stats.lastVisitMonth = currentMonth;
        } else {
            stats.monthly += 1;
        }

        localStorage.setItem('visitorStats', JSON.stringify(stats));

        // Update the UI
        document.getElementById('lifetime-visitors-count').textContent = stats.lifetime;
        document.getElementById('todays-visitors-count').textContent = stats.today;
        document.getElementById('monthly-visitors-count').textContent = stats.monthly;
    }

    // Simulate 'Active Now' users
    const activeNowEl = document.getElementById('active-now-count');
    if (activeNowEl) {
        let activeUsers = 1;
        activeNowEl.textContent = activeUsers;
        setInterval(() => {
            const change = Math.random() < 0.5 ? 1 : -1;
            activeUsers = Math.max(1, activeUsers + change); // Ensure it doesn't go below 1
            activeNowEl.textContent = activeUsers;
        }, 3000 + Math.random() * 2000); // Update at random intervals
    }

    // Initial call to update stats on page load
    updateVisitorStats();
});