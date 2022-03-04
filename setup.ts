import Database from 'better-sqlite3'

const db = new Database('./reddit_data.db', {
    verbose: console.log
  })

const users = [
    {
        name: 'ilir',
        email: 'ilir@email.com'
    },
    {
        name: 'tim',
        email: 'tim@email.com'
    }
]

const subreddits = [
    {
        title: "Home"
    },
    {
        title: "Fun"
    }
]

const posts = [
    {
        title: 'Hello Reddit!',
        content: 'content',
        image:'',
        userId: 1,
        rating: 1,
        subredditId: 1
    },
    {
        title: 'Whats Up Reddit!',
        content: 'yooo!',
        image:'',
        userId: 2,
        rating: 1,
        subredditId: 1
    },
    {
        title: 'Fun title',
        content: 'soo funny',
        image:'',
        userId: 2,
        rating: 1,
        subredditId: 2
    }
]

const comments = [
    {
        message: "Hey there",
        postId: 1
    },
    {
        message: "yo yo yo",
        postId: 2
    },
    {
        message: "This is a comment",
        postId: 1
    },
]

db.exec(`
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS subreddits;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    PRIMARY KEY (id),
    CHECK(name <> ''),
    CHECK(email <> '')
);

CREATE TABLE IF NOT EXISTS subreddits (
    id INTEGER,
    title TEXT NOT NULL UNIQUE,
    CHECK(title <> ''),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS posts (
id INTEGER,
title TEXT NOT NULL,
content TEXT,
image TEXT,
userId INTEGER NOT NULL,
subredditId INTEGER,
rating INTEGER,
PRIMARY KEY (id),
FOREIGN KEY (userId) REFERENCES users(id),
FOREIGN KEY (subredditId) REFERENCES subreddits(id),
CHECK(title <> '')
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER,
    message TEXT NOT NULL,
    postId INTEGER NOT NULL,
    PRIMARY KEY (id)
);
`)

const createUsers = db.prepare(`INSERT INTO users (name, email) VALUES (?,?)`)
const createSubreddits = db.prepare(`INSERT INTO subreddits (title) VALUES (?)`)
const createPosts = db.prepare(`INSERT INTO posts (title, content, image, userId, rating, subredditId) VALUES (?,?,?,?,?,?)`)
const createComments = db.prepare(`INSERT INTO comments (message, postId) VALUES (?,?)`)

for (const user of users) {
    const { name, email } = user
    createUsers.run(name, email)
}

for (const subreddit of subreddits) {
    const { title } = subreddit
    createSubreddits.run(title)
}

for (const post of posts) {
    const { title, content, image, userId, rating, subredditId } = post
    createPosts.run(title, content, image, userId, rating, subredditId)
}

for (const comment of comments) {
    const { message, postId } = comment
    createComments.run(message, postId)
}
