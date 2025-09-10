import nodemailer from "nodemailer";
const testMail = async () => {

    var transporter = nodemailer.createTransport({
      host: "live.smtp.mailtrap.io",
      port: 587,
      auth: {
        user: "api",
        pass: process.env.MAIL_TOKEN,
      },
    });

    await transporter
      .sendMail({
        from: "hello@demomailtrap.co",
        to: "sethpratham67@gmail.com",
        subject: "Gupshup Tests",
        html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - GupShup</title>
</head>
<body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border:2px solid #ddd; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td bgcolor="#FDC62E" style="padding:20px 0; text-align:center;">
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:30px 20px 30px 20px; text-align:center; background:#ffffff;">
                            <div style="margin-bottom:20px;">
                                <img src="https://i.ibb.co/dmBT1Sj/mug-icon.png" alt="GupShup Logo" width="60" style="display:block; margin:0 auto;">
                            </div>
                            <h1 style="margin:0; font-size:48px; font-weight:bold; color:#000; font-family: Arial, sans-serif; letter-spacing:-1px;">
                                GupShup
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px; background:#ffffff;">
                            <!-- Grey content box with margins -->
                            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="padding:40px 30px 50px 30px; background:#e8e8e8; text-align:center;">
                                        <h2 style="margin:0 0 30px 0; font-size:36px; font-weight:bold; color:#000; font-family: Arial, sans-serif;">
                                            Email Verification
                                        </h2>
                                        <p style="margin:0 0 40px 0; font-size:16px; line-height:1.5; color:#000; font-family: Arial, sans-serif;">
                                            Hi, there was a recent login to <span style="color:#FDC62E; font-weight:bold;">gupshup</span> from your<br>
                                            email id, if it was you please verify it by clicking the<br>
                                            button below
                                        </p>
                                        <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                                            <tr>
                                                <td>
                                                    <a href="https://example.com/verify" 
                                                       style="display:inline-block; background:#FDC62E; color:#000000; text-decoration:none; 
                                                              padding:15px 40px; font-weight:bold; font-size:18px; font-family: Arial, sans-serif;
                                                              border:none; cursor:pointer;">
                                                        Verify
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:60px 0 0 0; font-size:16px; color:#000; font-family: Arial, sans-serif;">
                                            if not just ignore this email, thanks for your time :D
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
      })
      .then((info) => {
        console.log("Message sent: %s", info.messageId);
      })
      .catch(console.error);

};

export default testMail;
