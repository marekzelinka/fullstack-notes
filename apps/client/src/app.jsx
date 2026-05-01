import { useState, useReducer, useEffect, useRef } from "react";

import { AddNoteForm } from "./components/add-note-form.jsx";
import { Alert } from "./components/alert.jsx";
import { Footer } from "./components/footer.jsx";
import { LoginForm } from "./components/login-form.jsx";
import { NoteFilters } from "./components/note-filters.jsx";
import { NoteList } from "./components/note-list.jsx";
import { UserCard } from "./components/user-card.jsx";
import { loginApi, notesApi } from "./lib/api.js";

export function App() {
  const [alert, setAlert] = useState(null);
  const alertTimeoutIdRef = useRef();

  const notify = (message, { variant = "success" } = {}) => {
    if (alertTimeoutIdRef.current) {
      clearTimeout(alertTimeoutIdRef.current);
    }

    setAlert({ variant, message });
    const timeoutId = setTimeout(() => setAlert(null), 3500);

    alertTimeoutIdRef.current = timeoutId;
  };

  const [user, setUser] = useState(() => {
    const userValue = localStorage.getItem("user");
    if (!userValue) {
      return null;
    }

    try {
      return JSON.parse(userValue);
    } catch {
      return null;
    }
  });

  const login = async ({ username, password }) => {
    try {
      const data = await loginApi.login({ username, password });
      const loggedInUser = { username: data.username, name: data.name };
      setUser(loggedInUser);

      localStorage.setItem("user", JSON.stringify(loggedInUser));
      localStorage.setItem("token", data.token);

      return { success: true };
    } catch (error) {
      notify(error.response.data.error, { variant: "error" });

      return { success: false };
    }
  };

  const logout = () => {
    setUser(null);

    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const [notes, setNotes] = useState(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    notesApi.getAll().then(setNotes);
  }, [user]);

  const addNote = async ({ content }) => {
    const noteObject = {
      content,
    };

    try {
      const createdNote = await notesApi.create(noteObject);
      setNotes((prevNotes) => prevNotes.concat(createdNote));

      notify(`Added "${content}"`);

      return { success: true };
    } catch (error) {
      notify(error.response.data.error, { variant: "error" });

      return { success: false };
    }
  };

  const toggleNoteImportance = async (id) => {
    const existingNote = notes.find((note) => note.id === id);
    const noteObject = { important: !existingNote.important };

    try {
      const updatedNote = await notesApi.update(id, noteObject);
      setNotes((prevNotes) => prevNotes.map((note) => (note.id === id ? updatedNote : note)));
    } catch {
      notify(`Note "${existingNote.content}" was already deleted from server`, {
        variant: "error",
      });

      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  const deleteNote = async (id) => {
    const existingNote = notes.find((note) => note.id === id);

    try {
      await notesApi.delete(id);

      notify(`Deleted "${existingNote.content}"`, { variant: "info" });
    } catch {
      notify(`Note "${existingNote.content}" was already removed from server`, {
        variant: "error",
      });
    } finally {
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
    }
  };

  const [showAll, toggleShowAll] = useReducer((prevShowAll) => !prevShowAll, true);

  return (
    <>
      <header>
        <h1>Fullstack Notes</h1>
        {user ? <UserCard user={user} onLogout={logout} /> : null}
        {alert ? <Alert {...alert} /> : null}
      </header>
      <main>
        {user ? (
          <>
            <section>
              {notes ? (
                notes.length ? (
                  <>
                    <NoteFilters showAll={showAll} toggleShowAll={toggleShowAll} />
                    <NoteList
                      notes={notes}
                      showAll={showAll}
                      onImportanceToggle={toggleNoteImportance}
                      onDelete={deleteNote}
                    />
                  </>
                ) : (
                  <p>No notes found...</p>
                )
              ) : (
                <p>Loading notes...</p>
              )}
            </section>
            <section>
              <AddNoteForm onSubmit={addNote} />
            </section>
          </>
        ) : (
          <section>
            <h2>Login with your username</h2>
            <LoginForm onSubmit={login} />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
