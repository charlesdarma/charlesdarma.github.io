
// Sound effects placeholders (optional, can be added later)
// const selectSound = new Audio('select.mp3');

// --- AUDIO CONTROLLER ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const AudioController = {
    playTone: (freq, type, duration) => {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    },

    playSelect: () => {
        AudioController.playTone(800, 'square', 0.1);
    },

    playConfirm: () => {
        // Two-tone rising
        AudioController.playTone(1200, 'square', 0.1);
        setTimeout(() => AudioController.playTone(1600, 'square', 0.2), 100);
    },

    playStart: () => {
        const now = audioCtx.currentTime;
        // Simple scale
        [440, 554, 659, 880].forEach((freq, i) => {
            setTimeout(() => AudioController.playTone(freq, 'square', 0.1), i * 100);
        });
    },

    playWin: () => {
        // Victory jingle
        [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50].forEach((freq, i) => {
            setTimeout(() => AudioController.playTone(freq, 'square', 0.15), i * 150);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // --- INTRO & AUDIO START LOGIC ---
    const introScreen = document.getElementById('intro-screen');
    const introPrompt = document.getElementById('intro-prompt');
    const introEncounter = document.getElementById('intro-encounter');
    const bgm = document.getElementById('bgm');
    const sfxEncounter = document.getElementById('sfx-encounter');

    // Function to start the experience
    const startExperience = () => {
        // 1. Resume Audio Context (for Web Audio API SFX)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        // 2. Play Encounter SFX immediately
        if (sfxEncounter) {
            sfxEncounter.volume = 0.5;
            sfxEncounter.play().catch(e => console.log("SFX Play failed", e));
        }

        // 3. Visual Sequence
        // Hide Prompt / Show Encounter Text
        introPrompt.style.display = 'none';
        introEncounter.style.display = 'block';

        // Optional: Add screen flash effect via CSS class
        introScreen.classList.add('flash-effect');

        // 4. Wait for effect (approx 3 seconds), then start Game
        setTimeout(() => {
            // Fade out intro
            introScreen.style.opacity = '0';

            // Start BGM
            if (bgm) {
                bgm.volume = 0.4;
                bgm.play().catch(e => console.log("BGM Play failed", e));
            }

            // Reveal Game
            setTimeout(() => {
                introScreen.style.display = 'none';
                document.getElementById('game-container').classList.add('fade-in');
            }, 1000);

        }, 2500); // 2.5s delay for the "Encounter" feel before BGM starts

        // Remove listener
        document.removeEventListener('click', startExperience);
        introScreen.removeEventListener('click', startExperience);
    };

    // User must interact to start audio. We bind this to the intro screen click.
    if (introScreen) {
        introScreen.addEventListener('click', startExperience);
    }

    // Fallback: If they click anywhere else first
    // document.addEventListener('click', startExperience); // Optional, but Intro Click is cleaner

    // Floating Elements logic
    setInterval(createFloatingElement, 2000);

    // Audio Mute Toggle Logic Removed

    // --- ANALYTICS COLLECTION ---
    // 1. Device & Browser Info
    document.getElementById('inputDevice').value = navigator.userAgent;
    document.getElementById('inputScreen').value = `${window.screen.width}x${window.screen.height}`;
    document.getElementById('inputLang').value = navigator.language;

    // 2. Fetch IP Address
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('inputIP').value = data.ip;
        })
        .catch(error => {
            console.error('Error fetching IP:', error);
            document.getElementById('inputIP').value = 'Error fetching IP';
        });
});

// Scoring System
const scores = { A: 0, B: 0, C: 0, D: 0 };
const answers = {};
let startTime = 0; // For reaction time tracking

function nextSlide(id) {
    const current = document.querySelector('.slide.active');
    // Handle special slide IDs (strings vs numbers)
    let next;
    if (typeof id === 'string') {
        next = document.getElementById('slide-' + id);
    } else {
        next = document.getElementById('slide' + id);
    }

    if (id === 'result') {
        calculateResult();
    }

    // Start Timer for Proposal
    if (id === 'proposal') {
        startTime = Date.now();
    }

    if (current && next) {
        current.classList.remove('active');
        current.classList.add('exit');

        // Play sound
        AudioController.playSelect();

        setTimeout(() => {
            current.classList.remove('exit'); // Reset content position
            next.classList.add('active');
        }, 300);
    }
}

