/**
 * Represents a single news story
 */
export class NewsStory {
  constructor({
    headline,
    body,
    reporter,
    reporterTitle,
    category,
    icon,
    priority = 1,
    timestamp,
    dateString
  }) {
    this.id = crypto.randomUUID();
    this.headline = headline;
    this.body = body;
    this.reporter = reporter;
    this.reporterTitle = reporterTitle;
    this.category = category; // 'economy', 'citizen', 'service', 'milestone', 'disaster'
    this.icon = icon;
    this.priority = priority; // 1-5, where 5 is breaking news
    this.timestamp = timestamp;
    this.dateString = dateString;
    this.read = false;
  }

  markAsRead() {
    this.read = true;
  }

  serialize() {
    return { ...this };
  }

  static deserialize(data) {
    const story = new NewsStory(data);
    story.id = data.id;
    story.read = data.read;
    return story;
  }
}
