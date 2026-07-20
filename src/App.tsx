import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Boxes,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  HardHat,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  PackageCheck,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { alerts, orders, projects } from './data'
import type { Project, Role } from './types'

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

const navItems = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Obras', icon: Building2, count: 4 },
  { label: 'Canteiro', icon: HardHat },
  { label: 'Suprimentos', icon: Boxes, count: 3 },
  { label: 'Financeiro', icon: WalletCards },
  { label: 'Planejamento', icon: CalendarDays },
  { label: 'Documentos', icon: FileText },
]

function Logo() {
  return (
    <div className="logo" aria-label="NoPrumo">
      <span className="logo-mark"><span /></span>
      <span>No<span>Prumo</span></span>
    </div>
  )
}

function Sidebar({ open, close, active, setActive, role }: { open: boolean; close: () => void; active: string; setActive: (item: string) => void; role: Role }) {
  const hidden = role === 'foreman' ? ['Financeiro'] : role === 'client' ? ['Canteiro', 'Suprimentos'] : []
  return (
    <>
      {open && <button className="sidebar-overlay" onClick={close} aria-label="Fechar menu" />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-head"><Logo /><button className="mobile-close" onClick={close}><X size={20} /></button></div>
        <nav>
          <p className="nav-eyebrow">GESTÃO</p>
          {navItems.filter(item => !hidden.includes(item.label)).map(({ label, icon: Icon, count }) => (
            <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); close() }}>
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
              {count && <b>{count}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Users size={19} /><span>Equipe</span></button>
          <button className="nav-item"><Settings size={19} /><span>Configurações</span></button>
          <div className="help-card">
            <span><ShieldCheck size={18} /></span>
            <strong>Ambiente protegido</strong>
            <small>Dados segmentados por obra</small>
          </div>
        </div>
      </aside>
    </>
  )
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

function OperationalView({ project }: { project: Project }) {
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
    <div className="action-grid">{actions.map(({ icon: Icon, title, detail, tone }) => <button className="action-card" key={title}>
      <span className={`action-icon ${tone}`}><Icon size={23} /></span><strong>{title}</strong><small>{detail}</small><ArrowRight size={17} />
    </button>)}</div>
    <div className="mobile-columns"><AlertsPanel projectIds={[project.id]} /><section className="panel today-panel"><div className="panel-head"><div><span className="eyebrow">HOJE</span><h2>Resumo do canteiro</h2></div></div><div className="today-stats"><div><Users /><span><strong>{project.team}</strong> presentes</span></div><div><ClipboardCheck /><span><strong>4 de 6</strong> tarefas</span></div><div><PackageCheck /><span><strong>2</strong> entregas</span></div></div></section></div>
  </div>
}

function App() {
  const [role, setRole] = useState<Role>('admin')
  const [selectedProject, setSelectedProject] = useState('all')
  const [active, setActive] = useState('Visão geral')
  const [menuOpen, setMenuOpen] = useState(false)
  const [roleOpen, setRoleOpen] = useState(false)

  const selectedProjects = useMemo(() => {
    if (role === 'foreman') return [projects[0]]
    if (role === 'client') return [projects[0]]
    return selectedProject === 'all' ? projects : projects.filter(project => project.id === selectedProject)
  }, [role, selectedProject])

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

  return <div className="app-shell">
    <Sidebar open={menuOpen} close={() => setMenuOpen(false)} active={active} setActive={setActive} role={role} />
    <main>
      <header className="topbar">
        <button className="menu-button" onClick={() => setMenuOpen(true)}><Menu size={21} /></button>
        <div className="mobile-logo"><Logo /></div>
        <div className="search-box"><Search size={18} /><input placeholder="Buscar obra, pedido ou documento..." /><kbd>⌘ K</kbd></div>
        <div className="top-actions">
          <button className="icon-button notification"><Bell size={20} /><i /></button>
          <div className="profile-wrap">
            <button className="profile-button" onClick={() => setRoleOpen(value => !value)}>
              <span className="avatar">RC</span><span className="profile-copy"><strong>Ruan Correia</strong><small>{roles[role].label}</small></span><ChevronDown size={16} />
            </button>
            {roleOpen && <div className="role-menu"><span>Visualizar como</span>{(Object.keys(roles) as Role[]).map(key => <button key={key} className={role === key ? 'selected' : ''} onClick={() => { setRole(key); setRoleOpen(false); setSelectedProject('all') }}><strong>{roles[key].label}</strong><small>{roles[key].detail}</small></button>)}</div>}
          </div>
        </div>
      </header>

      <div className="content">
        <div className="page-heading">
          <div><span className="eyebrow">SEGUNDA, 20 DE JULHO</span><h1>{isOperational ? 'Bom trabalho, Ruan.' : 'Visão geral'}</h1><p>{isOperational ? 'Tudo o que você precisa registrar no canteiro hoje.' : 'Acompanhe o desempenho das suas obras em um só lugar.'}</p></div>
          {!isOperational && role !== 'client' && <div className="heading-actions">
            <label className="select-control"><Building2 size={17} /><select value={selectedProject} onChange={event => setSelectedProject(event.target.value)}><option value="all">Todas as obras</option>{projects.map(project => <option value={project.id} key={project.id}>{project.name}</option>)}</select><ChevronDown size={15} /></label>
            <label className="select-control compact"><CalendarDays size={17} /><select><option>Últimos 6 meses</option><option>Este mês</option><option>Este ano</option></select><ChevronDown size={15} /></label>
            {role === 'admin' && <button className="primary-button"><Plus size={17} /> Nova obra</button>}
          </div>}
        </div>

        {isOperational ? <OperationalView project={projects[0]} /> : <>
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
  </div>
}

export default App
