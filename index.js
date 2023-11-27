require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2qwdips.mongodb.net/?retryWrites=true&w=majority`;

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

    const DistrictCollection = client.db("Area").collection("District");
    const UpazilaCollection = client.db("Area").collection("Upazila");
    const UsersCollection = client.db('Blood-Donation').collection('users');


    // get area 
    app.get('/districts',async(req,res)=>{
      const result = await DistrictCollection.find().toArray();
      res.send(result)
    })

    app.get('/upazilas',async(req,res)=>{
      const result = await UpazilaCollection.find().toArray();
      res.send(result)
    })

// create user

app.post('/user',async(req,res)=>{
  const user = req.body;
  const result = await UsersCollection.insertOne(user);
  res.send(result)
})

// get the users

app.get('/user',async(req,res)=>{
  const result =await UsersCollection.find().toArray();
  res.send(result)
})


    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
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
  res.send("Blood Donation server running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
