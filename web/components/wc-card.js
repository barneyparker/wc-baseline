/**
 * `<wc-card>` – a simple card container with an optional header slot.
 *
 * Usage:
 * ```html
 * <wc-card>
 *   <div slot="header">Title</div>
 *   <p>Body content</p>
 * </wc-card>
 * ```
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    .card {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      background: #fff;
      overflow: hidden;
    }
    ::slotted([slot="header"]) {
      padding: 0.75rem 1rem;
      font-weight: 600;
      font-size: 0.875rem;
      color: #475569;
      border-bottom: 1px solid #e2e8f0;
      background: #f8fafc;
    }
    .body { padding: 1rem; }
  </style>
  <div class="card">
    <slot name="header"></slot>
    <div class="body"><slot></slot></div>
  </div>
`;

class WCCard extends HTMLElement {
  /** @type {ShadowRoot | null} */
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
  }
}

customElements.define('wc-card', WCCard);
