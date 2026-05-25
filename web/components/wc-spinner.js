/**
 * `<wc-spinner>` – a CSS-only loading spinner.
 *
 * Usage:
 * ```html
 * <wc-spinner></wc-spinner>
 * ```
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-block; }
    .spinner {
      width: 1.25rem;
      height: 1.25rem;
      border: 2px solid #e2e8f0;
      border-top-color: #2563eb;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <div class="spinner" part="spinner"></div>
`;

class WCSpinner extends HTMLElement {
  /** @type {ShadowRoot | null} */
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }
}

customElements.define('wc-spinner', WCSpinner);
