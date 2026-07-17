document.addEventListener("DOMContentLoaded", () => {
    // Fetch the JSON data
    fetch('../data/data.json') // Adjust path if needed depending on folder structure
        .then(response => response.json())
        .then(data => {
            renderAnnouncements(data.announcements);
            renderEvents(data.events);
        })
        .catch(error => console.error("Error loading data:", error));

    // Modal Logic
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");
    const closeBtn = document.querySelector(".close-btn");

    closeBtn.onclick = () => { modal.style.display = "none"; };
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    // Format Date helper (ID locale)
    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('id-ID', options);
    }

    // Render Announcements
    function renderAnnouncements(announcements) {
        const container = document.getElementById("announcements-grid");
        container.innerHTML = announcements.map(ann => `
            <div class="card">
                <div class="card-content">
                    <span class="card-tag ${ann.urgent ? 'tag-urgent' : 'tag-upcoming'}">
                        ${ann.urgent ? 'Penting!' : 'Info'}
                    </span>
                    <h4>${ann.title}</h4>
                    <p class="card-date">${formatDate(ann.date)}</p>
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
            <div class="card">
                <div class="card-content">
                    <span class="card-tag tag-upcoming">Akan Datang</span>
                    <h4>${ev.title}</h4>
                    <p class="card-date">${formatDate(ev.date)}</p>
                    <p>${ev.description}</p>
                </div>
            </div>
        `).join('');

        pastContainer.innerHTML = past.map(ev => `
            <div class="card">
                <div class="card-content">
                    <span class="card-tag tag-past">Dokumentasi</span>
                    <h4>${ev.title}</h4>
                    <p class="card-date">${formatDate(ev.date)}</p>
                    <p>${ev.description}</p>
                    <button class="btn" onclick='openEventModal(${JSON.stringify(ev).replace(/'/g, "&apos;")})'>
                        Lihat Dokumentasi
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Open Modal with Event Details
    window.openEventModal = (eventData) => {
        let mediaHTML = "";

        // Add Same Day Edit Video if exists
        if (eventData.sameDayEdit) {
            mediaHTML += `
                <h4>Same Day Edit</h4>
                <video controls width="100%" style="border-radius:8px; margin-bottom: 15px;">
                    <source src="${eventData.sameDayEdit}" type="video/mp4">
                    Browser tidak mendukung video.
                </video>
            `;
        }

        // Add Gallery Images
        if (eventData.gallery && eventData.gallery.length > 0) {
            mediaHTML += `<h4>Galeri Foto</h4><div class="gallery-grid">`;
            eventData.gallery.forEach(imgUrl => {
                // Cloudinary transformation for thumbnails (150px width, auto format)
                let thumbUrl = imgUrl.replace('/upload/', '/upload/c_fill,w_300,h_200,f_auto/');
                let fullImgUrl = imgUrl.replace('/upload/', '/upload/q_auto,f_auto/');
                
                mediaHTML += `<a href="${fullImgUrl}" target="_blank"><img src="${thumbUrl}" alt="Dokumentasi ${eventData.title}"></a>`;
            });
            mediaHTML += `</div>`;
        }

        modalBody.innerHTML = `
            <h3>${eventData.title}</h3>
            <p style="margin-bottom:15px; color:#555;">${formatDate(eventData.date)}</p>
            ${mediaHTML || '<p>Belum ada dokumentasi tersedia.</p>'}
        `;
        modal.style.display = "flex";
    }
});
