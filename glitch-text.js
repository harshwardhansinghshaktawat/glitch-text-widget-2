class GlitchText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
    this.hasAnimated = false; // Track if the animation has ever run
  }

  static get observedAttributes() {
    return [
      'text', 'font-size', 'font-family', 'font-color', 'background-color', 
      'animation-speed', 'heading-tag', 'secondary-glitch-color', 'background-opacity',
      'replay-on-reentry' // New attribute to control whether animation replays when element re-enters viewport
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      // If text changes, we should reset animation state
      if (name === 'text') {
        this.hasAnimated = false;
        this.isAnimating = false;
      }
      this.render();
    }
  }

  connectedCallback() {
    this.render();
    this.handleResize = () => this.render();
    window.addEventListener('resize', this.handleResize);
    this.setupIntersectionObserver();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this.handleResize);
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        // Start animation when element enters viewport
        if (entry.isIntersecting && !this.isAnimating) {
          this.isAnimating = true;
          this.animateWords();
          
          // Check if we should replay animation on re-entry
          const replayOnReentry = this.getAttribute('replay-on-reentry') === 'true';
          if (!replayOnReentry) {
            this.observer.unobserve(this);
          }
        } 
        // Reset animation state when element exits viewport (if replay is enabled)
        else if (!entry.isIntersecting && this.hasAnimated && this.getAttribute('replay-on-reentry') === 'true') {
          this.resetAnimation();
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px' // Trigger slightly before the element is fully visible
    });
    
    // Start observing as soon as the element is connected
    this.observer.observe(this);
  }

  resetAnimation() {
    this.isAnimating = false;
    const animatedWords = this.shadowRoot.querySelectorAll('.animated-word');
    animatedWords.forEach((word) => {
      word.style.opacity = 0;
      word.classList.remove('animate');
    });
  }

  splitWords(text) {
    const splitedText = text.split(' ');
    let html = '';
    splitedText.forEach((word) => {
      html += `<span class="animated-word" data-text="${word}"></span> `;
    });
    this.shadowRoot.querySelector('.animated-title').innerHTML = html;
    this.splitLetters();
  }

  splitLetters() {
    const animatedWords = this.shadowRoot.querySelectorAll('.animated-word');
    animatedWords.forEach((word) => {
      const text = word.getAttribute('data-text');
      let html = '';
      text.split('').forEach((char) => {
        html += `<span class="animated-element" aria-hidden="true">${char}</span>`;
      });
      word.innerHTML = html;
    });
  }

  animateWords() {
    const animatedWords = this.shadowRoot.querySelectorAll('.animated-word');
    animatedWords.forEach((word) => {
      word.style.opacity = 1;
      word.classList.add('animate');
    });
    this.hasAnimated = true; // Mark that animation has run at least once
  }

  render() {
    const text = this.getAttribute('text') || 'Code runs smoothly now.';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 3; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Orbitron';
    const fontColor = this.getAttribute('font-color') || '#FF00FF'; // Magenta
    const backgroundColor = this.getAttribute('background-color') || '#2A1B3D'; // Dark purple
    const animationSpeed = parseFloat(this.getAttribute('animation-speed')) || 10;
    const headingTag = this.getAttribute('heading-tag') || 'p';
    const secondaryGlitchColor = this.getAttribute('secondary-glitch-color') || '#00FF00'; // Lime green
    const backgroundOpacity = parseFloat(this.getAttribute('background-opacity')) || 100; // 0-100
    const bgOpacityValue = backgroundOpacity / 100; // Convert to 0-1
    const bgColorWithOpacity = `${backgroundColor}${Math.round(bgOpacityValue * 255).toString(16).padStart(2, '0')}`; // Hex with alpha

    // Reset animation state on render
    const wasAnimating = this.isAnimating;
    this.isAnimating = false;

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');

        :host {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: ${bgColorWithOpacity};
          overflow: hidden;
        }

        .animated-title {
          color: ${fontColor};
          font-size: ${fontSize}vw;
          margin: 0;
          width: 100%;
          text-align: center;
          font-family: ${fontFamily}, monospace;
          animation: textGlitch 3s ease-in-out infinite alternate;
        }

        .animated-title span {
          display: inline-block;
          min-width: 1rem;
        }

        .animated-word {
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .animate {
          opacity: 1;
        }

        .animate .animated-element {
          opacity: 0;
          transform: translateY(2px);
          animation: displayLetter 0.5s ease-in-out 0.5s forwards alternate;
          letter-spacing: 1px;
        }

        ${Array.from({ length: 100 }, (_, i) => `
          .animate:nth-child(3n+${i + 1}) .animated-element {
            animation-delay: ${Math.random() * animationSpeed / 10}s;
          }
        `).join('')}

        @keyframes displayLetter {
          0% {
            transform: translateY(2px);
            color: ${fontColor};
            opacity: 0;
          }
          10% {
            opacity: 1;
            color: ${secondaryGlitchColor};
          }
          20% {
            opacity: 0;
            color: ${fontColor};
            transform: translateY(0px);
          }
          50% {
            opacity: 1;
            color: #006400; /* Dark green retained as tertiary */
            transform: translateY(1px);
          }
          60% {
            opacity: 1;
            color: ${fontColor};
            transform: translateY(1px);
          }
          100% {
            transform: translateY(0);
            color: ${fontColor};
            opacity: 1;
          }
        }

        @keyframes textGlitch {
          0%, 94% {
            opacity: 1;
            transform: translateX(0px);
          }
          95% {
            opacity: 0.1;
          }
          96% {
            opacity: 1;
            transform: translateX(1px);
          }
          97% {
            opacity: 0.1;
          }
          100% {
            opacity: 1;
            transform: translateX(0px);
          }
        }
      </style>
      <${headingTag} class="animated-title" aria-label="${text}"></${headingTag}>
    `;

    this.splitWords(text);
    
    // Re-establish observation after render
    if (this.observer) {
      this.observer.disconnect();
      this.setupIntersectionObserver();
    }
    
    // If the element was animating before re-render, continue animating
    if (wasAnimating) {
      this.isAnimating = true;
      this.animateWords();
    }
  }
}

customElements.define('glitch-text', GlitchText);
