const { connect, connection } = require('mongoose')

const URI = process.env.MONGO_URI || ''

const conn = {
  isConnected: false,
}
 
const connectDB = async () => {
  if (conn.isConnected) return

  try {

    await connect(URI)

  } catch (error) {
    console.log(error)
  }
}

connection.on('connected', () => {
  conn.isConnected = true
  console.log("MongoDB Connected...")
})

connection.on('error', (e) => console.log(e))

module.exports = connectDB