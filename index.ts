import express from 'express'
import cors from 'cors'
import Database from 'better-sqlite3'

const db = new Database('./reddit_data.db', {
    verbose: console.log
})
const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

const getAllUsers = db.prepare(`SELECT * from users`)
const getAllPostsForUser = db.prepare(`
SELECT posts.id, posts.title, posts.content, posts.image, posts.rating,
subreddits.title as 'subreddit' FROM posts 
INNER JOIN subreddits ON posts.subredditId = subreddits.id
INNER JOIN users ON posts.userId = users.id WHERE users.name=?
`)
// const getUser = db.prepare(`SELECT * from users WHERE users.id=?`)
const getUserByName = db.prepare(`SELECT * from users WHERE users.name=?`)

// // const getAllPosts = db.prepare(``)
// // const getPost = db.prepare(``)
// const getAllSubreddits = db.prepare(`SELECT * from subreddits`)
// const getSubreddit = db.prepare(`SELECT * from subreddits WHERE subreddit.id=?`)
// const getAllComments = db.prepare(`SELECT * from comments`)
// const getComment = db.prepare(`SELECT * from comments WHERE comment.id=?`)

app.get('/', (req, res) => {
    res.send(`
    <h1>Welcome Reddit API!</h1>
    <p>Here are some endpoints you can use:</p>
    <ul>
        <li><a href="/users">/users</a></li>
        <li>Search user by name exp.: <a href="/users?search=tim">/users?search=tim</a></li>
    </ul>
    `)
})

app.get('/users', (req, res) => {
    const users = getAllUsers.all()
    const search = req.query.search
    let usersToSend = users
    if (typeof search === 'string') {
        const posts = getAllPostsForUser.all(search)
        const userToSend = getUserByName.get(search)
        userToSend.posts = posts
        return res.send(userToSend)
    } else res.send(usersToSend)
})

app.listen(PORT, () => {
    console.log(`Server runing on: http://localhost:${PORT}/`)
})