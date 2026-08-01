interface VerificationEmailProps {
  code: string;
}

export default function VerificationEmail({
  code,
}: VerificationEmailProps) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "30px",
        background: "#0B1220",
        color: "#ffffff",
      }}
    >
      <h2>AI TONKEEPER</h2>

      <h3>Votre code de confirmation</h3>

      <p>
        Bonjour,
      </p>

      <p>
        Voici votre code de confirmation :
      </p>

      <div
        style={{
          fontSize: "36px",
          fontWeight: "bold",
          letterSpacing: "10px",
          margin: "25px 0",
          color: "#3B82F6",
        }}
      >
        {code}
      </div>

      <p>
        Ce code expire dans 15 minutes.
      </p>

      <p>
        Si vous n'êtes pas à l'origine de cette demande,
        ignorez simplement cet email.
      </p>

      <hr />

      <p>
        Équipe AI TONKEEPER
      </p>
    </div>
  );
}