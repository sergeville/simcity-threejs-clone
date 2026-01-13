/**
 * Activity Feed - Shows scrolling messages about city events
 */
export class ActivityFeed {
  constructor() {
    this.container = document.getElementById('activity-feed');
    this.maxMessages = 20; // Keep last 20 messages
    this.messages = [];
  }

  /**
   * Add a message to the activity feed
   * @param {string} text - Message text
   * @param {string} type - Message type: 'ai', 'economy', 'citizen', 'construction', 'event'
   * @param {string} icon - Emoji icon
   */
  addMessage(text, type = 'default', icon = '📢') {
    const message = {
      text,
      type,
      icon,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    this.messages.unshift(message); // Add to beginning

    // Keep only last maxMessages
    if (this.messages.length > this.maxMessages) {
      this.messages = this.messages.slice(0, this.maxMessages);
    }

    this.render();
  }

  /**
   * Render all messages
   */
  render() {
    this.container.innerHTML = this.messages
      .map(msg => `
        <div class="activity-message ${msg.type}">
          <span class="activity-icon">${msg.icon}</span>
          <span class="activity-text">${msg.text}</span>
          <span class="activity-time">${msg.time}</span>
        </div>
      `)
      .join('');

    // Auto-scroll to top (newest message)
    this.container.scrollTop = 0;
  }

  /**
   * Clear all messages
   */
  clear() {
    this.messages = [];
    this.render();
  }

  // Convenience methods for different message types

  ai(text, icon = '🤖') {
    this.addMessage(text, 'ai', icon);
  }

  economy(text, icon = '💰') {
    this.addMessage(text, 'economy', icon);
  }

  citizen(text, icon = '👤') {
    this.addMessage(text, 'citizen', icon);
  }

  construction(text, icon = '🏗️') {
    this.addMessage(text, 'construction', icon);
  }

  event(text, icon = '⚠️') {
    this.addMessage(text, 'event', icon);
  }

  info(text, icon = 'ℹ️') {
    this.addMessage(text, 'default', icon);
  }
}

// Make it globally available
window.activityFeed = new ActivityFeed();
