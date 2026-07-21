import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Boxes,
  Building2,
  CalendarDays,
  Camera,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  CheckCircle2,
  ClipboardCheck,
  CloudSun,
  Download,
  FileText,
  HardHat,
  MapPin,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Search,
  SlidersHorizontal,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { alerts, attendanceRecords as demoAttendanceRecords, dailyLogs as demoDailyLogs, orders, projects, teamMembers } from './data'
import { Logo } from './components/layout/Logo'
import { Sidebar } from './components/layout/Sidebar'
import { useAuth } from './auth/AuthContext'
import { loadCollection, saveCollection, storageKeys } from './services/storage'
import { createProjectRequest, listProjectsRequest } from './services/projects'
import { createDailyLogRequest, listAttendanceRequest, listDailyLogsRequest, saveAttendanceRequest } from './services/site'
import type { AttendanceRecord, AttendanceStatus, DailyLog, DailyLogPhoto, Project, Role, TeamMember } from './types'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', maximumFractionDigits: 0,
})

const compactCurrency = new Intl.NumberFormat('pt-BR', {
  style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1,
})

const roles: Record<Role, { label: string; detail: string }> = {
  admin: { label: 'Sede / Admin', detail: 'Acesso global' },
  engineer: { label: 'Engenheiro', detail: '4 obras vinculadas' },
  foreman: { label: 'Encarregado', detail: 'Residencial Aurora' },
  client: { label: 'Dono da obra', detail: 'Acesso de consulta' },
}

function KpiCard({ label, value, detail, trend, icon: Icon, tone = 'green' }: { label: string; value: string; detail: string; trend?: 'up' | 'down'; icon: typeof TrendingUp; tone?: string }) {
  return (
    <article className="kpi-card">
      <div className={`kpi-icon ${tone}`}><Icon size={21} /></div>
      <div className="kpi-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={trend ? `trend ${trend}` : ''}>
          {trend === 'up' && <ArrowUpRight size={14} />}
          {trend === 'down' && <ArrowDownRight size={14} />}
          {detail}
        </small>
      </div>
      <button className="icon-button ghost"><MoreHorizontal size={18} /></button>
    </article>
  )
}

function PortfolioChart({ selectedProjects }: { selectedProjects: Project[] }) {
  const invested = selectedProjects.reduce((total, item) => total + item.invested, 0)
  const market = selectedProjects.reduce((total, item) => total + item.marketValue, 0)
  const pointsA = '0,148 52,136 103,142 155,116 207,121 258,88 310,97 362,66 414,73 466,42 520,51 572,26 624,36 680,10'
  const pointsB = '0,172 52,165 103,151 155,156 207,139 258,135 310,112 362,119 414,92 466,94 520,72 572,74 624,53 680,58'
  return (
    <section className="panel portfolio-panel">
      <div className="panel-head">
        <div><span className="eyebrow">VISÃO PATRIMONIAL</span><h2>Evolução do portfólio</h2></div>
        <button className="text-button">Ver relatório <ArrowRight size={15} /></button>
      </div>
      <div className="chart-summary">
        <div><i className="legend-dot market" /><span>Valor venal</span><strong>{compactCurrency.format(market)}</strong></div>
        <div><i className="legend-dot invested" /><span>Capital investido</span><strong>{compactCurrency.format(invested)}</strong></div>
      </div>
      <div className="line-chart" aria-label="Gráfico de evolução patrimonial nos últimos seis meses">
        <div className="chart-grid"><i /><i /><i /><i /></div>
        <svg viewBox="0 0 680 190" preserveAspectRatio="none" role="img">
          <defs>
            <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d5b557" stopOpacity=".24" />
              <stop offset="100%" stopColor="#d5b557" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon points={`${pointsA} 680,190 0,190`} fill="url(#chartFill)" />
          <polyline points={pointsA} fill="none" stroke="#c7a23b" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <polyline points={pointsB} fill="none" stroke="#1d7a5a" strokeWidth="2.5" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="chart-months"><span>FEV</span><span>MAR</span><span>ABR</span><span>MAI</span><span>JUN</span><span>JUL</span></div>
      </div>
    </section>
  )
}

function ProgressRing({ value }: { value: number }) {
  return <div className="progress-ring" style={{ '--progress': `${value * 3.6}deg` } as React.CSSProperties}><span>{value}%</span></div>
}

