export function UserCard({ user, onLogout }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div>Logged in as {user.name ?? user.username}</div>
      <button type="button" onClick={onLogout}>
        Log out
      </button>
    </div>
  );
}
