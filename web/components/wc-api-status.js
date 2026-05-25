/**
 * `<wc-api-status>` – fetches the root API endpoint and displays the
 * JSON response formatted in a `<pre>` block.
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: block; }
    .status {
      width: fit-content;
      margin: 0 auto;
      padding: 1.25rem;
      border: 1px solid #e2e8f0;
      border-radius: 0.375rem;
      background: #fff;
      text-align: left;
    }
    pre {
      margin: 0;
      font-family: ui-monospace, monospace;
      font-size: 0.875rem;
      color: #475569;
    }
    .error { color: #dc2626; }
  </style>
  <div class="status">
    <wc-spinner id="spinner"></wc-spinner>
    <div id="content">
      <pre id="output">Loading...</pre>
    </div>
  </div>
`;

class WCApiStatus extends HTMLElement {
  /** @type {ShadowRoot | null} */
  connectedCallback() {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    this.#fetch();
  }

  /** Calls the API root and renders the response. */
  async #fetch() {
    const spinner = this.shadowRoot.getElementById('spinner');
    const output = this.shadowRoot.getElementById('output');

    try {
      const res = await fetch('/api/v1/');
      const data = await res.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch {
      output.textContent = 'Failed to reach API';
      output.classList.add('error');
    } finally {
      spinner.style.display = 'none';
    }
  }
}

customElements.define('wc-api-status', WCApiStatus);
