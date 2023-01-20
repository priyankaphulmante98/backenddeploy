const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const cors = require("cors")

const { connection } = require("./config/db")
const { UserModel } = require("./models/User.model")
const { authenticate } = require("./middleware/authentication")




const app = express()
app.use(express.json())
app.use(cors({
    origin: "*"
}))

app.get('/', (req, res) => {
    res.send("Welcome to Bug tracker APP")
})

app.post("/signup", async (req, res) => {
    const { email, password } = req.body

    const userPresent = await UserModel.findOne({ email })
    if (userPresent?.email) {
        res.send({ "Message": "User already existed,Try login" })
    } else {
        try {
            bcrypt.hash(password, 4, async function (err, hash) {
                const user = new UserModel({ email, password: hash })
                await user.save()
                res.send({ "Message": "Signup sucessfull" })
            })
        } catch (error) {
            console.log(error)
            res.send({ "Message": "Please try again later" })
        }
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await UserModel.find({ email })

        if (user.length > 0) {
            const hashed_password = user[0].password;
            bcrypt.compare(password, hashed_password, function (err, result) {
                if (result) {
                    const token = jwt.sign({ "userID": user[0]._id }, "hush")
                    res.send({ "Message": "Login sucesfull", "token": token })
                }
            })
        }else{
            res.send({"Message":"Login Failed"})
        }
    } catch (error) {
        res.send({"Message": "Please try again later"})
    }
})

app.use(authenticate)


app.listen(process.env.PORT, async () => {
    try {
        await connection
        console.log("Connected DB Sucessfully")
    } catch (error) {
        console.log("Error connecting in DB")
        console.log(error)
    }
    console.log("Listening on port 9001")
})