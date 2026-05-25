/**
 * `<wc-footer>` – site-wide footer displaying copyright.
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; border-top: 1px solid #e2e8f0; background: #fff; }
    footer {
      max-width: 48rem;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.8125rem;
    }
  </style>
  <footer>
    <p>&copy; <span id="year"></span> WC Baseline &mdash; Built with Web Components</p>
  </footer>
`;

class WCFooter extends HTMLElement {
  /** @type {ShadowRoot | null} */
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    this.shadowRoot.getElementById('year').textContent = String(new Date().getFullYear());
  }
}

customElements.define('wc-footer', WCFooter);
