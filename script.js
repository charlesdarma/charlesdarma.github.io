document.addEventListener('DOMContentLoaded', () => {

    // --- 00. PRELOAD IMAGES ---
    function preloadImages() {
        if (typeof PROJECTS !== 'undefined') {
            PROJECTS.forEach(project => {
                const img = new Image();
                img.src = project.image;
                project.cachedGalleryNodes = [];

                if (project.gallery && project.gallery.length > 0) {
                    project.gallery.forEach(imgSrc => {
                        const galleryImg = document.createElement('img');
                        galleryImg.src = imgSrc;
                        galleryImg.alt = project.title;
                        project.cachedGalleryNodes.push(galleryImg);
                    });
                } else {
                    const galleryImg = document.createElement('img');
                    galleryImg.src = project.image;
                    galleryImg.alt = project.title;
                    project.cachedGalleryNodes.push(galleryImg);
                }
            });
        }
    }
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
                charSpan.style.animationDelay = `${(wordIndex * 0.1) + (charIndex * 0.03)}s`;
                wordSpan.appendChild(charSpan);
            });
            heroText.appendChild(wordSpan);
            heroText.appendChild(document.createTextNode(' '));
        });
        heroText.style.opacity = 1;
    }

    // --- 1. GLOBAL LENIS SCOPE ---
    let lenis;
    const scrollIndicator = document.getElementById('scroll-indicator');

    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
            
            // Scroll Indicator Fade Logic
            if (scrollIndicator) {
                if (window.scrollY > 50) {
                    scrollIndicator.classList.remove('visible');
                } else if (window.scrollY < 10) {
                    scrollIndicator.classList.add('visible');
                }
            }
        }
        requestAnimationFrame(raf);
    }

    // Delayed Initial Scroll Indicator
    if (scrollIndicator) {
        setTimeout(() => {
            if (window.scrollY < 100) scrollIndicator.classList.add('visible');
        }, 2000); 

        scrollIndicator.addEventListener('click', () => {
            const workSection = document.getElementById('work');
            if (workSection) {
                if (lenis) lenis.scrollTo(workSection);
                else workSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // --- 2. RENDER PROJECTS ---
    const gallery = document.querySelector('.gallery');
    const modal = document.getElementById('project-modal');
    const videoModal = document.getElementById('video-modal');
    const videoFrame = document.getElementById('video-frame');
    const videoTitle = document.getElementById('video-title');
    const videoDesc = document.getElementById('video-desc');

    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalYear = document.getElementById('modal-year');
    const modalDesc = document.getElementById('modal-desc');
    const modalGallery = document.getElementById('modal-gallery');
    const modalLink = document.getElementById('modal-link');

    if (typeof PROJECTS !== 'undefined' && gallery) {
        gallery.innerHTML = ''; 

        PROJECTS.forEach((project, index) => {
            const article = document.createElement('article');
            article.className = 'work-item';
            article.style.transitionDelay = `${index * 0.1}s`;

            article.innerHTML = `
                <div class="work-link" role="button" tabindex="0" aria-label="View ${project.title}">
                    <div class="work-image" style="background-image: url('${project.image}');"></div>
                    <div class="work-info">
                        <div>
                            <h3 class="work-title">${project.title}</h3>
                            <p class="work-cat">${project.category}</p>
                            <p class="work-desc" style="font-size: 0.9rem; color: var(--accent-color); margin-top: 8px; line-height: 1.4;">${project.description}</p>
                        </div>
                        <p class="work-cat" style="font-weight: 500;">${project.year}</p>
                    </div>
                </div>
            `;

            const workLink = article.querySelector('.work-link');
            workLink.addEventListener('click', () => openModal(project));
            workLink.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal(project);
                }
            });

            gallery.appendChild(article);
        });
    }

    // Modals Handling
    function openVideoModal(project) {
        if (project.embedUrl && videoModal) {
            videoTitle.textContent = project.title;
            videoDesc.textContent = project.description;
            videoFrame.src = project.embedUrl;
            videoModal.classList.add('active');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        }
    }

    function openModal(project) {
        modalTitle.textContent = project.title;
        modalCategory.textContent = project.category;
        modalYear.textContent = project.year;
        modalDesc.innerHTML = project.fullStory || project.description;

        modalLink.onclick = null;
        modalLink.removeAttribute('href');
        modalLink.classList.remove('coming-soon');

        if (project.link === '#' || !project.link) {
            modalLink.textContent = 'Coming Soon';
            modalLink.classList.add('coming-soon');
        } else if (project.type === 'video' && project.embedUrl) {
            modalLink.textContent = 'View Project'; 
            modalLink.style.cursor = 'pointer';
            modalLink.onclick = (e) => {
                e.preventDefault();
                closeModal(); 
                openVideoModal(project); 
            };
        } else {
            modalLink.href = project.link;
            modalLink.textContent = 'View Project';
        }

        modalGallery.innerHTML = '';
        if (project.cachedGalleryNodes && project.cachedGalleryNodes.length > 0) {
            project.cachedGalleryNodes.forEach(node => modalGallery.appendChild(node));
        }

        modal.classList.add('active');
        document.documentElement.style.overflow = 'hidden'; 
        document.body.style.overflow = 'hidden'; 
    }

    function closeModal() {
        if(modal) modal.classList.remove('active');
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
    }
    
    function closeVideoModal() {
        if (videoModal) {
            videoModal.classList.remove('active');
            if (videoFrame) videoFrame.src = ''; 
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
    }

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.closest('#project-modal')) closeModal();
            if (btn.closest('#video-modal')) closeVideoModal();
            if (btn.closest('#contact-modal')) {
                document.getElementById('contact-modal').classList.remove('active');
                document.documentElement.style.overflow = '';
                document.body.style.overflow = '';
            }
        });
    });

    // --- 3. ANIMATIONS (Intersection Observer) ---
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    document.querySelectorAll('.work-item, .about-text p').forEach(item => observer.observe(item));

    // --- 4. THEME TOGGLE ---
    const themeToggle = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        updateIcon(true);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateIcon(isDark);
        });
    }

    function updateIcon(isDark) {
        if (themeToggle) {
            themeToggle.innerHTML = isDark ? 
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>` : 
                `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        }
    }

    // --- 5. CONTACT MODAL & EMAIL LOGIC ---
    const contactBtn = document.getElementById('contact-btn');
    const contactModal = document.getElementById('contact-modal');
    const sendBtn = document.getElementById('send-btn');
    const contactEmailInput = document.getElementById('contact-email');
    let currentProvider = null;

    if (contactBtn && contactModal) {
        contactBtn.addEventListener('click', () => {
            contactModal.classList.add('active');
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        });
    }

    function getEmailData() {
        const category = document.getElementById('contact-category').value;
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const desc = document.getElementById('contact-desc').value;
        return {
            subject: `[${category}] Inquiry from ${name}`,
            body: `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\nMessage:\n${desc}`
        };
    }

    function updateMainButton(provider) {
        let text = '', iconSvg = '';
        if (provider === 'gmail' || provider === 'yahoo') {
            text = `Send via ${provider === 'gmail' ? 'Gmail' : 'Yahoo Mail'}`;
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
        } else if (provider === 'outlook') {
            text = 'Send via Outlook';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
        }

        const btnContent = sendBtn.querySelector('.btn-content');
        if (btnContent) {
            btnContent.style.opacity = '0';
            setTimeout(() => {
                btnContent.innerHTML = `<span>${text}</span>${iconSvg}`;
                btnContent.style.opacity = '1';
            }, 200);
        }
    }

    if (contactEmailInput && sendBtn) {
        contactEmailInput.addEventListener('input', (e) => {
            const value = e.target.value.toLowerCase();
            let provider = null;

            if (value.includes('@gmail.com')) provider = 'gmail';
            else if (value.includes('@yahoo.com')) provider = 'yahoo';
            else if (value.includes('@outlook.com') || value.includes('@hotmail.com') || value.includes('@live.com')) provider = 'outlook';

            if (provider !== currentProvider) {
                currentProvider = provider;
                if (provider) updateMainButton(provider);
                else {
                    const btnContent = sendBtn.querySelector('.btn-content');
                    if (btnContent) {
                        btnContent.style.opacity = '0';
                        setTimeout(() => {
                            btnContent.innerHTML = `<span>Send Email</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
                            btnContent.style.opacity = '1';
                        }, 200);
                    }
                }
            }
        });

        sendBtn.addEventListener('click', () => {
            const { subject, body } = getEmailData();
            const recipient = 'charleskenrickdarma@gmail.com';
            
            if (currentProvider) {
                let url = '';
                if (currentProvider === 'gmail') url = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                else if (currentProvider === 'yahoo') url = `https://compose.mail.yahoo.com/?to=${recipient}&subj=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                else if (currentProvider === 'outlook') url = `https://outlook.live.com/default.aspx?rru=compose&to=${recipient}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                window.open(url, '_blank');
            } else {
                window.location.href = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            }
        });
    }

    // --- 6. BACKGROUND CLICK MODAL CLOSER ---
    let isMouseDownOnBackground = false;
    window.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('modal')) isMouseDownOnBackground = true;
        else isMouseDownOnBackground = false;
    });

    window.addEventListener('mouseup', (e) => {
        if (isMouseDownOnBackground && e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            if (e.target.id === 'video-modal' && videoFrame) videoFrame.src = ''; 
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
        }
        isMouseDownOnBackground = false;
    });

    // --- 7. MOBILE NAVIGATION & ANCHORS ---
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileClose = document.querySelector('.mobile-menu-close');
    const navLinks = document.querySelector('.nav-links');

    function openMenu() {
        if(navLinks) navLinks.classList.add('active');
        document.body.classList.add('mobile-menu-active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if(navLinks) navLinks.classList.remove('active');
        document.body.classList.remove('mobile-menu-active');
        document.body.style.overflow = '';
    }

    if (mobileToggle) mobileToggle.addEventListener('click', (e) => { e.stopPropagation(); openMenu(); });
    if (mobileClose) mobileClose.addEventListener('click', (e) => { e.stopPropagation(); closeMenu(); });

    document.querySelectorAll('a[href^="#"]:not(.modal-link)').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const target = document.querySelector(targetId);
                if (target) {
                    if (lenis) lenis.scrollTo(target);
                    else target.scrollIntoView({ behavior: 'smooth' });
                }
                if (navLinks && navLinks.classList.contains('active')) closeMenu();
            }
        });
    });

    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        if (lenis) lenis.scrollTo(0);
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});
