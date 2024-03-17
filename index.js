const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const {MongoClient} = require('mongodb')
const uri = "--mongodb-uri--";
const GEMINI_API_KEY = "AIzaSyBrjP4-mCYNeLUqEj0wyFFLGARahdUrA5c";

const client = new MongoClient(uri);
const db = client.db('bit2byte');

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function callgemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  let preprompt = "give output in about 30 words in a single string in this JSON style format on key(para) for single paragraph about to dress for the following occasion, and another key(keywords) for a single string of 4 keywords about the dresses and clothes without spaces and separated by commas,  with a fashion ideas for how to dress according to the following occasion\n";
  prompt = prompt+preprompt;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}


app.post('/login', async (req, res) => {

  const userdata = req.body;
  const users = db.collection('users');
  const userarr = await users.find({}).toArray();

  const foundUser = userarr.find(x => x.email === userdata.email);
  if(foundUser){
    if(foundUser.password === userdata.password){
      res.status(200).json(foundUser);
    }else{
      res.status(401).json({message: "Incorrect password"});
    }

  }else{
    res.status(401).json({message: "User not found"});
  }
})

app.post('/signup', async (req, res) => {
  const userdata = req.body;
  const users = db.collection('users');
  const userarr = await users.find({}).toArray();
  
  const foundUser = userarr.find(x => x.email === userdata.email);
  if(foundUser){
    res.status(409).json({message: "Email already exists"})
  }else{
    users.insertOne(userdata);
    res.status(200).json("signup successful");
  }
})

app.get('/categories', async (req, res) => {

  final = [
    [
      "men","menclothes,pants,shirts,jeans"
    ],
    [
      "women","womenclothes,skirts,jeans"
    ],
    [
      "festivals", "indianfestivaldresses,diwali"
    ],
    [
      "wedding", "weddingdresses,suit,tuxedo,sherwani"
    ],
    [
      "casual", "shorts,sweat-shirts"
    ],
    [
      "formal", "tie,formal-attire,men"
    ]
  ]

  res.send(final);
})

app.get('/searches', async (req, res) => {
  
  const prompt = req.body;
  let result= await callgemini(prompt['prompt']);
  result = JSON.parse(result);
  res.status(200).json({"result":result.para, "keywords": result.keywords});
  
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
