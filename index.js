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
