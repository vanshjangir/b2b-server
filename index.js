const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
const express = require('express')
const app = express()
const port = 3000
const cors = require('cors')
const {MongoClient, GridFSStream} = require('mongodb')
const uri = "mongodb+srv://hackOharbour:D1kVfg4XSaaq3sUX@cluster0.g1ic6ja.mongodb.net/?retryWrites=true&w=majority";
const GEMINI_API_KEY = "AIzaSyBrjP4-mCYNeLUqEj0wyFFLGARahdUrA5c";

const client = new MongoClient(uri);
const db = client.db('bit2byte');

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function callgemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  let preprompt = "give output in single string like this [[\"firstidea\", \"keywords\"], [\"second idea\", \"keywords\"]] with ideas as strings and keywords will be two keywords related to that idea, keywords should strictly be the names of clothes or dresses or designs and strictly according to the following request\n";
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
  const db = client.db('hackOharbour');
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
  let final= JSON.parse(result);

  for(let i=0; i<final.length; i++){
    final[i][1] = final[i][1].replaceAll(" ", ",");
  }

  res.status(200).json(final);
  
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
