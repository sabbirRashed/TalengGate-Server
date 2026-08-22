const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;
const port = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const run = async () => {
    try {
        await client.connect();

        const db = client.db('TalentGate');
        const jobCollection = db.collection('jobs');
        const companyCollection = db.collection('companies');
        const userCollection = db.collection('user');
        const jobApplicationCollection = db.collection('applicants');
        const planCollection = db.collection('plans');
        const subscriptionCollection = db.collection('subscriptions')

        // User related API
        app.get('/api/users', async (req, res) => {
            const cursor = userCollection.find().skip(3);
            const result = await cursor.toArray();
            res.send(result);

        })


        // Job related API
        app.get("/api/jobs", async (req, res) => {
            const query = {};

            if (req.query.companyId) {
                query.companyId = req.query.companyId;
            }
            if (req.query.status) {
                query.status = req.query.status;
            }

            const cursor = jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/api/job/:id', async (req, res) => {
            const jobId = req.params.id;

            const query = {
                _id: new ObjectId(jobId)
            }
            const result = await jobCollection.findOne(query);
            console.log(result, ":result");
            res.send(result)
        })

        app.post("/api/jobs", async (req, res) => {
            const jobs = req.body;
            const newJobs = {
                ...jobs,
                createdAt: new Date(),
            }
            const result = await jobCollection.insertOne(newJobs);
            res.send(result)
        })

        // Application related API
        app.get('/api/application', async (req, res) => {
            const query = {};

            if (req.query.applicantId) {
                query.applicantId = req.query.applicantId;
            }
            if (req.query.jobId) {
                query.jobId = req.query.jobId;
            }

            const cursor = jobApplicationCollection.find(query);
            const result = await (cursor).toArray();
            console.log('result', result);
            res.send(result)
        })

        app.post('/api/application', async (req, res) => {
            const application = req.body;
            const newApplication = {
                ...application,
                createAt: new Date()
            }
            const result = await jobApplicationCollection.insertOne(newApplication);
            res.send(result);
        })

        // company related api
        app.get("/api/companies", async (req, res) => {
            const cursor = companyCollection.find().skip(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/api/my/company', async (req, res) => {
            const query = {};

            if (req.query.recruiterId) {
                query.recruiterId = req.query.recruiterId;
            }
            const result = await companyCollection.findOne(query);
            res.send(result || {});
        })

        app.post('/api/companies', async (req, res) => {
            const company = req.body;
            const newCompany = {
                ...company,
                createdAt: new Date(),
            }
            const result = await companyCollection.insertOne(newCompany);
            res.send(result);
        })

        //  Plans
        app.get('/api/plan', async (req, res) => {
            const query = {};

            if (req.query.plan_id) {
                query.plan_id = req.query.plan_id;
            }
            const plan = await planCollection.findOne(query);
            res.send(plan);
        })

        //  Subscriptions
        app.post('/api/subscription', async (req, res) => {
            const subscriptionData = req.body;

            const newSubscription = {
                ...subscriptionData,
                createdAt: new Date(),
            }
            const result = await subscriptionCollection.insertOne(newSubscription);

            // update the user plan subscription
            const filter = {email: subscriptionData.email};
            const updateDocument = {
                $set: {
                    plan: subscriptionData.planId
                }
            }
            const updateResult = await userCollection.updateOne(filter, updateDocument)
            res.send(updateResult);
        })



        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
};

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`TalentGate is listening on port ${port}`)
})