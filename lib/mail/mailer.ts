import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: string,
  code: string
) {
  const { data, error } = await resend.emails.send({
    from: "AI TONKEEPER <noreply@ai-tonkeeper.xyz>",
    to: [email],
    subject: "Code de vérification AI TONKEEPER",
    html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AI TONKEEPER</title>
</head>

<body style="margin:0;padding:0;background:#050B18;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center">

<table width="600" cellpadding="30" cellspacing="0"
style="margin-top:40px;background:#101A2C;border-radius:12px;color:white;">

<tr>
<td>

<h1 style="color:#3B82F6;text-align:center;">
AI TONKEEPER
</h1>

<p>Bonjour,</p>

<p>
Merci pour votre inscription sur AI TONKEEPER.
</p>

<p>
Utilisez le code suivant pour confirmer votre adresse email :
</p>

<h2
style="
text-align:center;
font-size:42px;
letter-spacing:8px;
color:#3B82F6;
">
${code}
</h2>

<p>
Ce code est valable pendant
<b>15 minutes</b>.
</p>

<p>
Si vous n'avez pas créé ce compte,
ignorez simplement cet email.
</p>

<hr>

<p
style="
font-size:12px;
color:#999;
text-align:center;
">
© AI TONKEEPER
<br>
Secure TON Wallet • AI Powered
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
`,
  });

  if (error) {
    console.error("RESEND ERROR :", error);
    throw new Error(error.message);
  }

  console.log("EMAIL SENT :", data);

  return data;
}