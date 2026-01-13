/**
 * Manages the news panel UI for displaying city news stories
 */
export class NewsPanel {
  constructor() {
    this.container = document.getElementById('news-panel');
    this.content = this.container?.querySelector('.news-content');
    this.toggleButton = this.container?.querySelector('.news-toggle');
    this.collapsed = false;

    this.#setupEventListeners();
  }

  addStory(story) {
    if (!this.content) return;

    const storyElement = this.#createStoryElement(story);
    this.content.insertBefore(storyElement, this.content.firstChild);

    // Fade-in animation
    storyElement.style.animation = 'slideIn 0.3s ease-out';
  }

  #createStoryElement(story) {
    const div = document.createElement('div');
    div.className = 'news-story';
    div.dataset.category = story.category;
    div.dataset.read = story.read;
    div.dataset.storyId = story.id;

    div.innerHTML = `
      <div class="news-story-header">
        <span class="news-icon">${story.icon}</span>
        <span class="news-category">${story.category.toUpperCase()}</span>
        <span class="news-date">${story.dateString}</span>
      </div>
      <h3 class="news-headline">${story.headline}</h3>
      <p class="news-body">${story.body}</p>
      <div class="news-byline">— ${story.reporter}, ${story.reporterTitle}</div>
    `;

    div.addEventListener('click', () => this.#markStoryAsRead(story.id));

    return div;
  }

  #markStoryAsRead(storyId) {
    const storyElement = this.content.querySelector(`[data-story-id="${storyId}"]`);
    if (storyElement) {
      storyElement.dataset.read = 'true';
    }
  }

  #setupEventListeners() {
    this.toggleButton?.addEventListener('click', () => this.toggle());
  }

  toggle() {
    if (!this.content) return;

    this.collapsed = !this.collapsed;
    this.content.style.display = this.collapsed ? 'none' : 'block';
    this.toggleButton.textContent = this.collapsed ? '+' : '−';
  }

  render(stories) {
    if (!this.content) return;

    this.content.innerHTML = '';
    stories.forEach(story => this.addStory(story));
  }
}

// Initialize globally when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.newsPanel = new NewsPanel();
  });
} else {
  window.newsPanel = new NewsPanel();
}
