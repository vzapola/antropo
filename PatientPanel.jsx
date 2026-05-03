// ============================================================
// PatientPanel.jsx — Lista de pacientes com editar/excluir
// ============================================================

// Mini modal de confirmação
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 500,
    background: "rgba(0,0,0,0.35)", backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "24px 28px", maxWidth: 340, width: "90%",
      boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Confirmar exclusão</div>
      <div style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 22, lineHeight: 1.5 }}>{message}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn variant="secondary" small onClick={onCancel}>Cancelar</Btn>
        <Btn variant="danger" small onClick={onConfirm}>Excluir</Btn>
      </div>
    </div>
  </div>
);

Object.assign(window, { ConfirmDialog });

const PatientPanel = ({ patients, avaliacoes, selectedId, onSelect, onEdit, onDelete }) => {
  const [search, setSearch] = React.useState("");
  const [hoverId, setHoverId] = React.useState(null);
  const [confirmId, setConfirmId] = React.useState(null);

  const filtered = patients.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.objetivo.toLowerCase().includes(search.toLowerCase())
  );

  const getLastAv = (pid) =>
    avaliacoes.filter(a => a.paciente_id === pid).sort((a, b) => b.data.localeCompare(a.data))[0];

  const avCount = (pid) => avaliacoes.filter(a => a.paciente_id === pid).length;

  const handleDelete = (pid, e) => {
    e.stopPropagation();
    setConfirmId(pid);
  };

  const handleEdit = (p, e) => {
    e.stopPropagation();
    onEdit(p);
  };

  return (
    <div style={{
      width: 288, flexShrink: 0,
      background: "var(--list-bg)", borderRight: "1px solid var(--list-border)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid var(--list-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Pacientes
          </span>
          <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--border)", padding: "1px 7px", borderRadius: 99 }}>
            {patients.length}
          </span>
        </div>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "var(--muted)", pointerEvents: "none" }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..."
            style={{
              width: "100%", padding: "7px 10px 7px 28px",
              borderRadius: 6, border: "1px solid var(--list-border)",
              background: "var(--surface)", color: "var(--text)",
              fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Lista */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            Nenhum paciente encontrado
          </div>
        ) : filtered.map(p => {
          const lastAv = getLastAv(p.id);
          const idade  = calcIdade(p.nascimento);
          const active = selectedId === p.id;
          const hov    = hoverId === p.id;
          let imc = null, imcClass = null;
          if (lastAv) { imc = calcIMC(lastAv.peso, lastAv.altura); imcClass = classIMC(imc, idade); }

          return (
            <div key={p.id}
              onClick={() => onSelect(p)}
              onMouseEnter={() => setHoverId(p.id)}
              onMouseLeave={() => setHoverId(null)}
              style={{
                padding: "12px 14px", borderBottom: "1px solid var(--list-border)",
                cursor: "pointer", transition: "background 0.12s",
                background: active ? "var(--accent-light)" : hov ? "rgba(0,0,0,0.03)" : "transparent",
                borderLeft: active ? "3px solid var(--accent)" : "3px solid transparent",
                position: "relative",
              }}>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Avatar nome={p.nome} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: active ? "var(--accent)" : "var(--text)", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.nome}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                    {idade} anos · {p.sexo === "F" ? "F" : "M"} · {avCount(p.id)} av.
                  </div>
                  {imcClass
                    ? <div style={{ marginTop: 5 }}>
                        <Badge tag={imcClass.tag} small>IMC {fmtN(imc, 1)}</Badge>
                        {lastAv && <span style={{ fontSize: 10.5, color: "var(--muted)", marginLeft: 6 }}>{_fmtData(lastAv.data)}</span>}
                      </div>
                    : <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Sem avaliações</div>
                  }
                </div>

                {/* Ações (visíveis no hover ou no selecionado) */}
                {(hov || active) && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}
                    onClick={e => e.stopPropagation()}>
                    <button onClick={e => handleEdit(p, e)}
                      title="Editar paciente"
                      style={{
                        background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: 5, width: 26, height: 26, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: "var(--muted)",
                      }}>✏️</button>
                    <button onClick={e => handleDelete(p.id, e)}
                      title="Excluir paciente"
                      style={{
                        background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.15)",
                        borderRadius: 5, width: 26, height: 26, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, color: "#dc2626",
                      }}>🗑</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmação de exclusão */}
      {confirmId && (() => {
        const p = patients.find(x => x.id === confirmId);
        const n = avaliacoes.filter(a => a.paciente_id === confirmId).length;
        return (
          <ConfirmDialog
            message={`Excluir ${p?.nome}? ${n > 0 ? `As ${n} avaliação(ões) vinculadas também serão removidas.` : ""} Esta ação não pode ser desfeita.`}
            onCancel={() => setConfirmId(null)}
            onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
          />
        );
      })()}
    </div>
  );
};

Object.assign(window, { PatientPanel });
