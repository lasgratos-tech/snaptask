import { useState } from "react";

type LoginFormProps = {
  onLogin: (userId: string) => void;
};

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = userId.trim();
    if (!value) {
      setError("User ID requis.");
      return;
    }
    setError(null);
    onLogin(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        User ID
        <input
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
        />
      </label>
      <button type="submit">Se connecter</button>
      {error ? <p>Erreur: {error}</p> : null}
    </form>
  );
};
