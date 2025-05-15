const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const passport=require('passport')
const dotenv = require('dotenv');
require('dotenv').config();
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json());

app.use(passport.initialize())
const port = process.env.PORT || 3000;
const mongooseUrl = process.env.DB_URL;

const mongooseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: { // Changed from "Content" to "content"
        type: String,
        required: true
    },
    author: { // Changed from "Author" to "author"
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});
const UserSchema=mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
})

const mongooseModel = mongoose.model("blog", mongooseSchema);
const UserModel=mongoose.model('user',UserSchema)
const connectDB = async () => {
    try {
        await mongoose.connect(mongooseUrl);
        console.log("MongoDB is Connected");
    } catch (error) {
        console.log("MongoDB is not Connected", error);
    }
};
const  JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({id: jwt_payload.id}, function(err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
            // or you could create a new account
        }
    });
}));
const authMiddleware=(req,res,next)=>{
    const authHeader=req.headers.authorization
      console.log("Authorization Header:", authHeader)
    if(!authHeader) return res.status(401).send({message:"No token"})
        const token=authHeader.split(" ")[1]
    try {
        const decoded=jwt.verify(token,process.env.SECRET_KEY)
        req.user=decoded
        next()
    } catch (error) {
        return res.status(401).send({message:"Invalid token"})
    }
}
app.post("/add", async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const newBlog = new mongooseModel({
            title: title,
            content: content,
            author: author
        });
        await newBlog.save();
        res.status(201).json({ message: "Blog post added successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error saving blog post", error });
    }
});
app.get("/get", async (req, res) => {
    try {
        const data = await mongooseModel.find(); // Use async/await
        res.status(200).json(data); // Send the retrieved data as JSON
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: "Error retrieving blog posts", error: err });
    }
});
app.get("/get/:id", async (req, res) => {
    const id=req.params.id
    try {
        const data = await mongooseModel.findById({_id:id}); // Use async/await
        res.status(200).json(data); // Send the retrieved data as JSON
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ message: "Error retrieving blog posts", error: err });
    }
});
app.delete("/delete/:id",async (req,res)=>{
    const id=req.params.id
    try {
        const data=await mongooseModel.findByIdAndDelete({_id:id})
    } catch (error) {
        console.log(error)
    }
})
app.post('/login',async (req,res)=>{
    const user=await UserModel.findOne({username:req.body.username})
    if(!user){
        return res.status(401).send({
            success:false,
            message:"User is not found"
        })
    }
    if(!bcrypt.compareSync(req.body.password,user.password)){
        return res.status(401).send({
            success:false,
            message:"Incorrect password"
        })
    }
    const payload={
       
        username:user.username
    }
    const token=jwt.sign(payload, process.env.SECRET_KEY, {
        expiresIn:"2d",
    })
    return res.status(201).json({token})
    })
app.post("/signup", async (req, res) => {

    const { username, password } = req.body;
    
    try {
        // Check if user already exists,
        const existingUser = await UserModel.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists" });
        }
        bcrypt.hash(password, saltRounds, async function(err, hash) {
            if (err) return res.status(500).json({ message: "Hash error", error: err });
            const newUser = new UserModel({
                username: username,
                password: hash
            });
            await newUser.save();
            res.status(201).json("User is created successfully");
        });
    } catch (error) {
        res.status(500).json({ message: "Error saving user", error });
    }
});

app.get('/blog',authMiddleware,(req,res)=>{
    console.log("🔥 /blog route accessed");  // <-- ADD THIS

    res.status(200).send({
        success:true,
        message:`Welcome back ${req.user.username}`
    })
})

  
app.listen(port, async () => {
    console.log(`Server is running at http://localhost:${port}`);
    await connectDB();
});