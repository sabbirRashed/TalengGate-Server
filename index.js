const express = require('express');
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

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
        const companyCollection = db.collection('companies')

        app.get("/api/jobs", async (req, res) => {
            const query = {};

            if (req.query.companyId) {
                query.companyId = req.query.companyId;
            }
            if (req.query.status) {
                query.status = req.query.status;
            }

            const cursor = await jobCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post("/api/jobs", async (req, res) => {
            const newJobs = req.body;
            const result = await jobCollection.insertOne(newJobs);
            res.send(result)
        })

        // company related api
        app.get('/api/my/company', async(req, res)=>{
            const query={};

            if(req.query.recruiterId){
                query.recruiterId = req.query.recruiterId;
            }
            const result = companyCollection.findOne(query);
            return result;
        })

        app.post('/api/companies', async (req, res) => {
            const newCompany = req.body;
            const result = await companyCollection.insertOne(newCompany);
            res.send(result);
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