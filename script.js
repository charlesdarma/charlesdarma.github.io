document.addEventListener('DOMContentLoaded', () => {

    // --- 00. PRELOAD IMAGES ---
    function preloadImages() {
        if (typeof PROJECTS !== 'undefined') {
            PROJECTS.forEach(project => {
                // Preload main image
                const img = new Image();
                img.src = project.image;

                // Preload gallery images
                if (project.gallery && project.gallery.length > 0) {
                    project.gallery.forEach(galleryImg => {
                        const gImg = new Image();
                        gImg.src = galleryImg;
                    });
                }
            });
        }
    }
    // Call immediately
    preloadImages();

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
    const modalClose = document.querySelector('#project-modal .modal-close'); // Explicitly target project modal close

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
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.documentElement.style.overflow = 'hidden'; // Prevent background scrolling on HTML
        document.body.style.overflow = 'hidden'; // Double check for body
    }

    function closeModal() {
        modal.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    // Old click listener removed in favor of unified mousedown/mouseup handler below

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

    // --- 5. CONTACT MODAL ---
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const contactClose = document.querySelector('.contact-close');
    const sendBtn = document.getElementById('send-btn');

    // Helper to get scrollbar width
    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', () => {
            const scrollbarWidth = getScrollbarWidth();
            document.body.style.paddingRight = `${scrollbarWidth}px`;
            contactModal.classList.add('active');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        });

        function closeContactModal() {
            contactModal.classList.remove('active');
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        if (contactClose) contactClose.addEventListener('click', closeContactModal);

        // Close on outside click is handled by the window click listener below, 
        // but we need to update it to check for contactModal as well.
        // Actually, let's just add a specific one or refactor the global one.
        // Let's rely on a new global listener or specific one.
    }

    // Updated Window Click for both modals
    // --- 6. MODAL CLICK HANDLING (FIXED) ---
    // Track where the mouse started
    let isMouseDownOnBackground = false;

    window.addEventListener('mousedown', (e) => {
        const projectModal = document.getElementById('project-modal');
        const contactModal = document.getElementById('contact-modal');

        if (e.target === projectModal || e.target === contactModal) {
            isMouseDownOnBackground = true;
        } else {
            isMouseDownOnBackground = false;
        }
    });

    window.addEventListener('mouseup', (e) => {
        // Only close if we started clicking on background AND ended on background
        if (isMouseDownOnBackground) {
            const projectModal = document.getElementById('project-modal');
            const contactModal = document.getElementById('contact-modal');

            if (e.target === projectModal) {
                // Close project modal
                projectModal.classList.remove('active');
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';
            } else if (e.target === contactModal) {
                // Close contact modal
                if (typeof closeContactModal === 'function') {
                    closeContactModal();
                } else {
                    contactModal.classList.remove('active');
                    document.documentElement.style.overflow = '';
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                }
            }
        }
        // Reset
        isMouseDownOnBackground = false;
    });

    // Send Logic
    function getEmailData() {
        const category = document.getElementById('contact-category').value;
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const desc = document.getElementById('contact-desc').value;

        const subject = `[${category}] Inquiry from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${desc}`;

        return { subject, body };
    }

    // Provider Detection (Gmail, Yahoo, Outlook)
    const contactEmailInput = document.getElementById('contact-email');


    // Default state
    const defaultBtnText = '<span>Send Email</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
    let currentProvider = null;

    if (contactEmailInput && sendBtn) {
        contactEmailInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            let provider = null;

            if (value.includes('@gmail.com')) provider = 'gmail';
            else if (value.includes('@yahoo.com')) provider = 'yahoo';
            else if (value.includes('@outlook.com') || value.includes('@hotmail.com') || value.includes('@live.com')) provider = 'outlook';

            if (provider !== currentProvider) {
                currentProvider = provider;
                if (provider) {
                    updateMainButton(provider);
                } else {
                    // Fade out then reset
                    const btnContent = sendBtn.querySelector('.btn-content');
                    if (btnContent) {
                        btnContent.style.opacity = '0';
                        setTimeout(() => {
                            btnContent.innerHTML = `<span>Send Email</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
                            btnContent.style.opacity = '1';
                        }, 200);
                    }
                }
            } else if (!provider && sendBtn.innerHTML.indexOf('Send via') !== -1) {
                // Double check rollback if text currently has provider info
                const btnContent = sendBtn.querySelector('.btn-content');
                if (btnContent) {
                    btnContent.style.opacity = '0';
                    setTimeout(() => {
                        btnContent.innerHTML = `<span>Send Email</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
                        btnContent.style.opacity = '1';
                    }, 200);
                }
            }
        });

        // Dropdown Arrow Logic
        const categorySelect = document.getElementById('contact-category');
        if (categorySelect) {
            const wrapper = categorySelect.closest('.select-wrapper');
            if (wrapper) {
                categorySelect.addEventListener('focus', () => wrapper.classList.add('active'));
                categorySelect.addEventListener('blur', () => wrapper.classList.remove('active'));
                categorySelect.addEventListener('change', () => wrapper.classList.remove('active'));
                // Also handle click to toggle if focus doesn't catch it correctly (though focus usually does)
            }
        }

        // Click Handler for the Main Button
        sendBtn.addEventListener('click', () => {
            const { subject, body } = getEmailData();

            if (currentProvider) {
                // Provider Specific logic
                const recipient = 'charleskenrickdarma@gmail.com';
                let url = '';

                if (currentProvider === 'gmail') {
                    url = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                } else if (currentProvider === 'yahoo') {
                    url = `https://compose.mail.yahoo.com/?to=${recipient}&subj=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                } else if (currentProvider === 'outlook') {
                    url = `https://outlook.live.com/default.aspx?rru=compose&to=${recipient}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }
                window.open(url, '_blank');
            } else {
                // Default Mailto
                window.location.href = `mailto:charleskenrickdarma@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        });
    }

    function updateMainButton(provider) {
        let text = '';
        let iconSvg = '';

        if (provider === 'gmail') {
            text = 'Send via Gmail';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
        } else if (provider === 'yahoo') {
            text = 'Send via Yahoo Mail';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
        } else if (provider === 'outlook') {
            text = 'Send via Outlook';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
        }

        // Fade out content only
        const btnContent = sendBtn.querySelector('.btn-content');
        if (btnContent) {
            btnContent.style.opacity = '0';

            setTimeout(() => {
                btnContent.innerHTML = `<span>${text}</span>${iconSvg}`;
                // Fade in
                btnContent.style.opacity = '1';
            }, 200);
        } else {
            sendBtn.innerHTML = `<span>${text}</span>${iconSvg}`;
        }
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const { subject, body } = getEmailData();
            window.location.href = `mailto:charleskenrickdarma@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    }


    // Logo Expansion Logic
    // Logo Scroll Logic
    const navLogo = document.getElementById('nav-logo');
    if (navLogo) {
        navLogo.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }


    // --- 7. MOBILE NAVIGATION ---
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileClose = document.querySelector('.mobile-menu-close');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links a');

    if (mobileToggle && navLinks) {
        // OPEN
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            openMenu();
        });

        // CLOSE (X Button)
        if (mobileClose) {
            mobileClose.addEventListener('click', (e) => {
                e.stopPropagation();
                closeMenu();
            });
        }

        // CLOSE (Link Click)
        navLinksItems.forEach(link => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        // CLOSE (Outside Click)
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !mobileToggle.contains(e.target)) {
                closeMenu();
            }
        });
    }

    function openMenu() {
        navLinks.classList.add('active');
        document.body.classList.add('mobile-menu-active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        document.body.classList.remove('mobile-menu-active');
        document.body.style.overflow = '';
    }

});
