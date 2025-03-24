class GlitchText extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.isAnimating = false;
  }

  static get observedAttributes() {
    return ['text', 'font-size', 'font-family', 'font-color', 'background-color', 'animation-speed'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
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
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !this.isAnimating) {
          this.isAnimating = true;
          this.animateWords();
          observer.unobserve(this);
        }
      });
    }, { threshold: 0.1 });
    this.observer.observe(this);
  }

  splitWords(text) {
    const splitedText = text.split(' ');
    let html = '';
    splitedText.forEach((word) => {
      html += `<span class="animated-word" data-text="${word}"></span>&nbsp;`;
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
  }

  render() {
    const text = this.getAttribute('text') || 'Code runs smoothly now.';
    const fontSize = parseFloat(this.getAttribute('font-size')) || 3; // In vw
    const fontFamily = this.getAttribute('font-family') || 'Orbitron';
    const fontColor = this.getAttribute('font-color') || '#FF00FF'; // Magenta
    const backgroundColor = this.getAttribute('background-color') || '#2A1B3D'; // Dark purple
    const animationSpeed = parseFloat(this.getAttribute('animation-speed')) || 10;

    this.isAnimating = false; // Reset on re-render

    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');

        :host {
          width: 100vw;
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: ${backgroundColor};
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

        /* Generate random animation delays */
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
            color: #00FF00; /* Lime green for glitch effect */
          }
          20% {
            opacity: 0;
            color: ${fontColor};
            transform: translateY(0px);
          }
          50% {
            opacity: 1;
            color: #006400; /* Dark green for glitch effect */
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
      <p class="animated-title" aria-label="${text}"></p>
    `;

    this.splitWords(text);
  }
}

customElements.define('glitch-text', GlitchText);
