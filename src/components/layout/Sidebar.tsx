import {
  Boxes,
  Building2,
  CalendarDays,
  FileText,
  HardHat,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import type { Role } from '../../types'
import { Logo } from './Logo'

const navItems = [
  { label: 'Visão geral', icon: LayoutDashboard },
  { label: 'Obras', icon: Building2, count: 4 },
  { label: 'Canteiro', icon: HardHat },
  { label: 'Suprimentos', icon: Boxes, count: 3 },
  { label: 'Financeiro', icon: WalletCards },
  { label: 'Planejamento', icon: CalendarDays },
  { label: 'Documentos', icon: FileText },
]

interface SidebarProps {
  open: boolean
  close: () => void
  active: string
  setActive: (item: string) => void
  role: Role
  projectCount: number
}

export function Sidebar({ open, close, active, setActive, role, projectCount }: SidebarProps) {
  const hidden = role === 'foreman' ? ['Financeiro'] : role === 'client' ? ['Canteiro', 'Suprimentos'] : []

  return (
    <>
      {open && <button className="sidebar-overlay" onClick={close} aria-label="Fechar menu" />}
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-head"><Logo /><button className="mobile-close" onClick={close}><X size={20} /></button></div>
        <nav>
          <p className="nav-eyebrow">GESTÃO</p>
          {navItems.filter(item => !hidden.includes(item.label)).map(({ label, icon: Icon, count: defaultCount }) => {
            const count = label === 'Obras' ? projectCount : defaultCount
            return (
              <button key={label} className={`nav-item ${active === label ? 'active' : ''}`} onClick={() => { setActive(label); close() }}>
                <Icon size={19} strokeWidth={1.8} />
                <span>{label}</span>
                {count && <b>{count}</b>}
              </button>
            )
          })}
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
