import { useState } from "react";

type TaskFormProps = {
  onCreate: (title: string) => Promise<void>;
};

export const TaskForm = ({ onCreate }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) {
      setError("Le titre est requis.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate(value);
      setTitle("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Titre
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </label>
      <button type="submit" disabled={isSubmitting}>
        Créer
      </button>
      {error ? <p>Erreur: {error}</p> : null}
    </form>
  );
};
