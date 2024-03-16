const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
const express = require('express')
const app = express()
const port = 3000
const CONFIG = require('./config.json');
const GEMINI_API_KEY = CONFIG.genapi


const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function callgemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  let preprompt = "give output in single string like this [[\"firstidea\", \"keywords\"], [\"second idea\", \"keywords\"]] with ideas as strings and keywords will be some keywords related to that idea ";
  prompt = prompt+preprompt;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  return text;
}


app.get('/categories', async (req, res) => {
  const prompt = "give me some fashion categories for indian occasions just as single word for each category with only english alphabets";

  const response = await callgemini(prompt);
  const array = JSON.parse(response);
  console.log(array);

  res.send(array);
})

app.get('/searches', async (req, res) => {
  
  const prompt = req.params;
  let result= await callgemini(prompt);
  let final= JSON.parse(result);
  res.status(200).json(final);
  
})
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
