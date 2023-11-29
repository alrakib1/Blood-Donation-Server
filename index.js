require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const UsersCollection = client.db("Blood-Donation").collection("users");
    const requestsCollection = client
      .db("Blood-Donation")
      .collection("requests");

    // get area
    app.get("/districts", async (req, res) => {
      const result = await DistrictCollection.find().toArray();
      res.send(result);
    });

    app.get("/upazilas", async (req, res) => {
      const result = await UpazilaCollection.find().toArray();
      res.send(result);
    });

    // create user

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await UsersCollection.insertOne(user);
      res.send(result);
    });

    // get the users

    app.get("/user", async (req, res) => {
      const result = await UsersCollection.find().toArray();
      res.send(result);
    });

    // get particular user

    app.get("/profile", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = UsersCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/user", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }

      const profile = req.body;

      const updatedProfile = {
        $set: {
          name: profile.name,
          avatarImage: profile.avatar,
          bloodGroup: profile.bloodGroup,
          upazila: profile.upazila,
          district: profile.district,
        },
      };

      const result = await UsersCollection.updateOne(query, updatedProfile);
      res.send(result);
    });

    // request donation related api

    app.post("/request", async (req, res) => {
      const request = req.body;
      const result = await requestsCollection.insertOne(request);
      res.send(result);
    });

    app.get("/request", async (req, res) => {
      const result = await requestsCollection.find().toArray();
      res.send(result);
    });

    app.get("/currentUserRequests", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = requestsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/request/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await requestsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await requestsCollection.findOne(query);
      res.send(result);
    });

    app.patch("/request/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      const updatedRequest = {
        $set: {
          recipientName: body.recipientName,
          requiredBloodGroup: body.requiredBloodGroup,
          upazila: body.upazila,
          district: body.district,
          hospitalName: body.hospitalName,
          fullAddress: body.fullAddress,
          donationDate: body.donationDate,
          donationTime: body.donationTime,
          message: body.message,
        },
      };
      const result = await requestsCollection.updateOne(query, updatedRequest);
      res.send(result);
    });

    app.patch("/donor/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      const updatedRequest = {
        $set: {
          donorName: body.donorName,
          donorEmail: body.donorEmail,
          donationStatus: body.donationStatus,
        },
      };
      const result = await requestsCollection.updateOne(query, updatedRequest);
      res.send(result);
    });

    app.patch("/done/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const body = req.body;
      const updatedStatus = {
        $set: {
          donationStatus: body.donationStatus,
        },
      };
      const result = await requestsCollection.updateOne(query, updatedStatus);
      res.send(result);
    });




    
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
