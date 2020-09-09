const knex = require('knex')
const app = require('./app')
const { PORT, DB_URL } = require('./config')

const db = knex({
  client: 'pg',
  connection: DB_URL,
})

app.set('db', db)

// 4 parameter in middleware, express treats this as error handling middleware

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = {
      error: {
        message: 'server error'
      }
    }
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})