function selectOption(type, value, scoreType, nextId) {
    // Play sound
    AudioController.playSelect();

    // Determine input field to update and Score
    let inputId = '';
    if (type === 'berry') inputId = 'inputBerry';
    if (type === 'region') inputId = 'inputRegion';
    if (type === 'battle') inputId = 'inputBattle';
    if (type === 'ball') inputId = 'inputBall';

    // Increment Score
    if (scoreType && scores[scoreType] !== undefined) {
        scores[scoreType]++;
    }
    answers[type] = value;

    // Update Hidden Form
    if (inputId) {
        const input = document.getElementById(inputId);
        if (input) input.value = value;
    }

    // Move to next slide
    nextSlide(nextId);
}

function calculateResult() {
    // Determine highest score
    let maxScore = -1;
    let type = 'A';

    for (const [key, value] of Object.entries(scores)) {
        if (value > maxScore) {
            maxScore = value;
            type = key;
        }
    }

    // Fallback or random if tie (just take first max found)

    const titles = {
        'A': 'ACE TRAINER',
        'B': 'POKÉMON RESEARCHER',
        'C': 'POKÉMON BREEDER',
        'D': 'GYM LEADER'
    };

    const descs = {
        'A': 'Ambitious, energetic, and always ready for a challenge!',
        'B': 'Thoughtful, strategic, and always seeking knowledge!',
        'C': 'Caring, patient, and full of love for your friends!',
        'D': 'Confident, bold, and a natural born leader!'
    };

    const icons = {
        'A': '🧢',
        'B': '📚',
        'C': '🥚',
        'D': '⚡'
    };

    document.getElementById('result-title').innerText = titles[type];
    document.getElementById('result-desc').innerText = descs[type];
    document.getElementById('result-icon').innerText = icons[type];

    // Update Hidden Form for Trainer Type
    const trainerInput = document.getElementById('inputTrainerType');
    if (trainerInput) trainerInput.value = titles[type];

    AudioController.playConfirm();
}

function handleResponse(answer) {
    const hiddenInput = document.getElementById('inputAnswer');
    if (hiddenInput) hiddenInput.value = answer.toUpperCase();

    // Calculate Reaction Time
    if (startTime > 0) {
        const elapsed = (Date.now() - startTime) / 1000; // in seconds
        const timeInput = document.getElementById('inputTime');
        if (timeInput) timeInput.value = elapsed.toFixed(2) + ' seconds';
    }

    // Trigger Confetti or Sad scene
    if (answer === 'Yes') {
        AudioController.playWin(); // PROPOSAL ACCEPTED!
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#ff0000', '#ffffff', '#000000', '#ffde00'] // Pokeball colors + Pikachu Yellow
        });

        // Submit Form
        submitForm();

        // Show Success
        document.getElementById('slide-proposal').classList.remove('active');
        document.getElementById('slide-yes').classList.add('active');
    } else {
        AudioController.playSelect(); // Standard sound for No
        // Submit Form anyway
        submitForm();

        // Show Fail
        document.getElementById('slide-proposal').classList.remove('active');
        document.getElementById('slide-no').classList.add('active');
    }
}

function submitForm() {
    const form = document.getElementById('valentineForm');
    if (!form) return;

    const formData = new FormData(form);
    fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).catch(err => console.error('Form submission failed', err));
}

function createFloatingElement() {
    const symbols = ['❤️', '⚡', '🔥', '💧', '🍃', '🔴'];
    const el = document.createElement('div');
    el.classList.add('floating-element');
    el.innerText = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 90 + 5 + 'vw';
    el.style.animationDuration = (Math.random() * 5 + 5) + 's';
    document.body.appendChild(el);

    setTimeout(() => {
        el.remove();
    }, 10000);
}
