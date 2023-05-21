const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

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
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const addToyCollection = client.db("EduToys").collection("addToys");
    const indexKeys = {toy:1, category:1}
    const indexOptions = {name: "toyNameAndTitle"}
    addToyCollection.createIndex(indexKeys, indexOptions)

    app.get("/toys", async (req, res) => {
      const result = await addToyCollection.find().limit(20).toArray();
      res.send(result);
    });

    // get data by search value 
    app.get("/all-toys/:searchValue", async(req,res)=>{
      const searchValue = req.params?.searchValue
      const query={
        $or: [
          { toy: { $regex: searchValue, $options: "i" } },
          { category: { $regex: searchValue, $options: "i" } },
        ],
      };
      const toyBySearch = await addToyCollection.find(query).toArray()
      res.send(toyBySearch)
    })
    app.get("/toys/:id", async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await addToyCollection.findOne(query);
      res.send(result);
    })
    app.get("/my-toys/:email", async(req, res)=>{
      const email = req.params.email
      const value = req.query.sortBy
      if(value === "ascending"){
        return res.send(await addToyCollection.find({sellerEmail:email}).sort({price:1}).toArray())
      }else{
        return res.send(await addToyCollection.find({sellerEmail:email}).sort({price:-1}).toArray())
      }
    })
    app.get("/my-toys", async (req, res) => {
      console.log(req.query.email);

      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }

      const result = await addToyCollection.find(query).toArray();
      res.send(result);
    });

// Delete Api
   app.delete('/my-toys/:id', async(req, res)=>{
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await addToyCollection.deleteOne(query);
    res.send(result);
   })
   
   app.get('/my-toys/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await addToyCollection.findOne(query)
    res.send(result);
   })


   app.put('/my-toys/:id', async(req, res)=>{
    const id = req.params.id;
    const filter = {_id: new ObjectId(id)}
    const options = { upsert: true };
    const updatedToy = req.body;
    const updateDoc = {
      $set: {
        price: parseFloat(updatedToy.price),
        quantity: updatedToy.quantity,
        details: updatedToy.details,
      },
    };
    const result = await addToyCollection.updateOne(filter, updateDoc, options);
    res.send(result);
   })

    app.get("/categories/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category: category };
      const myCategory = await addToyCollection.find(query).toArray();
      res.send(myCategory);
    });

    app.post("/addToys", async (req, res) => {
      const addToys = req.body;
      addToys.price = parseFloat(addToys.price)
      console.log(addToys);
      const result = await addToyCollection.insertOne(addToys);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Port is running ${port}`);
});
