const GoogleGenerativeAI = require('@google/generative-ai').GoogleGenerativeAI;
const express = require('express')
const app = express()
const port = 3000
const CONFIG = require('./config.json');
const API_KEY = CONFIG.genapi


const genAI = new GoogleGenerativeAI(API_KEY);

async function callgemini() {
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  let preprompt = "";

  let prompt = "give me some fashion categories for indian occasions";
  prompt = prompt+preprompt;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

app.get('/categories', async (req, res) => {
  res.send(await callgemini());
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
