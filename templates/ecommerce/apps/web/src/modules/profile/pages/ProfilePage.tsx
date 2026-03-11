import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../auth/useAuthStore';
import { usePageTitle } from '../../../shared/hooks/usePageTitle';

const fieldStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-family)',
  boxSizing: 'border-box',
};

const btnPrimary: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  padding: '0.55rem 1.25rem',
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: 'var(--font-family)',
};

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  background: '#ef4444',
};

const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '1.5rem',
};

export function ProfilePage() {
  usePageTitle('Meu Perfil');
  const { user, updateProfile, changePassword, deleteAccount } = useAuthStore();
  const navigate = useNavigate();

  // ── Personal data section ────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);
    try {
      await updateProfile({ name: name.trim() || undefined, email: email.trim() || undefined });
      setProfileMsg({ text: 'Dados atualizados com sucesso!', ok: true });
    } catch (err) {
      setProfileMsg({ text: err instanceof Error ? err.message : 'Erro ao atualizar', ok: false });
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Change password section ───────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);
    if (newPwd !== confirmPwd) {
      setPwdMsg({ text: 'As senhas não coincidem', ok: false });
      return;
    }
    setPwdLoading(true);
    try {
      await changePassword({ currentPassword: currentPwd, newPassword: newPwd });
      setPwdMsg({ text: 'Senha alterada com sucesso!', ok: true });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
    } catch (err) {
      setPwdMsg({ text: err instanceof Error ? err.message : 'Erro ao trocar senha', ok: false });
    } finally {
      setPwdLoading(false);
    }
  }

  // ── Delete account section ────────────────────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePwd, setDeletePwd] = useState('');
  const [deleteMsg, setDeleteMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleDeleteAccount() {
    setDeleteMsg(null);
    setDeleteLoading(true);
    try {
      await deleteAccount(deletePwd);
      navigate('/');
    } catch (err) {
      setDeleteMsg(err instanceof Error ? err.message : 'Erro ao excluir conta');
      setDeleteLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: '640px', margin: '2rem auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Meu Perfil</h1>

      {/* ── Dados pessoais ────────────────────────────────────────────────── */}
      <section style={card}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem' }}>
          Dados Pessoais
        </h2>
        <form onSubmit={(e) => { void handleUpdateProfile(e); }}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Nome
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={fieldStyle}
              aria-label="Nome"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={fieldStyle}
              aria-label="Email"
            />
          </label>
          {profileMsg && (
            <p role="alert" style={{ color: profileMsg.ok ? '#10b981' : '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {profileMsg.text}
            </p>
          )}
          <button type="submit" style={btnPrimary} disabled={profileLoading}>
            {profileLoading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </section>

      {/* ── Trocar senha ─────────────────────────────────────────────────── */}
      <section style={card}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: 0, marginBottom: '1rem' }}>
          Trocar Senha
        </h2>
        <form onSubmit={(e) => { void handleChangePassword(e); }}>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Senha atual
            </span>
            <input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              style={fieldStyle}
              aria-label="Senha atual"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Nova senha
            </span>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              style={fieldStyle}
              aria-label="Nova senha"
            />
          </label>
          <label style={{ display: 'block', marginBottom: '1rem' }}>
            <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.35rem' }}>
              Confirmar nova senha
            </span>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              style={fieldStyle}
              aria-label="Confirmar nova senha"
            />
          </label>
          {pwdMsg && (
            <p role="alert" style={{ color: pwdMsg.ok ? '#10b981' : '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
              {pwdMsg.text}
            </p>
          )}
          <button type="submit" style={btnPrimary} disabled={pwdLoading}>
            {pwdLoading ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </section>

      {/* ── Zona de perigo ────────────────────────────────────────────────── */}
      <section style={{ ...card, borderColor: '#fecaca' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444', marginTop: 0, marginBottom: '0.75rem' }}>
          Zona de Perigo
        </h2>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Ao excluir sua conta todos os seus dados serão removidos permanentemente. Esta ação não pode ser desfeita.
        </p>
        <button type="button" style={btnDanger} onClick={() => setShowDeleteModal(true)}>
          Excluir minha conta
        </button>
      </section>

      {/* ── Modal de confirmação de exclusão ─────────────────────────────── */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão de conta"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div style={{ background: '#fff', borderRadius: '10px', padding: '2rem', maxWidth: '420px', width: '90%' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 0 }}>Confirmar exclusão</h3>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Digite sua senha para confirmar a exclusão permanente da sua conta.
            </p>
            <input
              type="password"
              placeholder="Sua senha"
              value={deletePwd}
              onChange={(e) => setDeletePwd(e.target.value)}
              style={{ ...fieldStyle, marginBottom: '1rem' }}
              aria-label="Senha para confirmar exclusão"
            />
            {deleteMsg && (
              <p role="alert" style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                {deleteMsg}
              </p>
            )}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeletePwd(''); setDeleteMsg(null); }}
                style={{ ...btnPrimary, background: '#6b7280' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                style={btnDanger}
                disabled={deleteLoading || !deletePwd}
                onClick={() => { void handleDeleteAccount(); }}
              >
                {deleteLoading ? 'Excluindo...' : 'Excluir conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
