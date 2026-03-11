import { useEffect, useState } from 'react';
import { apiFetch } from '../../../shared/lib/apiFetch';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

type UserRole = 'ADMIN' | 'CUSTOMER';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface UsersResponse {
  items: User[];
  nextCursor: string | null;
}

export function UsersAdminPage() {
  usePageTitle('Usuários');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('');

  function loadUsers(role: string) {
    setLoading(true);
    setError(null);
    const qs = role ? `?role=${role}` : '';
    apiFetch<UsersResponse>(`/api/admin/users${qs}`)
      .then((data) => {
        setUsers(data.items);
        setLoading(false);
      })
      .catch(() => {
        setError('Erro ao carregar usuários');
        setLoading(false);
      });
  }

  useEffect(() => {
    loadUsers('');
  }, []);

  function handleRoleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    setRoleFilter(val);
    loadUsers(val);
  }

  if (loading) return <p>Carregando...</p>;
  if (error) return <p role="alert">{error}</p>;

  return (
    <main>
      <h1>Usuários</h1>
      <select value={roleFilter} onChange={handleRoleChange} aria-label="Filtrar por role">
        <option value="">Todos</option>
        <option value="ADMIN">ADMIN</option>
        <option value="CUSTOMER">CUSTOMER</option>
      </select>
      {users.length === 0 ? (
        <p>Nenhum usuário encontrado</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
