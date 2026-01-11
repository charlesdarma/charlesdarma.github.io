document.addEventListener('DOMContentLoaded', () => {

    // --- 0. HERO TEXT ANIMATION ---
    const heroText = document.querySelector('.intro-text');
    if (heroText) {
        const text = heroText.textContent.trim();
        const words = text.split(/\s+/);

        heroText.innerHTML = '';

        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-wrap';

            const chars = word.split('');
            chars.forEach((char, charIndex) => {
                const charSpan = document.createElement('span');
                charSpan.className = 'char-reveal';
                charSpan.textContent = char;
                // Stagger delay: wordIndex * 0.1s + charIndex * 0.03s
                charSpan.style.animationDelay = `${(wordIndex * 0.1) + (charIndex * 0.03)}s`;
                wordSpan.appendChild(charSpan);
            });

            heroText.appendChild(wordSpan);
            // Add space
            const space = document.createTextNode(' ');
            heroText.appendChild(space);
        });
    }

    // --- 1. RENDER PROJECTS ---
    const gallery = document.querySelector('.gallery');

    // Modal Elements
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalYear = document.getElementById('modal-year');
    const modalDesc = document.getElementById('modal-desc');
    const modalGallery = document.getElementById('modal-gallery');
    const modalLink = document.getElementById('modal-link');
    const modalClose = document.querySelector('.modal-close');

    if (typeof PROJECTS !== 'undefined' && gallery) {
        gallery.innerHTML = ''; // Clear existing content

        PROJECTS.forEach((project, index) => {
            const article = document.createElement('article');
            article.className = 'work-item';
            article.style.transitionDelay = `${index * 0.1}s`;

            // Note: Changed to div/button triggers instead of direct link for Modal support
            article.innerHTML = `
                <div class="work-link" role="button" tabindex="0">
                    <div class="work-image" style="background-image: url('${project.image}');"></div>
                    <div class="work-info">
                        <div>
                            <h3 class="work-title">${project.title}</h3>
                            <p class="work-cat">${project.category}</p>
                            <p class="work-desc" style="font-size: 0.85rem; color: var(--accent-color); margin-top: 5px;">${project.description}</p>
                        </div>
                        <p class="work-cat">${project.year}</p>
                    </div>
                </div>
            `;

            // Click Handler
            article.querySelector('.work-link').addEventListener('click', () => {
                openModal(project);
            });

            gallery.appendChild(article);
        });
    }

    // Modal Logic
    function openModal(project) {
        modalTitle.textContent = project.title;
        modalCategory.textContent = project.category;
        modalYear.textContent = project.year;
        // Use fullStory if available, fallback to description
        modalDesc.innerHTML = project.fullStory || project.description;
        modalLink.href = project.link;
        modalLink.textContent = project.link === '#' ? 'Coming Soon' : 'View Project';

        // Populate Gallery
        modalGallery.innerHTML = '';
        if (project.gallery && project.gallery.length > 0) {
            project.gallery.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = project.title;
                modalGallery.appendChild(img);
            });
        } else {
            // Fallback to main image
            const img = document.createElement('img');
            img.src = project.image;
            modalGallery.appendChild(img);
        }

        modal.classList.add('active');
        document.documentElement.style.overflow = 'hidden'; // Prevent background scrolling on HTML
        document.documentElement.style.scrollbarGutter = 'auto'; // Remove gutter to kill artifact
        document.body.style.overflow = 'hidden'; // Double check for body
    }

    function closeModal() {
        modal.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.documentElement.style.scrollbarGutter = ''; // Restore gutter (stable)
        document.body.style.overflow = '';
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- 2. ANIMATIONS (Intersection Observer) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.work-item').forEach(item => {
        observer.observe(item);
    });

    // --- 3. SMOOTH SCROLL ---
    document.querySelectorAll('a[href^="#"]:not(.modal-link)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 4. THEME TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Check local storage
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-mode');
        updateIcon(true);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            const isDark = body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcon(isDark);
        });
    }

    function updateIcon(isDark) {
        // Sun icon for light mode (default state is usually showing "switch to dark", so moon?)
        // Let's just swap the SVG content
        if (isDark) {
            // Show Sun (to switch to light)
            themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        } else {
            // Show Moon (to switch to dark)
            themeToggle.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }
    }
});
