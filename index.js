const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 3000

// Middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nyrtlyj.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const addToyCollection = client.db("EduToys").collection("addToys");


 app.get('/toys', async(req, res)=>{
  const result = await addToyCollection.find().toArray()
  res.send(result);
 })


    app.get("/my-toys/:email", async(req, res)=>{
      const email = req.params.email
      const query = {sellerEmail: email}
      const myToys = await addToyCollection.find(query).toArray()
      res.send(myToys)
    })

    app.get("/categories/:category", async(req, res)=>{
      const category = req.params.category;
      const query = {category: category}
      const myCategory = await addToyCollection.find(query).toArray()
      res.send(myCategory)
    })

   

    app.post('/addToys', async(req, res)=>{
      const addToys= req.body;
      console.log(addToys);
      const result= await addToyCollection.insertOne(addToys)
      res.send(result);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=>{
    res.send('Server is running')
})

app.listen(port, ()=>{
    console.log(`Port is running ${port}`);
})