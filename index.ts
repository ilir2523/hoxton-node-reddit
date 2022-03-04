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

const getAllPostsForUserByName = db.prepare(`
SELECT posts.id, posts.title, posts.content, posts.image, posts.rating,
subreddits.title as 'subreddit' FROM posts 
INNER JOIN subreddits ON posts.subredditId = subreddits.id
INNER JOIN users ON posts.userId = users.id WHERE users.name=?`)

const getAllPostsForUserById = db.prepare(`
SELECT posts.id, posts.title, posts.content, posts.image, posts.rating,
subreddits.title as 'subreddit' FROM posts 
INNER JOIN subreddits ON posts.subredditId = subreddits.id
INNER JOIN users ON posts.userId = users.id WHERE users.id=?`)

const getUser = db.prepare(`SELECT * from users WHERE users.id=?`)

const getUserByName = db.prepare(`SELECT * from users WHERE users.name=?`)

const createUser = db.prepare(`INSERT INTO users (name, email) VALUES (?, ?);`)

const updateUser = db.prepare(`UPDATE users SET name=?, email=? WHERE id=?`)

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
        <li>Get by user id exp.: <a href="/users/1">/users/1</a></li>

    </ul>
    `)
})

app.get('/users', (req, res) => {
    const users = getAllUsers.all()
    const search = req.query.search
    let usersToSend = users
    if (typeof search === 'string') {
        const posts = getAllPostsForUserByName.all(search)
        const userToSend = getUserByName.get(search)
        userToSend.posts = posts
        return res.send(userToSend)
    } else res.send(usersToSend)
})

app.get('/users/:id', (req, res) => {
    const id = req.params.id
    const user = getUser.get(id)
    if (user) {
        const posts = getAllPostsForUserById.all(id)
        user.posts = posts
        res.send(user)
    } else res.status(404).send({error: `user not found.`})
})

app.post('/users', (req, res) => {
    const {name, email} = req.body
    const errors = []

    if (typeof name !== "string") errors.push(`name not a string`)
    if (typeof email !== "string") errors.push(`email not a string`)
    const users = getAllUsers.all()
    for (const user of users) {
        if (user.email === email) errors.push(`This email address is already being used`)
    }

    if (errors.length === 0) {
        const info = createUser.run(name, email)
        const newUser = getUser.get(info.lastInsertRowid)
        res.status(201).send(newUser)
    } else res.status(400).send({ errors: errors })
})

// app.patch('/users/:id', (req,res) => {
//     const id = req.params.id
//     const {name, email} = req.body
//     const user = getUser.get(id)
//     const errors = []

//     if (user.email === email) errors.push(`This email address is already being used`)
//     if (user ) {
//         if (typeof name !== "string") errors.push(`name not a string`)
//         else user.name = name
//         if (typeof email !== "string") errors.push(`email not a string`)
//         else user.email = email
//         const users = getAllUsers.all()

//         const info = updateUser.run(name, email, id)
//     }
// })

app.listen(PORT, () => {
    console.log(`Server runing on: http://localhost:${PORT}/`)
})