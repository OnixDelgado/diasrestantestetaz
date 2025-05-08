document.addEventListener('DOMContentLoaded', function() {
    // Configuración de la fecha de finalización
    const endDate = new Date('2025-12-10T00:00:00-03:00').getTime();
    
    // Elementos del DOM
    const counterElement = document.getElementById('counter');
    const photoElement = document.getElementById('diputado-photo');
    const confettiCanvas = document.getElementById('confetti-canvas');
    const timeDetailElement = document.createElement('div');
    timeDetailElement.className = 'time-detail';
    counterElement.parentNode.insertBefore(timeDetailElement, counterElement.nextSibling);
    
    // Elementos multimedia
    const celebrationVideo = document.getElementById('celebration-video');
    const videoControls = document.getElementById('video-controls');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const restartBtn = document.getElementById('restart-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeControl = document.getElementById('volume-control');
    let isVideoPlaying = false;
    let userPaused = false;
    let hasCelebrationStarted = false;



    // Precargar y configurar video con valores de localStorage o por defecto
    celebrationVideo.volume = localStorage.getItem('videoVolume') ? parseFloat(localStorage.getItem('videoVolume')) : 0.7;
    celebrationVideo.muted = localStorage.getItem('videoMuted') === 'true';
    celebrationVideo.loop = true;

    // Función para calcular tiempo restante
    function getTimeRemaining() {
        const now = new Date().getTime();
        const distance = endDate - now;
        
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        return {
            total: distance,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
            roundedDays: (hours > 0 || minutes > 0 || seconds > 0) ? days + 1 : days
        };
    }

    // Actualizar contador
    function updateCounter() {
        const time = getTimeRemaining();
        
        if (time.total <= 0) {
            counterElement.textContent = '0';
            timeDetailElement.textContent = '00:00:00';
            startCelebration();
            return;
        }
        
        counterElement.textContent = time.roundedDays;
        timeDetailElement.textContent = `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
    }

    // Función de celebración
    function startCelebration() {
        if (hasCelebrationStarted) return;
        hasCelebrationStarted = true;
        
        // Mostrar el video de fondo
        celebrationVideo.style.display = 'block';
        celebrationVideo.style.opacity = '0.3';
        celebrationVideo.style.zIndex = '-1';
        
        // Confeti
        confettiCanvas.style.display = 'block';
        startConfetti();
        
        // Mostrar controles
        videoControls.style.display = 'flex';
        
        // Estilo del contador
        counterElement.style.fontSize = '10rem';
        counterElement.style.color = '#27ae60';
        
        // Mensaje de celebración
        let celebrationMessage = document.querySelector('.celebration');
        if (!celebrationMessage) {
            celebrationMessage = document.createElement('div');
            celebrationMessage.className = 'celebration';
            celebrationMessage.textContent = '¡AFUERA!';
            celebrationMessage.style.fontWeight = 'bold';
            document.querySelector('.counter-container').appendChild(celebrationMessage);
        }
        celebrationMessage.style.display = 'block';
    
        // Solo reproducir automáticamente si el usuario no lo pausó
        if (!userPaused) {
            attemptAutoPlay();
            isVideoPlaying = true;
        }
    }
    

    function attemptAutoPlay() {
        // Cargar preferencias de mute primero
        const savedMuted = localStorage.getItem('videoMuted') === 'true';
        celebrationVideo.muted = savedMuted;
        
        const playPromise = celebrationVideo.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                document.querySelector('.audio-play-button')?.remove();
            })
            .catch(error => {
                celebrationVideo.muted = true;
                celebrationVideo.play()
                    .then(() => {
                        setTimeout(() => {
                            celebrationVideo.muted = savedMuted;
                        }, 1000);
                    })
                    .catch(e => {
                        showFallbackButton();
                    });
            });
        }
    }

    function showFallbackButton() {
        if (document.querySelector('.audio-play-button')) return;
        
        const manualBtn = document.createElement('button');
        manualBtn.className = 'audio-play-button';
        manualBtn.textContent = '▶ Activar celebración completa';
        manualBtn.style.position = 'fixed';
        manualBtn.style.bottom = '80px';
        manualBtn.style.left = '20px';
        manualBtn.style.zIndex = '1002';
        
        manualBtn.onclick = () => {
            celebrationVideo.play()
                .then(() => manualBtn.remove())
                .catch(e => {
                    manualBtn.textContent = '❌ Click para activar';
                    console.error("Error al reproducir:", e);
                });
        };
        
        document.body.appendChild(manualBtn);
    }

    function startConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const confettiSettings = { particleCount: 150, spread: 70, origin: { y: 0.6 } };
        const duration = 10 * 1000;
        const animationEnd = Date.now() + duration;
        
        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            
            confetti({
                ...confettiSettings,
                particleCount: 50 * (timeLeft / duration),
                origin: { x: Math.random(), y: Math.random() }
            });
        }, 250);
    }

    function init() {
        // Configurar controles de video
        playPauseBtn.addEventListener('click', () => {
            if (isVideoPlaying) {
                celebrationVideo.pause();
                playPauseBtn.textContent = '⏯️';
            } else {
                celebrationVideo.play()
                    .then(() => playPauseBtn.textContent = '⏸️')
                    .catch(e => console.error("Error al reproducir:", e));
            }
            isVideoPlaying = !isVideoPlaying;
        });
        
        restartBtn.addEventListener('click', () => {
            celebrationVideo.currentTime = 0;
            if (isVideoPlaying) celebrationVideo.play();
        });
        
        // Configurar mute y volumen con localStorage
        muteBtn.addEventListener('click', () => {
            celebrationVideo.muted = !celebrationVideo.muted;
            muteBtn.textContent = celebrationVideo.muted ? '🔇' : '🔊';
            localStorage.setItem('videoMuted', celebrationVideo.muted.toString());
            
            if (celebrationVideo.muted) {
                localStorage.setItem('lastVolume', volumeControl.value);
                volumeControl.value = 0;
            } else {
                const lastVolume = localStorage.getItem('lastVolume') || '0.7';
                volumeControl.value = lastVolume;
                celebrationVideo.volume = parseFloat(lastVolume);
            }
        });
        
        volumeControl.addEventListener('input', () => {
            celebrationVideo.volume = volumeControl.value;
            celebrationVideo.muted = (volumeControl.value == 0);
            muteBtn.textContent = (volumeControl.value == 0) ? '🔇' : '🔊';
            
            localStorage.setItem('videoVolume', volumeControl.value);
            localStorage.setItem('videoMuted', celebrationVideo.muted.toString());
        });
        
        // Sincronizar controles con estado inicial
        volumeControl.value = celebrationVideo.volume;
        muteBtn.textContent = celebrationVideo.muted ? '🔇' : '🔊';
        
        // Precargar video
        celebrationVideo.load();
        
        // Iniciar contador
        updateCounter();
        setInterval(updateCounter, 1000);
        
        // Manejar redimensionamiento para móviles
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 600) {
                document.body.style.overflow = 'auto';
            }
        });
    }

    init();
});