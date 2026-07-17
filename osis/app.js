document.addEventListener("DOMContentLoaded", () => {
    // Fetch the JSON data
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderAnnouncements(data.announcements);
            renderEvents(data.events);
            initRevealAnimations(); // Initialize animations AFTER cards are rendered
        })
        .catch(error => console.error("Error loading data:", error));

    // Modal Logic
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");
    const closeBtn = document.querySelector(".close-btn");

    closeBtn.onclick = () => { 
        modal.classList.remove('show'); 
        setTimeout(() => { modal.style.display = "none"; }, 300);
    };
    window.onclick = (e) => { 
        if (e.target == modal) {
            modal.classList.remove('show'); 
            setTimeout(() => { modal.style.display = "none"; }, 300);
        }
    };

    // Format Date helper (ID locale)
    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    }

    // Render Announcements
    function renderAnnouncements(announcements) {
        const container = document.getElementById("announcements-grid");
        container.innerHTML = announcements.map(ann => `
            <div class="card reveal">
                <div class="card-content">
                    <span class="card-tag ${ann.urgent ? 'tag-urgent' : 'tag-upcoming'}">
                        ${ann.urgent ? 'Penting!' : 'Info'}
                    </span>
                    <h4>${ann.title}</h4>
                    <span class="card-date">${formatDate(ann.date)}</span>
                    <p>${ann.content}</p>
                </div>
            </div>
        `).join('');
    }

    // Render Events
    function renderEvents(events) {
        const upcomingContainer = document.getElementById("upcoming-events");
        const pastContainer = document.getElementById("past-events");

        const upcoming = events.filter(e => e.status === "upcoming");
        const past = events.filter(e => e.status === "past");

        upcomingContainer.innerHTML = upcoming.map(ev => `
            <div class="card reveal">
                <div class="card-content">
                    <span class="card-tag tag-upcoming">Akan Datang</span>
                    <h4>${ev.title}</h4>
                    <span class="card-date">${formatDate(ev.date)}</span>
                    <p>${ev.description}</p>
                </div>
            </div>
        `).join('');

        pastContainer.innerHTML = past.map(ev => `
            <div class="card reveal">
                <div class="card-content">
                    <span class="card-tag tag-past">Dokumentasi</span>
                    <h4>${ev.title}</h4>
                    <span class="card-date">${formatDate(ev.date)}</span>
                    <p>${ev.description}</p>
                    <button class="btn" onclick='openEventModal(${JSON.stringify(ev).replace(/'/g, "&apos;")})'>
                        Lihat Dokumentasi
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Scroll Reveal Animation Logic
    function initRevealAnimations() {
        const reveals = document.querySelectorAll('.reveal');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add a slight stagger effect for multiple cards in a row
                    setTimeout(() => {
                        entry.target.classList.add('active');
                    }, Array.from(reveals).indexOf(entry.target) % 3 * 100); 
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        reveals.forEach(reveal => {
            observer.observe(reveal);
        });
    }

    // Open Modal with Event Details
    window.openEventModal = (eventData) => {
        let mediaHTML = "";

        // Add Same Day Edit Video if exists
        if (eventData.sameDayEdit) {
            mediaHTML += `
                <h4 style="margin-bottom:10px; color:var(--primary);">Same Day Edit</h4>
                <video controls width="100%" style="border-radius:12px; margin-bottom: 25px;">
                    <source src="${eventData.sameDayEdit}" type="video/mp4">
                    Browser tidak mendukung video.
                </video>
            `;
        }

        // Add Gallery Images
        if (eventData.gallery && eventData.gallery.length > 0) {
            mediaHTML += `<h4 style="margin-bottom:10px; color:var(--primary);">Galeri Foto</h4><div class="gallery-grid">`;
            eventData.gallery.forEach(imgUrl => {
                // Cloudinary dynamic transformation for thumbnails
                let thumbUrl = imgUrl.replace('/upload/', '/upload/c_fill,w_300,h_200,f_auto/');
                let fullImgUrl = imgUrl.replace('/upload/', '/upload/q_auto,f_auto/');
                
                mediaHTML += `<a href="${fullImgUrl}" target="_blank"><img src="${thumbUrl}" alt="Dokumentasi ${eventData.title}"></a>`;
            });
            mediaHTML += `</div>`;
        }

        modalBody.innerHTML = `
            <span class="card-tag tag-past">Dokumentasi</span>
            <h3 style="font-size:1.8rem; margin:10px 0; color:var(--primary);">${eventData.title}</h3>
            <p style="margin-bottom:20px; color:#666; font-weight:600;">${formatDate(eventData.date)}</p>
            ${mediaHTML || '<p>Belum ada dokumentasi tersedia.</p>'}
        `;
        
        modal.style.display = "flex";
        // Slight delay to trigger CSS transition
        setTimeout(() => { modal.classList.add('show'); }, 10);
    }
});
