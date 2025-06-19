import express from "express";
import cors from "cors";
import { updateNewPassword, updateVerification } from "./controllers/auth_controllers.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

// ✅ Existing assetlinks.json route (perfect, no changes needed)
app.get("/.well-known/assetlinks.json", (req, res) => {
    res.json([{
        "relation": ["delegate_permission/common.handle_all_urls"],
        "target": {
            "namespace": "android_app",
            "package_name": "com.treasurenfts.live_proje",
            "sha256_cert_fingerprints": [
                "FB:65:E2:C4:78:56:F0:EE:26:D5:65:CA:6F:D6:7A:5B:17:6B:70:39:87:35:FD:EA:EE:F7:88:FE:43:12:0F:9C"
            ]
        }
    }]);
});

// 🔥 NEW: Referral Route (Add this before 404 handler)
app.get("/referral", (req, res) => {
    const { code } = req.query;
    
    if (code) {
        // Play Store redirect with referral tracking
        const playStoreUrl = `https://play.google.com/store/apps/details?id=com.treasurenfts.live_proje&referrer=${code}`;
        return res.redirect(playStoreUrl);
    } else {
        // If no code, redirect to Play Store without referral
        return res.redirect('https://play.google.com/store/apps/details?id=com.treasurenfts.live_proje');
    }
});

// 🔸 Server Home
app.get("/", (req, res) => {
    res.render("index");
});

// ----------- NowPayments IPN Route (GET test only) ------------
app.get('/nowpayments-ipn', (req, res) => {
  res.send('👍 This endpoint is ready to receive POST requests from NowPayments.');
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
