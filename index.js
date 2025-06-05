import express from "express";
import cors from "cors";
import { updateNewPassword, updateVerification } from "./controllers/auth_controllers.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// ✅ Asset Links route for Android app verification
app.get("/.well-known/assetlinks.json", (req, res) => {
    res.json([
        {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: "com.treasurenfts.live_proje",
                sha256_cert_fingerprints: [
                    "33:E1:55:3C:E7:16:61:DD:13:52:A9:26:DC:E4:BA:33:EB:C7:70:12:ED:B8:3D:89:B5:8C:7F:48:A9:EF:8D:27"
                ]
            }
        }
    ]);
});

// 🔸 Server Home
app.get("/", (req, res) => {
    res.render("index");
});

app.post('/nowpayments-ipn', async (req, res) => {
  // 1. IPN data
  const ipnData = req.body;

  // 2. Call Appwrite Function
  await axios.post('https://fra.cloud.appwrite.io/v1/functions/68411df80026e2aec563/executions', {}, {
    headers: {
      'X-Appwrite-Project': '67cc44870036518f1c7b',
      'X-Appwrite-Key': 'standard_9ef65c3845ee85eb727832014f9f315b7a58e3454dcff55f47f65460ead76eceeab30052f98331325b6bbec642a9d08778a72502c4b131f0a1571e54d45c84d64d731498734405981c4151a018d449c0465f68fd195d8a89ed3c5d078234f75b353b536037f2a80bb65b95625dbe5492f61b21700b8c9f4e8f372b7873bafe0f',
      'Content-Type': 'application/json',
    }
  });

  res.status(200).send('OK');
});

// 🔸 Email verification endpoint
app.get("/verify", async (req, res) => {
    const { userId, secret } = req.query;
    console.log("userId", userId);
    console.log("secret", secret);

    try {
        const result = await updateVerification(userId, secret);
        console.log(result);
        res.render("template", {
            title: "✅ Verification Complete",
            message: "Your email address has been verified successfully.",
        });
    } catch (e) {
        res.render("template", {
            title: "❌ Verification Failed",
            message: `⚠️ Reason : ${e.message}`,
        });
    }
});

// 🔸 Password recovery page
app.get("/recovery", (req, res) => {
    const { userId, secret } = req.query;
    console.log("userId", userId);
    console.log("secret", secret);
    res.render("reset_password", { userId, secret, message: "" });
});

// 🔸 Complete password reset
app.post("/reset_password", async (req, res) => {
    const { userId, secret, password, password_confirm } = req.body;

    if (password !== password_confirm) {
        return res.render("reset_password", {
            userId,
            secret,
            message: "Passwords do not match.",
        });
    }

    if (password.length < 8) {
        return res.render("reset_password", {
            userId,
            secret,
            message: "Password must be at least 8 characters.",
        });
    }

    try {
        const result = await updateNewPassword(userId, secret, password, password_confirm);
        console.log(result);
        res.render("template", {
            title: "✅ Password Changed",
            message: "Your password was changed successfully.",
        });
    } catch (err) {
        res.render("template", {
            title: "❌ Password Reset Failed",
            message: `⚠️ Reason : ${err.message}`,
        });
    }
});

// 🔸 404 handler
app.get("*", (req, res) => {
    res.render("template", {
        title: "❌ Error",
        message: "⚠️ Page not found",
    });
});

// 🔊 Server listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
