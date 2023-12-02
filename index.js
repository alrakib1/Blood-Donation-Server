require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.SECRET_KEY_STRIPE);

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
    const usersCollection = client.db("Blood-Donation").collection("users");
    const requestsCollection = client
      .db("Blood-Donation")
      .collection("requests");

      const blogCollection = client.db('Blood-Donation').collection('blogs')
      const donationCollection = client.db("Blood-Donation").collection("donations");

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
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // get the users

    app.get("/user", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // get particular user

    app.get("/profile", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = usersCollection.find(query);
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

      const result = await usersCollection.updateOne(query, updatedProfile);
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
        query = {
          requesterEmail: req.query.email,
        };
      }
      const cursor = requestsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.delete("/request/:id", async (req, res) => {
      const id = req.params.id;
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

    app.patch("/status/:id", async (req, res) => {
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

    app.patch("/cancel/:id", async (req, res) => {
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

    // admin related

    app.get("/users/admin/:email",async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let admin = false;
      if (user) {
        admin = user?.role === "admin";
      }
      res.send({ admin });
    });



    app.patch(
      "/users/admin/:id",
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );


    app.patch(
      "/users/volunteer/:id",
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "volunteer",
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );




    app.patch(
      "/users/block/:id",
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            status: "blocked",
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );

    
    app.patch(
      "/users/active/:id",
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            status: "active",
          },
        };
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );


// blog related api

app.post('/addBlog',async(req,res)=>{
  const body = req.body;
  const result = await blogCollection.insertOne(body);
  res.send(result);
})

app.get('/blogs',async(req,res)=>{
  const result = await blogCollection.find().toArray();
  res.send(result)
})

app.patch('/blogs/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const updatedDoc = {
    $set: {
      status: 'published'
    }
  }
  const result = await blogCollection.updateOne(query,updatedDoc);
  res.send(result)
})


app.delete('/blogs/:id',async(req,res)=>{
  const id = req.params.id;
  const query = { _id: new ObjectId(id)};
  const result = await blogCollection.deleteOne(query);
  res.send(result);
})

app.get('/blog/:id',async(req,res)=>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result= await blogCollection.findOne(query);
  res.send(result)
})

app.get('/search', async (req, res) => {
  const queryParams = req.query; 

  const sortOptions = {
    bloodGroup: 1, 
    district: 1,
    upazila: 1,
    email: 1,
  };

  const criteria = {
    bloodGroup: queryParams.bloodGroup,      
    district: queryParams.district,  
    upazila: queryParams.upazila,    
    email: queryParams.email,
  };

  // console.log(queryParams);

  const donor = await usersCollection.find(criteria).sort(sortOptions).toArray();
  res.send(donor);
});



app.get('/admin-stats', async(req,res)=>{
  const users = await usersCollection.estimatedDocumentCount();
  const requests  =await requestsCollection.estimatedDocumentCount();
  const donationsCount = await donationCollection.estimatedDocumentCount();
  const totalDonation = await donationCollection.find().toArray();

  res.send({users, requests,donationsCount,totalDonation})
})



   //  payment intent

   app.post("/create-payment-intent", async (req, res) => {
    const { price } = req.body;
    const amount = parseInt(price * 100);
    console.log(amount, "amount inside intent");
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      payment_method_types: ["card"],
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  });



 // payment related api

 app.post("/payments", async (req, res) => {
  const payment = req.body;
  const donationResult = await donationCollection.insertOne(payment);

  
  console.log("payment info", payment);


  res.send({donationResult });
});

app.get("/payments/:email", async (req, res) => {
  const query = { email: req.params.email };
  // if (req.params.email !== req.decoded.email) {
  //   return res.status(403).send({ message: "forbidden access" });
  // }
  const result = await donationCollection.find(query).toArray();
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
