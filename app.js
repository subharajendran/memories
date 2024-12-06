const express = require('express')
const mongoose = require('mongoose')
require('ejs')
const Session = require('express-session')
const { type } = require('os')
const MongoDbSession = require('connect-mongodb-session')(Session)
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')


//port listens
const port = 3000
app.listen(port, () => {
    console.log('server runing on port: ', port)
})
//mongodb connection
mongoose.connect('mongodb+srv://subha:subh%402005@cluster0.gfjta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
    .then(() => console.log('server connected'))
    .catch((error) => console.log('server not connected', error))
//connect mongodb session
const Store = new MongoDbSession({
    uri: "mongodb+srv://subha:subh%402005@cluster0.gfjta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    collection: 'session'
})
app.use(Session({
    secret: 'maki-key',
    resave: false,
    saveUninitialized: false,
    store: Store
}))

const storySchema = mongoose.Schema({
    title: { type: String, required: true },
    story: { type: String, required: true },
    date: { type: String, required: true }
})

//collection for User Schema 
const dairymodel = mongoose.model('dairy', storySchema)

const userSchema = mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
})

//collection for User Schema 
const model = mongoose.model('diary user', userSchema)


//user register
app.post('/sign', async (req, res) => {
    try {
        const { username, email, password } = req.body
        if (username && email && password) {
            const finduser = await model.findOne({ email: email })
            if (finduser) {
                return res.render('fail', { message: 'This username Already Resgister! ' })
            }
            else {
                const temp = new model({
                    username: username,
                    email: email,
                    password: password
                })
                const datasave = await temp.save()
                if (datasave) {
                    req.session.user = datasave.username
                    return res.render('success', { message: "User Registration successfully!" })
                }
                else {
                    return res.render('fail', { message: "User Registration failed!" })
                }
            }

        }
        else {
            return res.render('fail', { message: "Please provide all details!" })
        }
    }
    catch (err) {
        console.log('Error in registration: ', err)
        return res.send({ success: false, message: "Trouble in Student Registration, please contact support team!" })
    }
})

app.get('/addstory',(req,res)=>{
    res.render('addstory')
})
app.get('/fullstory',(req,res)=>{
    res.render('fullpage')
})

app.get("/read/:id", async (req, res) => {
    try {
        const book = await dairymodel.findById(req.params.id); // Fetch book by ID
        res.render("fullpage", { book }); // Pass the book to the update page
    } catch (err) {
        res.status(500).send("Error fetching book for update");
    }
});


app.post('/addstory', async (req, res) => {
    try {
        const {entrytitle ,entrydate , entrycontent } = req.body
        if (entrytitle && entrydate&& entrycontent) {
            
                const temp = new dairymodel({
                    title: entrytitle,
                    date: entrydate,
                    story: entrycontent
                })
                const datasave = await temp.save()
                if (datasave) {
                    
                    return res.render('success', { message: "Memories Stored" })
                }
                else {
                    return res.render('fail', { message: "User Registration failed!" })
                }
            }
        else {
            return res.render('fail', { message: "Please provide all details!" })
        }
    }
    catch (err) {
        console.log('Error in registration: ', err)
        return res.send({ success: false, message: "Trouble in Student Registration, please contact support team!" })
    }
})
app.get('/',async(req,res)=>{
    try{ 
        const story= await dairymodel.find({})
        return res.render('home',{story})
    }
    catch (err) {
        console.log('Error in registration: ', err)
        return res.send({ success: false, message: "Trouble in Student Registration, please contact support team!" })
    }
})
app.get("/update/:id", async (req, res) => {
    try {
        const book = await dairymodel.findById(req.params.id); // Fetch book by ID
        console.log(book)
        res.render("update", { book }); // Pass the book to the update page
    } catch (err) {
        res.status(500).send("Error fetching book for update");
    }
});
//Admin update book using book id 
app.post("/update/:id", async (req, res) => {
    try {
        const { title,date, story } = req.body;
        await dairymodel.findByIdAndUpdate(req.params.id, { title,date, story });
        res.redirect("/"); // Redirect back to the home page
    } catch (err) {
        res.status(500).send("Error updating book");
    }
});

app.post("/delete/:id", async (req, res) => {
    try {
        await dairymodel.findByIdAndDelete(req.params.id); // Delete the book
        res.redirect("/"); // Redirect back to the home page
    } catch (err) {
        res.status(500).send("Error deleting book");
    }
});