const db = require("./db");
const slugify = require("slugify");

const categories = [
  "Technology",
  "Travel",
  "Food",
  "Lifestyle",
  "Business",
  "Health",
  "Programming",
];

const authors = [
  "Ava Thompson",
  "Liam Carter",
  "Sofia Reyes",
  "Noah Bennett",
  "Maya Patel",
  "Ethan Wright",
];

const topics = [
  "Getting Started with",
  "A Deep Dive into",
  "5 Lessons I Learned from",
  "Why You Should Care About",
  "The Ultimate Guide to",
  "How to Master",
  "Common Mistakes in",
  "The Future of",
  "Behind the Scenes of",
  "A Beginner's Roadmap to",
];

const subjects = [
  "Remote Work",
  "React Performance",
  "Street Food in Bangkok",
  "Minimalist Living",
  "Startup Fundraising",
  "Mindful Mornings",
  "Node.js APIs",
  "Sustainable Travel",
  "Personal Branding",
  "Docker Containers",
  "Budget Backpacking",
  "Plant-Based Cooking",
  "Time Management",
  "SQL Optimization",
  "Freelancing",
  "Mental Health at Work",
  "CSS Grid Layouts",
  "European City Breaks",
  "Home Coffee Brewing",
  "Leadership Skills",
];

function paragraph(subject, index) {
  return (
    `## Introduction\n\nThis post explores **${subject}** from a practical, ` +
    `experience-driven angle (part ${index}). Whether you're just starting out or ` +
    `looking to sharpen your skills, there's something here for you.\n\n` +
    `## Key Points\n\n- Understanding the fundamentals of ${subject}\n` +
    `- Practical tips you can apply today\n- Common pitfalls to avoid\n\n` +
    `## Conclusion\n\n${subject} is a topic worth revisiting often. Keep experimenting ` +
    `and refining your approach.`
  );
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomTags(category) {
  const pool = ["guide", "tips", category.toLowerCase(), "2026", "howto", "news"];
  const count = 2 + Math.floor(Math.random() * 2);
  const shuffled = [...new Set(pool)].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function randomPastDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString();
}

function run() {
  const insert = db.prepare(`
    INSERT INTO posts (title, slug, content, author, category, tags, status, created_date, published_date, image_url)
    VALUES (@title, @slug, @content, @author, @category, @tags, @status, @created_date, @published_date, @image_url)
  `);

  const clear = db.prepare("DELETE FROM posts");

  const seedAll = db.transaction((posts) => {
    clear.run();
    for (const post of posts) insert.run(post);
  });

  const posts = [];
  const usedSlugs = new Set();
  const total = 55;

  for (let i = 1; i <= total; i++) {
    const topic = randomFrom(topics);
    const subject = randomFrom(subjects);
    const title = `${topic} ${subject}`;
    let slug = slugify(title, { lower: true, strict: true });
    // Guarantee unique slugs even if the same title combination repeats
    if (usedSlugs.has(slug)) slug = `${slug}-${i}`;
    usedSlugs.add(slug);

    const status = Math.random() < 0.7 ? "Published" : "Draft";
    const createdDate = randomPastDate(120);
    const publishedDate =
      status === "Published" ? randomPastDate(90) : null;

    posts.push({
      title,
      slug,
      content: paragraph(subject, i),
      author: randomFrom(authors),
      category: randomFrom(categories),
      tags: JSON.stringify(randomTags(randomFrom(categories))),
      status,
      created_date: createdDate,
      published_date: publishedDate,
      image_url: `https://picsum.photos/seed/${slug}/800/450`,
    });
  }

  seedAll(posts);
  console.log(`Seeded ${posts.length} posts.`);
}

if (require.main === module) {
  run();
}

module.exports = { run };
