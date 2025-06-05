import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { Client, Users } from 'node-appwrite';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------- Appwrite client setup ----------
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Change if needed
    .setProject('67cc44870036518f1c7b')
    .setKey('standard_9ef65c3845ee85eb727832014f9f315b7a58e3454dcff55f47f65460ead76eceeab30052f98331325b6bbec642a9d08778a72502c4b131f0a1571e54d45c84d64d731498734405981c4151a018d449c0465f68fd195d8a89ed3c5d078234f75b353b536037f2a80bb65b95625dbe5492f61b21700b8c9f4e8f372b7873bafe0f');

const users = new Users(client);

// ---------- Email verification endpoint ----------
app.post('/verify-email', async (req, res) => {
    const { userId } = req.body;
    try {
        await users.updateEmailVerification(userId, 'https://treasurenfts2.onrender.com/success.html');
        res.status(200).send('Verification email sent!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to send verification email.');
    }
});

// ---------- Password reset endpoint ----------
app.post('/reset-password', async (req, res) => {
    const { email } = req.body;
    try {
        await users.createRecovery(email, 'https://treasurenfts2.onrender.com/success.html');
        res.status(200).send('Password reset email sent!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to send reset email.');
    }
});

// ---------- NowPayments IPN endpoint ----------
app.post('/nowpayments-ipn', async (req, res) => {
    try {
        const ipnData = req.body;
        console.log("Received IPN:", ipnData);

        const response = await axios.post(
            'https://fra.cloud.appwrite.io/v1/functions/68411df80026e2aec563/executions',
            {},
            {
                headers: {
                    'X-Appwrite-Project': '67cc44870036518f1c7b',
                    'X-Appwrite-Key': 'standard_9ef65c3845ee85eb727832014f9f315b7a58e3454dcff55f47f65460ead76eceeab30052f98331325b6bbec642a9d08778a72502c4b131f0a1571e54d45c84d64d731498734405981c4151a018d449c0465f68fd195d8a89ed3c5d078234f75b353b536037f2a80bb65b95625dbe5492f61b21700b8c9f4e8f372b7873bafe0f',
                    'Content-Type': 'application/json',
                }
            }
        );

        console.log("Function triggered:", response.data);
        res.status(200).send('IPN received and function triggered.');
    } catch (error) {
        console.error("IPN error:", error?.response?.data || error.message);
        res.status(500).send('Error processing IPN.');
    }
});

// ---------- Start server ----------
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