function ProjectsPanel({ selectedProjects }: { selectedProjects: Project[] }) {
  return (
    <section className="panel projects-panel">
      <div className="panel-head">
        <div><span className="eyebrow">ACOMPANHAMENTO</span><h2>Saúde das obras</h2></div>
        <button className="text-button">Todas as obras <ArrowRight size={15} /></button>
      </div>
      <div className="project-list">
        {selectedProjects.map(project => (
          <button className="project-row" key={project.id}>
            <ProgressRing value={project.progress} />
            <div className="project-main">
              <div><strong>{project.name}</strong><span className={`status ${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span></div>
              <small>{project.stage} · {project.location}</small>
              <div className="project-progress"><i style={{ width: `${project.progress}%` }} /></div>
            </div>
            <div className="milestone"><small>Próximo marco</small><strong>{project.nextMilestone}</strong><span>{project.milestoneDate}</span></div>
            <ChevronRight size={19} className="row-chevron" />
          </button>
        ))}
      </div>
    </section>
  )
}

function AlertsPanel({ projectIds }: { projectIds: string[] }) {
  const visible = alerts.filter(alert => projectIds.includes(alert.projectId))
  return (
    <section className="panel alerts-panel">
      <div className="panel-head"><div><span className="eyebrow">REQUER ATENÇÃO</span><h2>Alertas recentes</h2></div><span className="count-pill">{visible.length}</span></div>
      <div className="alert-list">
        {visible.length ? visible.map(alert => (
          <button className="alert-row" key={alert.id}>
            <span className={`alert-icon ${alert.level}`}><AlertTriangle size={17} /></span>
            <span className="alert-copy"><strong>{alert.title}</strong><small>{alert.description}</small><em>{alert.age}</em></span>
            <ChevronRight size={17} />
          </button>
        )) : <div className="empty-state"><ClipboardCheck size={25} /><strong>Tudo em ordem</strong><span>Nenhum alerta para esta obra.</span></div>}
      </div>
      <button className="panel-footer-button">Central de alertas <ArrowRight size={15} /></button>
    </section>
  )
}

function OrdersPanel({ projectIds }: { projectIds: string[] }) {
  const visible = orders.filter(order => projectIds.includes(order.projectId))
  return (
    <section className="panel orders-panel">
      <div className="panel-head"><div><span className="eyebrow">SUPRIMENTOS</span><h2>Pedidos recentes</h2></div><button className="text-button">Ver pedidos <ArrowRight size={15} /></button></div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Pedido</th><th>Item / fornecedor</th><th>Valor</th><th>Status</th><th>Data</th></tr></thead>
          <tbody>{visible.map(order => <tr key={order.id}>
            <td><strong>{order.id}</strong></td>
            <td><strong>{order.item}</strong><small>{order.supplier}</small></td>
            <td>{currency.format(order.value)}</td>
            <td><span className={`order-status ${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span></td>
            <td>{order.date}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}

function OperationalView({ project, onOpenDiary, onOpenAttendance }: { project: Project; onOpenDiary: () => void; onOpenAttendance: () => void }) {
  const actions = [
    { icon: FileText, title: 'Diário de obra', detail: 'Registrar atividades e fotos', tone: 'green' },
    { icon: Users, title: 'Presença', detail: `${project.team} pessoas hoje`, tone: 'blue' },
    { icon: Plus, title: 'Pedir material', detail: 'Nova solicitação ao suprimentos', tone: 'amber' },
    { icon: PackageCheck, title: 'Dar baixa', detail: '2 entregas aguardando', tone: 'red' },
  ]
  return <div className="operational-view">
    <section className="mobile-hero">
      <span className="eyebrow">OBRA DE HOJE</span><h1>{project.name}</h1><p>{project.stage} · {project.progress}% concluída</p>
      <div className="mobile-progress"><i style={{ width: `${project.progress}%` }} /></div>
    </section>
    <div className="action-grid">{actions.map(({ icon: Icon, title, detail, tone }) => <button className="action-card" key={title} onClick={title === 'Diário de obra' ? onOpenDiary : title === 'Presença' ? onOpenAttendance : undefined}>
      <span className={`action-icon ${tone}`}><Icon size={23} /></span><strong>{title}</strong><small>{detail}</small><ArrowRight size={17} />
    </button>)}</div>
    <div className="mobile-columns"><AlertsPanel projectIds={[project.id]} /><section className="panel today-panel"><div className="panel-head"><div><span className="eyebrow">HOJE</span><h2>Resumo do canteiro</h2></div></div><div className="today-stats"><div><Users /><span><strong>{project.team}</strong> presentes</span></div><div><ClipboardCheck /><span><strong>4 de 6</strong> tarefas</span></div><div><PackageCheck /><span><strong>2</strong> entregas</span></div></div></section></div>
  </div>
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

function ProjectsModule({ items, onNew, onOpen, canCreate }: { items: Project[]; onNew: () => void; onOpen: (project: Project) => void; canCreate: boolean }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todas')

  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    return items.filter(project => {
      const matchesQuery = !normalizedQuery || [project.name, project.location, project.manager, project.stage]
        .some(value => value.toLocaleLowerCase('pt-BR').includes(normalizedQuery))
      const matchesStatus = statusFilter === 'Todas' || project.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [items, query, statusFilter])

  const onSchedule = items.filter(project => project.status === 'No prazo').length
  const needsAttention = items.length - onSchedule
  const totalBudget = items.reduce((sum, project) => sum + project.budget, 0)
  const averageProgress = items.length ? Math.round(items.reduce((sum, project) => sum + project.progress, 0) / items.length) : 0

  return <div className="projects-module">
    <section className="portfolio-summary">
      <div><span className="summary-icon green"><Building2 size={20} /></span><small>Obras ativas</small><strong>{items.length}</strong></div>
      <div><span className="summary-icon blue"><CheckCircle2 size={20} /></span><small>No prazo</small><strong>{onSchedule}</strong></div>
      <div><span className="summary-icon amber"><AlertTriangle size={20} /></span><small>Requerem atenção</small><strong>{needsAttention}</strong></div>
      <div><span className="summary-icon violet"><TrendingUp size={20} /></span><small>Avanço médio</small><strong>{averageProgress}%</strong></div>
      <div><span className="summary-icon gold"><WalletCards size={20} /></span><small>Orçamento total</small><strong>{compactCurrency.format(totalBudget)}</strong></div>
    </section>

    <section className="panel project-catalog">
      <div className="catalog-toolbar">
        <div>
          <span className="eyebrow">PORTFÓLIO</span>
          <h2>Todas as obras</h2>
          <p>Gerencie prazos, equipes e desempenho de cada projeto.</p>
        </div>
        {canCreate && <button className="primary-button" onClick={onNew}><Plus size={17} /> Nova obra</button>}
      </div>
      <div className="catalog-filters">
        <label className="catalog-search"><Search size={17} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar por obra, cidade ou responsável..." /></label>
        <label className="select-control"><SlidersHorizontal size={16} /><select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>Todas</option><option>No prazo</option><option>Atenção</option><option>Atrasada</option></select><ChevronDown size={15} /></label>
        <span className="result-count">{visibleProjects.length} {visibleProjects.length === 1 ? 'obra encontrada' : 'obras encontradas'}</span>
      </div>
      {visibleProjects.length ? <div className="project-card-grid">
        {visibleProjects.map(project => {
          const usedBudget = project.budget ? Math.round((project.spent / project.budget) * 100) : 0
          return <article className="project-card" key={project.id}>
            <div className="project-card-top">
              <div className="project-monogram">{project.name.split(' ').slice(0, 2).map(word => word[0]).join('')}</div>
              <span className={`status ${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span>
              <button className="icon-button ghost"><MoreHorizontal size={18} /></button>
            </div>
            <div className="project-card-title"><h3>{project.name}</h3><span><MapPin size={13} /> {project.location}</span></div>
            <div className="card-progress-head"><span>Avanço físico</span><strong>{project.progress}%</strong></div>
            <div className="card-progress"><i style={{ width: `${project.progress}%` }} /></div>
            <div className="project-card-data">
              <div><small>Etapa atual</small><strong>{project.stage}</strong></div>
              <div><small>Orçamento usado</small><strong>{usedBudget}%</strong></div>
              <div><small>Responsável</small><strong>{project.manager}</strong></div>
              <div><small>Previsão de entrega</small><strong>{dateFormatter.format(new Date(`${project.endDate}T12:00:00`))}</strong></div>
            </div>
            <div className="project-card-footer"><span><Users size={14} /> {project.team} na equipe</span><button onClick={() => onOpen(project)}>Abrir obra <ArrowRight size={15} /></button></div>
          </article>
        })}
      </div> : <div className="catalog-empty"><Search size={25} /><strong>Nenhuma obra encontrada</strong><span>Tente alterar a busca ou os filtros selecionados.</span><button onClick={() => { setQuery(''); setStatusFilter('Todas') }}>Limpar filtros</button></div>}
    </section>
  </div>
}

const diaryDateFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })

async function compressPhoto(file: File): Promise<DailyLogPhoto> {
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

  return new Promise(resolve => {
    const image = new window.Image()
    image.onload = () => {
      const maxSize = 900
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d')
      context?.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve({ id: `foto-${Date.now()}-${Math.random()}`, name: file.name, dataUrl: canvas.toDataURL('image/jpeg', .76) })
    }
    image.onerror = () => resolve({ id: `foto-${Date.now()}-${Math.random()}`, name: file.name, dataUrl: source })
    image.src = source
  })
}

function DiaryPhotoView({ photo }: { photo: DailyLogPhoto }) {
  return <div className={`diary-photo ${photo.theme ?? 'uploaded'}`}>
    {photo.dataUrl ? <img src={photo.dataUrl} alt={photo.name} /> : <><Camera size={21} /><span>{photo.name}</span></>}
  </div>
}

type AttendanceDraft = { status: AttendanceStatus | ''; checkIn: string; checkOut: string; note: string }

function AttendancePanel({ project, members, records, onSave }: { project: Project; members: TeamMember[]; records: AttendanceRecord[]; onSave: (projectId: string, date: string, entries: AttendanceRecord[]) => Promise<boolean> }) {
  const [date, setDate] = useState('2026-07-20')
  const [query, setQuery] = useState('')
  const [drafts, setDrafts] = useState<Record<string, AttendanceDraft>>({})
  const [saved, setSaved] = useState(false)
  const projectMembers = useMemo(() => members.filter(member => member.projectId === project.id), [members, project.id])

  useEffect(() => {
    const dayRecords = records.filter(record => record.projectId === project.id && record.date === date)
    setDrafts(Object.fromEntries(projectMembers.map(member => {
      const record = dayRecords.find(item => item.memberId === member.id)
      return [member.id, record
        ? { status: record.status, checkIn: record.checkIn, checkOut: record.checkOut, note: record.note }
        : { status: '', checkIn: '', checkOut: '', note: '' }]
    })))
  }, [date, project.id, projectMembers, records])

  useEffect(() => {
    setSaved(false)
  }, [date, project.id])

  const visibleMembers = projectMembers.filter(member => {
    const normalized = query.trim().toLocaleLowerCase('pt-BR')
    return !normalized || [member.name, member.role, member.company ?? '', member.employmentType].some(value => value.toLocaleLowerCase('pt-BR').includes(normalized))
  })
  const values = Object.values(drafts)
  const present = values.filter(value => value.status === 'Presente').length
  const absent = values.filter(value => value.status === 'Ausente').length
  const partial = values.filter(value => value.status === 'Meio período').length
  const pending = Math.max(0, projectMembers.length - present - absent - partial)
  const attendanceRate = projectMembers.length ? Math.round(((present + partial) / projectMembers.length) * 100) : 0

  function updateDraft(memberId: string, changes: Partial<AttendanceDraft>) {
    setDrafts(current => ({ ...current, [memberId]: { ...current[memberId], ...changes } }))
    setSaved(false)
  }

  function markAllPresent() {
    setDrafts(current => Object.fromEntries(projectMembers.map(member => [member.id, {
      status: 'Presente' as AttendanceStatus,
      checkIn: current[member.id]?.checkIn || '07:00',
      checkOut: current[member.id]?.checkOut || '17:00',
      note: current[member.id]?.note || '',
    }])))
    setSaved(false)
  }

  async function saveAttendance() {
    const entries = projectMembers.flatMap(member => {
      const draft = drafts[member.id]
      if (!draft?.status) return []
      return [{ id: `pres-${project.id}-${date}-${member.id}`, projectId: project.id, memberId: member.id, date, status: draft.status, checkIn: draft.checkIn, checkOut: draft.checkOut, note: draft.note }]
    })
    const didSave = await onSave(project.id, date, entries)
    setSaved(didSave)
  }

  function exportCsv() {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`
    const rows = projectMembers.map(member => {
      const draft = drafts[member.id] ?? { status: '', checkIn: '', checkOut: '', note: '' }
      return [member.name, member.role, member.employmentType, member.company ?? '', draft.status || 'Não registrado', draft.checkIn, draft.checkOut, draft.note].map(escapeCell).join(';')
    })
    const content = ['Nome;Função;Vínculo;Empresa;Situação;Entrada;Saída;Observação', ...rows].join('\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `presenca-${project.id}-${date}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return <div className="attendance-panel">
    <section className="attendance-summary">
      <div><span className="attendance-metric present"><UserCheck size={18} /></span><small>Presentes</small><strong>{present}</strong></div>
      <div><span className="attendance-metric partial"><Users size={18} /></span><small>Meio período</small><strong>{partial}</strong></div>
      <div><span className="attendance-metric absent"><X size={18} /></span><small>Ausentes</small><strong>{absent}</strong></div>
      <div><span className="attendance-metric pending"><AlertTriangle size={18} /></span><small>Não registrados</small><strong>{pending}</strong></div>
      <div className="attendance-rate"><span><small>Taxa de presença</small><strong>{attendanceRate}%</strong></span><div><i style={{ width: `${attendanceRate}%` }} /></div></div>
    </section>
    <div className="attendance-controls">
      <label className="attendance-date"><CalendarDays size={16} /><input type="date" value={date} onChange={event => { setDate(event.target.value); setSaved(false) }} /></label>
      <label className="catalog-search"><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar na equipe..." /></label>
      <button className="secondary-button" onClick={markAllPresent}><CheckCircle2 size={15} /> Marcar todos presentes</button>
      <button className="secondary-button" onClick={exportCsv}><Download size={15} /> Exportar CSV</button>
    </div>
    <div className="attendance-table-wrap">
      <table className="attendance-table">
        <thead><tr><th>Colaborador</th><th>Vínculo</th><th>Situação</th><th>Entrada</th><th>Saída</th><th>Observação</th></tr></thead>
        <tbody>{visibleMembers.map(member => {
          const draft = drafts[member.id] ?? { status: '', checkIn: '', checkOut: '', note: '' }
          const initials = member.name.split(' ').slice(0, 2).map(word => word[0]).join('')
          return <tr key={member.id}>
            <td><div className="member-cell"><span>{initials}</span><div><strong>{member.name}</strong><small>{member.role}</small></div></div></td>
            <td><span className={`employment-badge ${member.employmentType === 'Próprio' ? 'own' : 'outsourced'}`}>{member.employmentType}</span>{member.company && <small>{member.company}</small>}</td>
            <td><select aria-label={`Situação de ${member.name}`} className={`attendance-status-select ${draft.status ? draft.status.toLowerCase().replace(' ', '-') : 'unregistered'}`} value={draft.status} onChange={event => { const status = event.target.value as AttendanceStatus | ''; updateDraft(member.id, { status, checkIn: status === 'Ausente' ? '' : draft.checkIn, checkOut: status === 'Ausente' ? '' : draft.checkOut }) }}><option value="">Não registrado</option><option>Presente</option><option>Meio período</option><option>Ausente</option></select></td>
            <td><input aria-label={`Entrada de ${member.name}`} className="time-input" type="time" disabled={!draft.status || draft.status === 'Ausente'} value={draft.checkIn} onChange={event => updateDraft(member.id, { checkIn: event.target.value })} /></td>
            <td><input aria-label={`Saída de ${member.name}`} className="time-input" type="time" disabled={!draft.status || draft.status === 'Ausente'} value={draft.checkOut} onChange={event => updateDraft(member.id, { checkOut: event.target.value })} /></td>
            <td><input aria-label={`Observação de ${member.name}`} className="attendance-note-input" value={draft.note} onChange={event => updateDraft(member.id, { note: event.target.value })} placeholder="Adicionar observação" /></td>
          </tr>
        })}</tbody>
      </table>
    </div>
    <div className="attendance-footer"><span>{saved ? <><CheckCircle2 size={15} /> Presença salva com sucesso</> : `${visibleMembers.length} de ${projectMembers.length} colaboradores exibidos`}</span><button className="primary-button" onClick={saveAttendance}><CheckCircle2 size={16} /> Salvar presença</button></div>
  </div>
}

type SiteTab = 'diary' | 'attendance' | 'gallery'

function SiteModule({ projectItems, logs, members, attendance, activeProjectId, activeTab, onTabChange, onProjectChange, onNewLog, onSaveAttendance }: { projectItems: Project[]; logs: DailyLog[]; members: TeamMember[]; attendance: AttendanceRecord[]; activeProjectId: string; activeTab: SiteTab; onTabChange: (tab: SiteTab) => void; onProjectChange: (id: string) => void; onNewLog: (projectId: string) => void; onSaveAttendance: (projectId: string, date: string, entries: AttendanceRecord[]) => Promise<boolean> }) {
  const project = projectItems.find(item => item.id === activeProjectId) ?? projectItems[0]
  const projectLogs = useMemo(() => logs
    .filter(log => log.projectId === project?.id)
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)), [logs, project?.id])

  if (!project) return <div className="empty-state"><HardHat size={28} /><strong>Nenhuma obra disponível</strong><span>Cadastre uma obra para iniciar o diário.</span></div>

  const latestLog = projectLogs[0]
  const photoCount = projectLogs.reduce((sum, log) => sum + log.photos.length, 0)
  const occurrences = projectLogs.filter(log => log.occurrences && !log.occurrences.toLocaleLowerCase('pt-BR').startsWith('nenhuma')).length
  const allPhotos = projectLogs.flatMap(log => log.photos.map(photo => ({ photo, log })))

  return <div className="site-module">
    <section className="site-hero">
      <div className="site-project-copy"><span className="site-icon"><HardHat size={23} /></span><div><span className="eyebrow">OBRA SELECIONADA</span><h2>{project.name}</h2><p><MapPin size={13} /> {project.location} <i /> {project.stage}</p></div></div>
      <label className="site-project-select"><Building2 size={17} /><select value={project.id} onChange={event => onProjectChange(event.target.value)}>{projectItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown size={15} /></label>
      <div className="site-hero-progress"><div><span>Avanço físico</span><strong>{project.progress}%</strong></div><div className="site-progress-track"><i style={{ width: `${project.progress}%` }} /></div></div>
    </section>

    <section className="site-summary">
      <div><span className="summary-icon green"><BookOpen size={20} /></span><small>Registros no diário</small><strong>{projectLogs.length}</strong></div>
      <div><span className="summary-icon blue"><Users size={20} /></span><small>Equipe no último registro</small><strong>{latestLog?.teamCount ?? 0}</strong></div>
      <div><span className="summary-icon violet"><Camera size={20} /></span><small>Fotos documentadas</small><strong>{photoCount}</strong></div>
      <div><span className="summary-icon amber"><AlertTriangle size={20} /></span><small>Ocorrências registradas</small><strong>{occurrences}</strong></div>
    </section>

    <section className="panel diary-panel">
      <div className="diary-toolbar">
        <div className="diary-tabs"><button className={activeTab === 'diary' ? 'active' : ''} onClick={() => onTabChange('diary')}><BookOpen size={16} /> Diário de obra</button><button className={activeTab === 'attendance' ? 'active' : ''} onClick={() => onTabChange('attendance')}><UserCheck size={16} /> Presença</button><button className={activeTab === 'gallery' ? 'active' : ''} onClick={() => onTabChange('gallery')}><Camera size={16} /> Galeria <b>{photoCount}</b></button></div>
        {activeTab === 'diary' && <button className="primary-button" onClick={() => onNewLog(project.id)}><Plus size={17} /> Novo registro</button>}
      </div>

      {activeTab === 'diary' ? <div className="diary-timeline">
        {projectLogs.length ? projectLogs.map((log, index) => <article className="diary-entry" key={log.id}>
          <div className="timeline-marker"><i /><span /></div>
          <div className="diary-entry-card">
            <div className="diary-entry-head">
              <div><span className="diary-day">{log.date === '2026-07-20' && index === 0 ? 'HOJE' : 'REGISTRO'}</span><h3>{diaryDateFormatter.format(new Date(`${log.date}T12:00:00`))}</h3><small>Registrado por {log.author} · {new Date(log.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>
              <div className="weather-chip"><CloudSun size={17} /><span><strong>{log.weather}</strong><small>{log.temperature}°C</small></span></div>
            </div>
            <div className="diary-entry-body">
              <div className="diary-activities"><span className="section-label">ATIVIDADES EXECUTADAS</span><ul>{log.activities.map(activity => <li key={activity}><CheckCircle2 size={14} /> {activity}</li>)}</ul></div>
              <div className="diary-team"><Users size={18} /><span><strong>{log.teamCount}</strong><small>pessoas na obra</small></span></div>
            </div>
            {log.notes && <div className="diary-note"><strong>Resumo do dia</strong><p>{log.notes}</p></div>}
            {log.occurrences && <div className={`diary-occurrence ${log.occurrences.toLocaleLowerCase('pt-BR').startsWith('nenhuma') ? 'clear' : ''}`}><AlertTriangle size={16} /><span><strong>Ocorrências</strong><small>{log.occurrences}</small></span></div>}
            {log.photos.length > 0 && <div className="diary-photos">{log.photos.map(photo => <DiaryPhotoView photo={photo} key={photo.id} />)}</div>}
          </div>
        </article>) : <div className="catalog-empty"><BookOpen size={27} /><strong>O diário ainda está em branco</strong><span>Faça o primeiro registro desta obra.</span><button onClick={() => onNewLog(project.id)}>Criar primeiro registro</button></div>}
      </div> : activeTab === 'gallery' ? <div className="gallery-grid">
        {allPhotos.length ? allPhotos.map(({ photo, log }) => <article className="gallery-item" key={photo.id}><DiaryPhotoView photo={photo} /><div><strong>{photo.name}</strong><span>{new Date(`${log.date}T12:00:00`).toLocaleDateString('pt-BR')} · {log.author}</span></div></article>) : <div className="catalog-empty"><Camera size={27} /><strong>Nenhuma foto adicionada</strong><span>As fotos dos registros aparecerão aqui.</span></div>}
      </div> : <AttendancePanel project={project} members={members} records={attendance} onSave={onSaveAttendance} />}
    </section>
  </div>
}

function NewDailyLogModal({ project, onClose, onSave }: { project: Project; onClose: () => void; onSave: (log: DailyLog) => Promise<boolean> }) {
  const [date, setDate] = useState('2026-07-20')
  const [weather, setWeather] = useState<DailyLog['weather']>('Ensolarado')
  const [temperature, setTemperature] = useState('25')
  const [teamCount, setTeamCount] = useState(String(project.team || ''))
  const [activities, setActivities] = useState('')
  const [notes, setNotes] = useState('')
  const [occurrences, setOccurrences] = useState('Nenhuma ocorrência de segurança registrada.')
  const [photos, setPhotos] = useState<DailyLogPhoto[]>([])
  const [processingPhotos, setProcessingPhotos] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    setProcessingPhotos(true)
    const remaining = Math.max(0, 4 - photos.length)
    const selected = Array.from(files).slice(0, remaining)
    const compressed = await Promise.all(selected.map(compressPhoto))
    setPhotos(current => [...current, ...compressed].slice(0, 4))
    setProcessingPhotos(false)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const activityList = activities.split('\n').map(item => item.trim()).filter(Boolean)
    if (!activityList.length) return
    setSubmitting(true)
    await onSave({
      id: `rdo-${Date.now()}`,
      projectId: project.id,
      date,
      weather,
      temperature: Number(temperature),
      teamCount: Number(teamCount),
      activities: activityList,
      notes: notes.trim(),
      occurrences: occurrences.trim(),
      author: 'Ruan Correia',
      createdAt: new Date().toISOString(),
      photos,
    })
    setSubmitting(false)
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal diary-modal" role="dialog" aria-modal="true" aria-labelledby="new-log-title" onMouseDown={event => event.stopPropagation()}>
      <div className="modal-head"><div><span className="eyebrow">{project.name.toLocaleUpperCase('pt-BR')}</span><h2 id="new-log-title">Novo diário de obra</h2><p>Registre o que aconteceu no canteiro e documente o avanço do dia.</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
      <form onSubmit={submit}>
        <div className="form-grid diary-form-grid">
          <label className="form-field"><span>Data do registro</span><input required type="date" value={date} onChange={event => setDate(event.target.value)} /></label>
          <label className="form-field"><span>Condição do tempo</span><select value={weather} onChange={event => setWeather(event.target.value as DailyLog['weather'])}><option>Ensolarado</option><option>Parcialmente nublado</option><option>Chuvoso</option></select></label>
          <label className="form-field"><span>Temperatura</span><div className="suffix-input"><input required type="number" min="-10" max="55" value={temperature} onChange={event => setTemperature(event.target.value)} /><b>°C</b></div></label>
          <label className="form-field"><span>Equipe presente</span><div className="suffix-input"><input required type="number" min="0" value={teamCount} onChange={event => setTeamCount(event.target.value)} /><b>pessoas</b></div></label>
          <label className="form-field full"><span>Atividades executadas <em>uma atividade por linha</em></span><textarea required rows={4} value={activities} onChange={event => setActivities(event.target.value)} placeholder={'Elevação da alvenaria do térreo\nConferência das instalações elétricas'} /></label>
          <label className="form-field full"><span>Resumo do dia</span><textarea rows={3} value={notes} onChange={event => setNotes(event.target.value)} placeholder="Descreva o avanço, materiais utilizados e pontos relevantes..." /></label>
          <label className="form-field full"><span>Ocorrências</span><textarea rows={2} value={occurrences} onChange={event => setOccurrences(event.target.value)} placeholder="Atrasos, acidentes, visitas técnicas ou impedimentos..." /></label>
          <div className="form-field full"><span>Fotos do canteiro <em>até 4 imagens</em></span><div className="photo-upload-grid">{photos.map(photo => <div className="upload-preview" key={photo.id}><img src={photo.dataUrl} alt={photo.name} /><button type="button" onClick={() => setPhotos(current => current.filter(item => item.id !== photo.id))} aria-label={`Remover ${photo.name}`}><X size={14} /></button></div>)}{photos.length < 4 && <label className="photo-upload"><input type="file" accept="image/*" multiple onChange={event => addPhotos(event.target.files)} /><Upload size={20} /><strong>{processingPhotos ? 'Processando...' : 'Adicionar fotos'}</strong><small>JPG ou PNG</small></label>}</div></div>
        </div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button" disabled={processingPhotos || submitting}><CheckCircle2 size={17} /> {submitting ? 'Salvando...' : 'Salvar diário'}</button></div>
      </form>
    </section>
  </div>
}

function NewProjectModal({ onClose, onSave }: { onClose: () => void; onSave: (project: Project) => void }) {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [manager, setManager] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')
  const [marketValue, setMarketValue] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsedEndDate = new Date(`${endDate}T12:00:00`)
    onSave({
      id: `obra-${Date.now()}`,
      name: name.trim(),
      location: location.trim(),
      manager: manager.trim(),
      startDate,
      endDate,
      stage: 'Planejamento',
      progress: 0,
      scheduleProgress: 0,
      invested: 0,
      marketValue: Number(marketValue),
      spent: 0,
      budget: Number(budget),
      status: 'No prazo',
      nextMilestone: 'Mobilização do canteiro',
      milestoneDate: parsedEndDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      team: 0,
    })
  }

  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="new-project-title" onMouseDown={event => event.stopPropagation()}>
      <div className="modal-head"><div><span className="eyebrow">NOVO PROJETO</span><h2 id="new-project-title">Cadastrar obra</h2><p>Preencha as informações essenciais. Os demais detalhes poderão ser adicionados depois.</p></div><button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={20} /></button></div>
      <form onSubmit={submit}>
        <div className="form-grid">
          <label className="form-field full"><span>Nome da obra</span><input required autoFocus value={name} onChange={event => setName(event.target.value)} placeholder="Ex.: Residencial Primavera" /></label>
          <label className="form-field"><span>Cidade / UF</span><input required value={location} onChange={event => setLocation(event.target.value)} placeholder="Niterói, RJ" /></label>
          <label className="form-field"><span>Responsável técnico</span><input required value={manager} onChange={event => setManager(event.target.value)} placeholder="Nome completo" /></label>
          <label className="form-field"><span>Data de início</span><input required type="date" value={startDate} onChange={event => setStartDate(event.target.value)} /></label>
          <label className="form-field"><span>Previsão de entrega</span><input required type="date" min={startDate} value={endDate} onChange={event => setEndDate(event.target.value)} /></label>
          <label className="form-field"><span>Orçamento previsto</span><div className="money-input"><b>R$</b><input required min="1" step="0.01" type="number" value={budget} onChange={event => setBudget(event.target.value)} placeholder="1.500.000" /></div></label>
          <label className="form-field"><span>Valor venal estimado</span><div className="money-input"><b>R$</b><input required min="1" step="0.01" type="number" value={marketValue} onChange={event => setMarketValue(event.target.value)} placeholder="2.200.000" /></div></label>
        </div>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button"><Plus size={17} /> Cadastrar obra</button></div>
      </form>
    </section>
  </div>
}

function App() {
  const { user, token, logout } = useAuth()
  const [role, setRole] = useState<Role>(user?.role ?? 'admin')
  const [selectedProject, setSelectedProject] = useState('all')
  const [active, setActive] = useState('Visão geral')
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)
  const [newDailyLogProjectId, setNewDailyLogProjectId] = useState<string | null>(null)
  const [siteTab, setSiteTab] = useState<SiteTab>('diary')
  const [projectApiError, setProjectApiError] = useState('')
  const [projectList, setProjectList] = useState<Project[]>(() => loadCollection(storageKeys.projects, projects))
  const [dailyLogList, setDailyLogList] = useState<DailyLog[]>(() => loadCollection(storageKeys.dailyLogs, demoDailyLogs))
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>(() => loadCollection(storageKeys.attendance, demoAttendanceRecords))

  useEffect(() => {
    if (!token) return
    listProjectsRequest(token)
      .then(items => {
        setProjectList(items)
        setProjectApiError('')
      })
      .catch(error => setProjectApiError(error instanceof Error ? error.message : 'Não foi possível sincronizar as obras.'))
  }, [token])

  useEffect(() => {
    if (!token) return
    Promise.all([listDailyLogsRequest(token), listAttendanceRequest(token)])
      .then(([logs, attendance]) => {
        setDailyLogList(logs)
        setAttendanceList(attendance)
        setProjectApiError('')
      })
      .catch(error => setProjectApiError(error instanceof Error ? error.message : 'Não foi possível sincronizar o canteiro.'))
  }, [token])

  useEffect(() => {
    saveCollection(storageKeys.projects, projectList)
  }, [projectList])

  useEffect(() => {
    saveCollection(storageKeys.dailyLogs, dailyLogList)
  }, [dailyLogList])

  useEffect(() => {
    saveCollection(storageKeys.attendance, attendanceList)
  }, [attendanceList])

  const selectedProjects = useMemo(() => {
    if (role === 'foreman' || role === 'client') return projectList.length ? [projectList[0]] : []
    return selectedProject === 'all' ? projectList : projectList.filter(project => project.id === selectedProject)
  }, [role, selectedProject, projectList])

  const totals = useMemo(() => selectedProjects.reduce((acc, item) => ({
    invested: acc.invested + item.invested,
    market: acc.market + item.marketValue,
    spent: acc.spent + item.spent,
    budget: acc.budget + item.budget,
  }), { invested: 0, market: 0, spent: 0, budget: 0 }), [selectedProjects])

  const margin = totals.market - totals.invested
  const marginPct = totals.market ? (margin / totals.market) * 100 : 0
  const budgetUse = totals.budget ? (totals.spent / totals.budget) * 100 : 0
  const isOperational = role === 'foreman'
  const isOperationalHome = isOperational && active === 'Visão geral'
  const siteProjectItems = isOperational || role === 'client' ? projectList.slice(0, 1) : projectList
  const siteActiveProjectId = selectedProject !== 'all' && siteProjectItems.some(project => project.id === selectedProject)
    ? selectedProject : siteProjectItems[0]?.id ?? ''
  const newDailyLogProject = projectList.find(project => project.id === newDailyLogProjectId)
  const pageTitle = isOperationalHome ? 'Bom trabalho, Ruan.' : active === 'Obras' ? 'Obras' : active === 'Canteiro' ? 'Canteiro' : 'Visão geral'
  const pageSubtitle = isOperationalHome
    ? 'Tudo o que você precisa registrar no canteiro hoje.'
    : active === 'Obras' ? 'Controle seu portfólio e acompanhe cada projeto.'
      : active === 'Canteiro' ? 'Diário, equipe e evidências do avanço físico.' : 'Acompanhe o desempenho das suas obras em um só lugar.'

  async function saveProject(project: Project) {
    if (!token) return
    try {
      const savedProject = await createProjectRequest(token, project)
      setProjectList(current => [savedProject, ...current])
      setProjectApiError('')
      setShowNewProject(false)
    } catch (error) {
      setProjectApiError(error instanceof Error ? error.message : 'Não foi possível cadastrar a obra.')
    }
  }

  function openProject(project: Project) {
    setSelectedProject(project.id)
    setActive('Visão geral')
  }

  async function saveDailyLog(log: DailyLog): Promise<boolean> {
    if (!token) return false
    try {
      const savedLog = await createDailyLogRequest(token, log)
      setDailyLogList(current => [savedLog, ...current])
      setProjectApiError('')
      setNewDailyLogProjectId(null)
      return true
    } catch (error) {
      setProjectApiError(error instanceof Error ? error.message : 'Não foi possível salvar o diário.')
      return false
    }
  }

  async function saveAttendance(projectId: string, date: string, entries: AttendanceRecord[]): Promise<boolean> {
    if (!token) return false
    try {
      const savedEntries = await saveAttendanceRequest(token, projectId, date, entries)
      setAttendanceList(current => [
        ...current.filter(record => !(record.projectId === projectId && record.date === date)),
        ...savedEntries,
      ])
      setProjectApiError('')
      return true
    } catch (error) {
      setProjectApiError(error instanceof Error ? error.message : 'Não foi possível salvar a presença.')
      return false
    }
  }

  return <div className="app-shell">
    <Sidebar open={menuOpen} close={() => setMenuOpen(false)} active={active} setActive={setActive} role={role} projectCount={projectList.length} />
    <main>
      <header className="topbar">
        <button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
        <div className="mobile-logo"><Logo /></div>
        <div className="search-box"><Search size={18} /><input placeholder="Buscar obra, pedido ou documento..." /><kbd>⌘ K</kbd></div>
        <div className="top-actions">
          <button className="icon-button notification"><Bell size={20} /><i /></button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setRoleOpen(value => !value)}>
              <span className="avatar">RC</span><span className="profile-copy"><strong>{user?.name ?? 'Usuário'}</strong><small>{roles[role].label}</small></span><ChevronDown size={16} />
            </button>
            {roleOpen && <div className="role-menu"><span>Visualizar como</span>{(Object.keys(roles) as Role[]).map(key => <button key={key} className={role === key ? 'selected' : ''} onClick={() => { setRole(key); setRoleOpen(false); setSelectedProject('all') }}><strong>{roles[key].label}</strong><small>{roles[key].detail}</small></button>)}<button className="logout-button" onClick={logout}><strong>Sair da conta</strong><small>Encerrar esta sessão</small></button></div>}
          </div>
        </div>
      </header>

      <div className="content">
        {projectApiError && <div className="api-error" role="alert"><AlertTriangle size={17} /><span>{projectApiError}</span><button onClick={() => setProjectApiError('')}>Fechar</button></div>}
        <div className="page-heading">
          <div><span className="eyebrow">SEGUNDA, 20 DE JULHO</span><h1>{pageTitle}</h1><p>{pageSubtitle}</p></div>
          {!isOperational && role !== 'client' && active === 'Visão geral' && <div className="heading-actions">
            <label className="select-control"><Building2 size={17} /><select value={selectedProject} onChange={event => setSelectedProject(event.target.value)}><option value="all">Todas as obras</option>{projectList.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}</select><ChevronDown size={15} /></label>
            <label className="select-control compact"><CalendarDays size={17} /><select><option>Últimos 6 meses</option><option>Este mês</option><option>Este ano</option></select><ChevronDown size={15} /></label>
            {role === 'admin' && <button className="primary-button" onClick={() => setShowNewProject(true)}><Plus size={17} /> Nova obra</button>}
          </div>}
        </div>

        {isOperationalHome && projectList.length ? <OperationalView project={projectList[0]} onOpenDiary={() => { setSiteTab('diary'); setActive('Canteiro') }} onOpenAttendance={() => { setSiteTab('attendance'); setActive('Canteiro') }} /> : active === 'Obras' && !isOperational
          ? <ProjectsModule items={role === 'client' ? selectedProjects : projectList} onNew={() => setShowNewProject(true)} onOpen={openProject} canCreate={role === 'admin'} />
          : active === 'Canteiro'
            ? <SiteModule projectItems={siteProjectItems} logs={dailyLogList} members={teamMembers} attendance={attendanceList} activeProjectId={siteActiveProjectId} activeTab={siteTab} onTabChange={setSiteTab} onProjectChange={setSelectedProject} onNewLog={setNewDailyLogProjectId} onSaveAttendance={saveAttendance} />
          : <>
          {active !== 'Visão geral' && <div className="module-banner"><span><Boxes size={20} /></span><div><strong>Módulo {active}</strong><small>Fundação pronta para a próxima etapa de implementação.</small></div><button onClick={() => setActive('Visão geral')}>Voltar à visão geral</button></div>}
          {role !== 'client' && <section className="kpi-grid">
            <KpiCard label="Capital investido" value={compactCurrency.format(totals.invested)} detail="8,4% nos últimos 6 meses" trend="up" icon={CircleDollarSign} tone="green" />
            <KpiCard label="Valor venal estimado" value={compactCurrency.format(totals.market)} detail={`${currency.format(margin)} de valor gerado`} trend="up" icon={Building2} tone="gold" />
            <KpiCard label="Margem projetada" value={`${marginPct.toFixed(1).replace('.', ',')}%`} detail="2,1 p.p. acima da meta" trend="up" icon={TrendingUp} tone="blue" />
            <KpiCard label="Orçamento consumido" value={`${budgetUse.toFixed(1).replace('.', ',')}%`} detail={`${compactCurrency.format(Math.max(totals.budget - totals.spent, 0))} disponíveis`} icon={WalletCards} tone="violet" />
          </section>}
          <div className="dashboard-grid">
            {role !== 'client' && <PortfolioChart selectedProjects={selectedProjects} />}
            <AlertsPanel projectIds={selectedProjects.map(project => project.id)} />
            <ProjectsPanel selectedProjects={selectedProjects} />
            {role !== 'client' && <OrdersPanel projectIds={selectedProjects.map(project => project.id)} />}
          </div>
        </>}
      </div>
    </main>
    {showNewProject && <NewProjectModal onClose={() => setShowNewProject(false)} onSave={saveProject} />}
    {newDailyLogProject && <NewDailyLogModal project={newDailyLogProject} onClose={() => setNewDailyLogProjectId(null)} onSave={saveDailyLog} />}
  </div>
}

export default App
