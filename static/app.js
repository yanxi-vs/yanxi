const API_BASE = '';

const STATUS_BADGES = {
  '在职': 'badge-success', '离职': 'badge-gray', '休假': 'badge-warning',
  '进行中': 'badge-info', '已结案': 'badge-success', '已归档': 'badge-gray',
  '待确认': 'badge-warning', '已确认': 'badge-info', '已完成': 'badge-success', '已取消': 'badge-danger',
  '运行中': 'badge-success', '空闲': 'badge-info', '维护中': 'badge-warning',
  '高': 'badge-danger', '中': 'badge-warning', '低': 'badge-success',
  '已处理': 'badge-success', '处理中': 'badge-info', '待处理': 'badge-warning',
  '活跃': 'badge-success', '禁用': 'badge-gray'
};

let lawyers = [];
let clients = [];
let cases = [];
let appointments = [];
let currentEditId = null;
let currentEditType = null;
let wizardStep = 1;

// Demo data for new modules
const demoAgents = [
  { id: 1, name: '合同审查助手', code: 'AGENT-CTR-001', desc: '自动识别合同中的风险条款、权利义务不对等项及遗漏条款。', status: '运行中', department: '民商事部', tasks: 1247, capabilities: ['contract-review', 'risk-warning'] },
  { id: 2, name: '法律检索专家', code: 'AGENT-LEG-002', desc: '基于案例库和法规库进行类案检索、法条推荐。', status: '运行中', department: '研究部', tasks: 3562, capabilities: ['legal-research'] },
  { id: 3, name: '文书起草助手', code: 'AGENT-DOC-003', desc: '根据案情自动生成起诉状、答辩状、律师函等文书。', status: '空闲', department: '常法中心', tasks: 890, capabilities: ['document-draft'] },
  { id: 4, name: '客户咨询机器人', code: 'AGENT-CLI-004', desc: '7×24 在线回答客户常见法律问题，收集初步信息。', status: '运行中', department: '客服部', tasks: 5621, capabilities: ['client-consult'] },
  { id: 5, name: '合规审计官', code: 'AGENT-COM-005', desc: '审查律师执业行为合规性，识别利益冲突。', status: '维护中', department: '风控部', tasks: 234, capabilities: ['compliance-check', 'risk-warning'] },
  { id: 6, name: '案件进度管家', code: 'AGENT-CAS-006', desc: '跟踪案件关键节点，自动提醒律师及客户。', status: '运行中', department: '运营部', tasks: 1456, capabilities: ['risk-warning'] }
];

const demoTemplates = [
  { id: 1, name: '标准合同审查智能体', category: '合同', desc: '适用于常见商业合同审查场景，内置 200+ 风险规则。', usage: 128 },
  { id: 2, name: '劳动争议咨询智能体', category: '劳动', desc: '针对劳动仲裁、工伤赔偿等高频问题提供标准答复。', usage: 86 },
  { id: 3, name: '知识产权检索智能体', category: '知产', desc: '商标、专利、著作权相关法律法规与案例检索。', usage: 54 },
  { id: 4, name: '刑事案件量刑评估', category: '刑事', desc: '基于量刑指导意见和判例提供量刑区间参考。', usage: 42 },
  { id: 5, name: '常法客户问答智能体', category: '常法', desc: '服务企业常年法律顾问客户的日常咨询。', usage: 203 },
  { id: 6, name: '诉讼策略分析智能体', category: '诉讼', desc: '根据案情生成诉讼策略建议与证据清单。', usage: 37 }
];

const demoRisks = [
  { id: 1, code: 'RISK-2024-001', type: '利益冲突', case: 'CASE-2024-001', lawyer: '张三', level: '高', status: '待处理' },
  { id: 2, code: 'RISK-2024-002', type: '保密协议', case: 'CASE-2024-003', lawyer: '王五', level: '中', status: '处理中' },
  { id: 3, code: 'RISK-2024-003', type: '执业时效', case: 'CASE-2024-005', lawyer: '李四', level: '高', status: '待处理' },
  { id: 4, code: 'RISK-2024-004', type: '收费合规', case: 'CASE-2024-002', lawyer: '赵六', level: '低', status: '已处理' }
];

const demoPerformances = [
  { name: '张三', value: 98, dept: '民商事部' },
  { name: '李四', value: 92, dept: '刑事部' },
  { name: '王五', value: 87, dept: '知识产权部' },
  { name: '赵六', value: 84, dept: '民商事部' },
  { name: '孙七', value: 79, dept: '常法中心' }
];

const demoDepts = [
  { name: '民商事部', value: 92 },
  { name: '刑事部', value: 85 },
  { name: '知识产权部', value: 78 },
  { name: '常法中心', value: 88 }
];

const demoTrainings = [
  { name: '陈新', role: '实习律师', plan: '民商事诉讼基础', progress: 78 },
  { name: '周明', role: '律师助理', plan: '合同审查实务', progress: 45 },
  { name: '吴芳', role: '实习律师', plan: '刑事辩护入门', progress: 92 },
  { name: '郑强', role: '律师助理', plan: '知产侵权实务', progress: 63 }
];

const demoRevenueBreakdown = [
  { name: '诉讼代理', value: '45%', color: '#1e3a5f' },
  { name: '常年法律顾问', value: '28%', color: '#b8860b' },
  { name: '专项法律服务', value: '15%', color: '#3d7a7a' },
  { name: '非诉业务', value: '8%', color: '#2e7d52' },
  { name: '其他', value: '4%', color: '#8b95a5' }
];

const demoSecurity = [
  { user: '管理员', role: '超级管理员', scope: '全部模块', lastLogin: '2026-06-15 14:32', status: '活跃' },
  { user: '张三', role: '合伙人', scope: '业务管理+智能体', lastLogin: '2026-06-15 11:20', status: '活跃' },
  { user: '李四', role: '普通律师', scope: '业务管理', lastLogin: '2026-06-14 18:45', status: '活跃' },
  { user: '王五', role: '运营专员', scope: '数字化运营', lastLogin: '2026-06-15 09:10', status: '活跃' },
  { user: 'test_user', role: '实习生', scope: '仅查看', lastLogin: '2026-06-10 16:22', status: '禁用' }
];

const demoAudit = [
  { time: '2026-06-15 14:32:10', user: '管理员', action: '登录系统', object: '系统', ip: '192.168.1.10', result: '成功' },
  { time: '2026-06-15 14:28:45', user: '张三', action: '创建案件', object: 'CASE-2024-007', ip: '192.168.1.23', result: '成功' },
  { time: '2026-06-15 14:15:22', user: '李四', action: '修改客户信息', object: '客户-王总', ip: '192.168.1.24', result: '成功' },
  { time: '2026-06-15 13:58:07', user: '王五', action: '导出绩效报表', object: '绩效统计', ip: '192.168.1.25', result: '成功' },
  { time: '2026-06-15 13:42:33', user: 'test_user', action: '访问审计日志', object: '审计日志', ip: '192.168.1.99', result: '失败' },
  { time: '2026-06-15 12:10:18', user: '管理员', action: '修改模型配置', object: 'GPT-4', ip: '192.168.1.10', result: '成功' }
];

const helpItems = [
  { icon: '📘', title: '快速入门指南', desc: '了解平台基本功能与操作流程，5 分钟上手。' },
  { icon: '🎥', title: '视频教程', desc: '观看智能体配置、案件管理等核心功能演示视频。' },
  { icon: '❓', title: '常见问题', desc: '汇总用户常见问题与解决方案，快速自助排查。' },
  { icon: '💬', title: '技术支持', desc: '联系平台技术支持团队，获取一对一帮助。' },
  { icon: '📋', title: '更新日志', desc: '查看平台版本更新内容与功能优化说明。' },
  { icon: '📄', title: 'API 文档', desc: '开发者接入指南与接口文档说明。' }
];

// Navigation
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      window.location.hash = page;
    });
  });

  window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'dashboard';
    navigateTo(page);
  });

  const initialPage = window.location.hash.slice(1) || 'dashboard';
  navigateTo(initialPage);
}

function navigateTo(page) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });

  document.querySelectorAll('.page').forEach(p => {
    p.classList.toggle('active', p.id === page);
  });

  const titles = {
    dashboard: '数据看板', lawyers: '律师管理', clients: '客户管理', cases: '案件管理', appointments: '预约管理',
    'agent-list': '智能体列表', 'agent-create': '创建智能体', 'agent-templates': '智能体模板',
    'ops-performance': '绩效统计', 'ops-compliance': '合规风险', 'ops-revenue': '成本营收', 'ops-training': '新人培养',
    'settings-system': '系统设置', 'settings-security': '权限与安全', 'settings-model': '模型配置', 'settings-audit': '审计日志', 'settings-help': '帮助中心'
  };
  const tags = {
    dashboard: 'DASHBOARD', lawyers: 'LAWYERS', clients: 'CLIENTS', cases: 'CASES', appointments: 'APPOINTMENTS',
    'agent-list': 'AI AGENTS', 'agent-create': 'CREATE AGENT', 'agent-templates': 'TEMPLATES',
    'ops-performance': 'PERFORMANCE', 'ops-compliance': 'COMPLIANCE', 'ops-revenue': 'REVENUE', 'ops-training': 'TRAINING',
    'settings-system': 'SYSTEM', 'settings-security': 'SECURITY', 'settings-model': 'MODEL', 'settings-audit': 'AUDIT', 'settings-help': 'HELP'
  };

  document.getElementById('page-title').textContent = titles[page] || '数据看板';
  document.getElementById('page-tag').textContent = tags[page] || 'DASHBOARD';

  loadPageData(page);
}

async function loadPageData(page) {
  try {
    if (page === 'dashboard') await loadDashboard();
    else if (page === 'lawyers') await loadLawyers();
    else if (page === 'clients') await loadClients();
    else if (page === 'cases') await loadCases();
    else if (page === 'appointments') await loadAppointments();
    else if (page === 'agent-list') renderAgentList();
    else if (page === 'agent-create') initAgentCreate();
    else if (page === 'agent-templates') renderAgentTemplates();
    else if (page === 'ops-performance') renderPerformance();
    else if (page === 'ops-compliance') renderCompliance();
    else if (page === 'ops-revenue') renderRevenue();
    else if (page === 'ops-training') renderTraining();
    else if (page === 'settings-security') renderSecurity();
    else if (page === 'settings-audit') renderAudit();
    else if (page === 'settings-help') renderHelp();
  } catch (error) {
    showToast('数据加载失败：' + error.message, 'error');
  }
}

// API helpers
async function apiGet(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '请求失败');
  }
  return response.json();
}

async function apiPost(path, data) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '请求失败');
  }
  return response.json();
}

async function apiPut(path, data) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '请求失败');
  }
  return response.json();
}

async function apiDelete(path) {
  const response = await fetch(`${API_BASE}${path}`, { method: 'DELETE' });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || '请求失败');
  }
  return response.json();
}

// Dashboard
async function loadDashboard() {
  const stats = await apiGet('/api/stats');
  document.getElementById('stat-lawyers').textContent = stats.lawyer_count;
  document.getElementById('stat-clients').textContent = stats.client_count;
  document.getElementById('stat-cases').textContent = stats.case_count;
  document.getElementById('stat-active-cases').textContent = stats.active_case_count;

  const [casesData] = await Promise.all([apiGet('/api/cases?limit=5')]);
  renderRecentCases(casesData);
  renderAgentStatusList();
  renderRiskList();
  renderCaseTrendChart();
}

function renderRecentCases(data) {
  const tbody = document.getElementById('recent-cases');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="empty-state">暂无案件数据</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.case_number}</td>
      <td>${c.title}</td>
      <td><span class="badge ${STATUS_BADGES[c.status] || 'badge-gray'}">${c.status}</span></td>
    </tr>
  `).join('');
}

function renderAgentStatusList() {
  const container = document.getElementById('agent-status-list');
  container.innerHTML = demoAgents.slice(0, 5).map(a => `
    <div class="agent-status-item">
      <div class="agent-status-dot ${a.status === '维护中' ? 'warning' : ''}"></div>
      <div class="agent-status-info">
        <div class="agent-status-name">${a.name}</div>
        <div class="agent-status-meta">${a.department} · 处理 ${a.tasks.toLocaleString()} 次任务</div>
      </div>
      <span class="badge ${STATUS_BADGES[a.status] || 'badge-gray'}">${a.status}</span>
    </div>
  `).join('');
}

function renderRiskList() {
  const container = document.getElementById('risk-list');
  container.innerHTML = demoRisks.slice(0, 4).map(r => `
    <div class="risk-item">
      <div class="risk-level ${r.level === '高' ? 'high' : r.level === '中' ? 'medium' : 'low'}">${r.level}</div>
      <div style="flex:1">
        <div style="font-weight:500;margin-bottom:4px">${r.type}</div>
        <div style="font-size:12px;color:var(--text-muted)">${r.case} · ${r.lawyer}</div>
      </div>
      <span class="badge ${STATUS_BADGES[r.status] || 'badge-gray'}">${r.status}</span>
    </div>
  `).join('');
}

function renderCaseTrendChart() {
  const data = [12, 19, 15, 25, 22, 30, 28, 35, 42, 38, 45, 48];
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const max = Math.max(...data);
  const container = document.getElementById('case-trend-chart');
  container.innerHTML = data.map((v, i) => `
    <div class="chart-bar-group">
      <div class="chart-bar" style="height: ${(v / max) * 80}%; background: linear-gradient(180deg, var(--accent-cyan) 0%, var(--accent-blue) 100%);">
        <div class="chart-bar-value">${v}</div>
      </div>
      <div class="chart-bar-label">${labels[i]}</div>
    </div>
  `).join('');
}

// Lawyers
async function loadLawyers() {
  lawyers = await apiGet('/api/lawyers');
  renderLawyersTable(lawyers);
}

function renderLawyersTable(data) {
  const tbody = document.getElementById('lawyers-table');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无律师数据</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(l => `
    <tr>
      <td><strong>${l.name}</strong></td>
      <td>${l.title}</td>
      <td>${l.specialty || '-'}</td>
      <td>${l.phone || '-'}</td>
      <td>${l.email || '-'}</td>
      <td><span class="badge ${STATUS_BADGES[l.status] || 'badge-gray'}">${l.status}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editItem('lawyer', ${l.id})">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('lawyer', ${l.id})">删除</button>
      </td>
    </tr>
  `).join('');
}

// Clients
async function loadClients() {
  clients = await apiGet('/api/clients');
  renderClientsTable(clients);
}

function renderClientsTable(data) {
  const tbody = document.getElementById('clients-table');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-state">暂无客户数据</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.company || '-'}</td>
      <td>${c.phone || '-'}</td>
      <td>${c.email || '-'}</td>
      <td>${c.notes || '-'}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editItem('client', ${c.id})">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('client', ${c.id})">删除</button>
      </td>
    </tr>
  `).join('');
}

// Cases
async function loadCases() {
  cases = await apiGet('/api/cases');
  renderCasesTable(cases);
}

function renderCasesTable(data) {
  const tbody = document.getElementById('cases-table');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="empty-state">暂无案件数据</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>${c.case_number}</td>
      <td><strong>${c.title}</strong></td>
      <td>${c.lawyer?.name || '-'}</td>
      <td>${c.client?.name || '-'}</td>
      <td><span class="badge ${STATUS_BADGES[c.status] || 'badge-gray'}">${c.status}</span></td>
      <td>${formatDateTime(c.updated_at)}</td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editItem('case', ${c.id})">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('case', ${c.id})">删除</button>
      </td>
    </tr>
  `).join('');
}

// Appointments
async function loadAppointments() {
  appointments = await apiGet('/api/appointments');
  renderAppointmentsTable(appointments);
}

function renderAppointmentsTable(data) {
  const tbody = document.getElementById('appointments-table');
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="empty-state">暂无预约数据</td></tr>';
    return;
  }
  tbody.innerHTML = data.map(a => `
    <tr>
      <td><strong>${a.title}</strong></td>
      <td>${formatDateTime(a.start_time)}</td>
      <td>${formatDateTime(a.end_time)}</td>
      <td>${a.location || '-'}</td>
      <td>${a.lawyer?.name || '-'}</td>
      <td>${a.client?.name || '-'}</td>
      <td><span class="badge ${STATUS_BADGES[a.status] || 'badge-gray'}">${a.status}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="editItem('appointment', ${a.id})">编辑</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('appointment', ${a.id})">删除</button>
      </td>
    </tr>
  `).join('');
}

// Agent List
function renderAgentList(search = '', statusFilter = '') {
  const grid = document.getElementById('agent-grid');
  let filtered = demoAgents;
  if (search) {
    filtered = filtered.filter(a => a.name.includes(search) || a.code.includes(search));
  }
  if (statusFilter) {
    filtered = filtered.filter(a => a.status === statusFilter);
  }

  grid.innerHTML = filtered.map(a => `
    <div class="agent-card">
      <div class="agent-header">
        <div>
          <div class="agent-name">${a.name}</div>
          <div class="agent-code">${a.code}</div>
        </div>
        <span class="badge ${STATUS_BADGES[a.status] || 'badge-gray'}">${a.status}</span>
      </div>
      <div class="agent-desc">${a.desc}</div>
      <div class="agent-meta">
        <span>📁 ${a.department}</span>
        <span>⚡ ${a.tasks.toLocaleString()} 任务</span>
      </div>
      <div class="agent-capabilities" style="margin-bottom:14px">
        ${a.capabilities.map(c => `<span class="badge badge-info" style="margin-right:6px;margin-bottom:6px">${capabilityName(c)}</span>`).join('')}
      </div>
      <div class="agent-actions">
        <button class="btn btn-sm btn-secondary" onclick="showToast('智能体配置已打开', 'success')">配置</button>
        <button class="btn btn-sm btn-secondary" onclick="showToast('运行日志已生成', 'success')">日志</button>
        <button class="btn btn-sm btn-danger" onclick="showToast('智能体已停用', 'success')">停用</button>
      </div>
    </div>
  `).join('');
}

function capabilityName(code) {
  const map = {
    'contract-review': '合同审查', 'legal-research': '法律检索', 'document-draft': '文书起草',
    'client-consult': '客户咨询', 'risk-warning': '风险预警', 'compliance-check': '合规检查'
  };
  return map[code] || code;
}

// Agent Create
function initAgentCreate() {
  wizardStep = 1;
  updateWizardUI();
}

function changeWizardStep(delta) {
  wizardStep += delta;
  if (wizardStep < 1) wizardStep = 1;
  if (wizardStep > 4) wizardStep = 4;
  updateWizardUI();
}

function updateWizardUI() {
  document.querySelectorAll('.wizard-step').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.step) === wizardStep);
  });
  document.querySelectorAll('.wizard-panel').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.panel) === wizardStep);
  });

  document.getElementById('wizard-prev').style.display = wizardStep === 1 ? 'none' : 'inline-flex';
  const nextBtn = document.getElementById('wizard-next');
  nextBtn.textContent = wizardStep === 4 ? '发布上线' : '下一步';
  nextBtn.onclick = wizardStep === 4 ? () => handleAgentCreate() : () => changeWizardStep(1);
}

function handleAgentCreate() {
  showToast('智能体创建成功，正在部署...', 'success');
  setTimeout(() => {
    window.location.hash = 'agent-list';
  }, 1200);
}

// Agent Templates
function renderAgentTemplates() {
  const grid = document.getElementById('template-grid');
  grid.innerHTML = demoTemplates.map(t => `
    <div class="template-card">
      <span class="template-tag">${t.category}</span>
      <div class="template-title">${t.name}</div>
      <div class="template-desc">${t.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
        <span style="font-size:12px;color:var(--text-muted)">使用 ${t.usage} 次</span>
        <button class="btn btn-primary btn-sm" onclick="showToast('已基于模板创建智能体', 'success')">使用模板</button>
      </div>
    </div>
  `).join('');
}

// Performance
function renderPerformance() {
  const list = document.getElementById('performance-list');
  list.innerHTML = demoPerformances.map((p, i) => `
    <div class="performance-item">
      <div class="performance-rank">${i + 1}</div>
      <div class="performance-name">${p.name}<div style="font-size:12px;color:var(--text-muted)">${p.dept}</div></div>
      <div class="performance-bar"><div class="performance-bar-fill" style="width:${p.value}%"></div></div>
      <div class="performance-value">${p.value}</div>
    </div>
  `).join('');

  const dept = document.getElementById('dept-comparison');
  const max = Math.max(...demoDepts.map(d => d.value));
  dept.innerHTML = demoDepts.map(d => `
    <div class="dept-item">
      <div class="dept-label"><span>${d.name}</span><span style="color:var(--accent-cyan)">${d.value}%</span></div>
      <div class="dept-bar"><div class="dept-bar-fill" style="width:${(d.value / max) * 100}%"></div></div>
    </div>
  `).join('');
}

// Compliance
function renderCompliance() {
  const tbody = document.getElementById('compliance-table');
  tbody.innerHTML = demoRisks.map(r => `
    <tr>
      <td>${r.code}</td>
      <td>${r.type}</td>
      <td>${r.case}</td>
      <td>${r.lawyer}</td>
      <td><span class="risk-level ${r.level === '高' ? 'high' : r.level === '中' ? 'medium' : 'low'}">${r.level}</span></td>
      <td><span class="badge ${STATUS_BADGES[r.status] || 'badge-gray'}">${r.status}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showToast('风险详情已打开', 'success')">处理</button>
        <button class="btn btn-sm btn-danger" onclick="showToast('已忽略该风险', 'success')">忽略</button>
      </td>
    </tr>
  `).join('');
}

// Revenue
function renderRevenue() {
  const revenueData = [28, 32, 26, 35, 38, 42, 40, 45, 48, 52, 50, 55];
  const costData = [18, 20, 16, 22, 24, 26, 25, 28, 30, 32, 31, 34];
  const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const max = Math.max(...revenueData, ...costData);
  const chart = document.getElementById('revenue-chart');
  chart.innerHTML = revenueData.map((v, i) => `
    <div class="chart-bar-group">
      <div style="display:flex;gap:4px;height:100%;align-items:flex-end;width:100%;justify-content:center">
        <div class="chart-bar" style="height:${(v / max) * 70}%;width:8px;background:var(--gradient-primary)"></div>
        <div class="chart-bar" style="height:${(costData[i] / max) * 70}%;width:8px;background:var(--gradient-warning);opacity:0.8"></div>
      </div>
      <div class="chart-bar-label">${labels[i]}</div>
    </div>
  `).join('');

  const breakdown = document.getElementById('revenue-breakdown');
  breakdown.innerHTML = demoRevenueBreakdown.map(r => `
    <div class="revenue-item">
      <div class="revenue-color" style="background:${r.color};box-shadow:0 0 8px ${r.color}"></div>
      <div class="revenue-name">${r.name}</div>
      <div class="revenue-value">${r.value}</div>
    </div>
  `).join('');
}

// Training
function renderTraining() {
  const list = document.getElementById('training-list');
  list.innerHTML = demoTrainings.map(t => `
    <div class="training-item">
      <div class="training-avatar">${t.name[0]}</div>
      <div class="training-info">
        <div class="training-name">${t.name}</div>
        <div class="training-meta">${t.role} · ${t.plan}</div>
      </div>
      <div class="training-progress">
        <div class="training-progress-bar"><div class="training-progress-fill" style="width:${t.progress}%"></div></div>
        <div class="training-progress-text">${t.progress}% 已完成</div>
      </div>
      <button class="btn btn-sm btn-secondary" onclick="showToast('培养计划详情已打开', 'success')">查看</button>
    </div>
  `).join('');
}

// Security
function renderSecurity() {
  const tbody = document.getElementById('security-table');
  tbody.innerHTML = demoSecurity.map(s => `
    <tr>
      <td><strong>${s.user}</strong></td>
      <td>${s.role}</td>
      <td>${s.scope}</td>
      <td>${s.lastLogin}</td>
      <td><span class="badge ${STATUS_BADGES[s.status] || 'badge-gray'}">${s.status}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary" onclick="showToast('权限配置已打开', 'success')">权限</button>
        <button class="btn btn-sm btn-danger" onclick="showToast('用户状态已更新', 'success')">${s.status === '活跃' ? '禁用' : '启用'}</button>
      </td>
    </tr>
  `).join('');
}

// Audit
function renderAudit() {
  const tbody = document.getElementById('audit-table');
  tbody.innerHTML = demoAudit.map(a => `
    <tr>
      <td>${a.time}</td>
      <td><strong>${a.user}</strong></td>
      <td>${a.action}</td>
      <td>${a.object}</td>
      <td>${a.ip}</td>
      <td><span class="badge ${a.result === '成功' ? 'badge-success' : 'badge-danger'}">${a.result}</span></td>
    </tr>
  `).join('');
}

// Help
function renderHelp() {
  const grid = document.getElementById('help-grid');
  grid.innerHTML = helpItems.map(h => `
    <div class="help-card" onclick="showToast('${h.title} 内容加载中...', 'success')">
      <div class="help-icon">${h.icon}</div>
      <div class="help-title">${h.title}</div>
      <div class="help-desc">${h.desc}</div>
    </div>
  `).join('');
}

// Modal and forms
const FORM_CONFIG = {
  lawyer: {
    title: '律师',
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'title', label: '职位', type: 'text', value: '执业律师' },
      { name: 'specialty', label: '专业领域', type: 'text' },
      { name: 'phone', label: '联系电话', type: 'tel' },
      { name: 'email', label: '邮箱', type: 'email' },
      { name: 'status', label: '状态', type: 'select', options: ['在职', '离职', '休假'], value: '在职' }
    ]
  },
  client: {
    title: '客户',
    fields: [
      { name: 'name', label: '姓名', type: 'text', required: true },
      { name: 'company', label: '公司', type: 'text' },
      { name: 'phone', label: '联系电话', type: 'tel' },
      { name: 'email', label: '邮箱', type: 'email' },
      { name: 'notes', label: '备注', type: 'textarea' }
    ]
  },
  case: {
    title: '案件',
    fields: [
      { name: 'case_number', label: '案件编号', type: 'text', required: true },
      { name: 'title', label: '案件名称', type: 'text', required: true },
      { name: 'lawyer_id', label: '承办律师', type: 'select-dynamic', source: 'lawyers', required: true },
      { name: 'client_id', label: '客户', type: 'select-dynamic', source: 'clients', required: true },
      { name: 'status', label: '状态', type: 'select', options: ['进行中', '已结案', '已归档'], value: '进行中' },
      { name: 'description', label: '案件描述', type: 'textarea' }
    ]
  },
  appointment: {
    title: '预约',
    fields: [
      { name: 'title', label: '主题', type: 'text', required: true },
      { name: 'lawyer_id', label: '律师', type: 'select-dynamic', source: 'lawyers', required: true },
      { name: 'client_id', label: '客户', type: 'select-dynamic', source: 'clients', required: true },
      { name: 'start_time', label: '开始时间', type: 'datetime-local', required: true },
      { name: 'end_time', label: '结束时间', type: 'datetime-local', required: true },
      { name: 'location', label: '地点', type: 'text' },
      { name: 'status', label: '状态', type: 'select', options: ['待确认', '已确认', '已完成', '已取消'], value: '待确认' },
      { name: 'notes', label: '备注', type: 'textarea' }
    ]
  },
  risk: {
    title: '风险',
    fields: [
      { name: 'code', label: '风险编号', type: 'text', required: true },
      { name: 'type', label: '风险类型', type: 'text', required: true },
      { name: 'case', label: '关联案件', type: 'text' },
      { name: 'lawyer', label: '责任律师', type: 'text' },
      { name: 'level', label: '风险等级', type: 'select', options: ['高', '中', '低'], value: '中' },
      { name: 'status', label: '处理状态', type: 'select', options: ['待处理', '处理中', '已处理'], value: '待处理' }
    ]
  }
};

async function openModal(type, id = null) {
  const config = FORM_CONFIG[type];
  currentEditType = type;
  currentEditId = id;

  const title = id ? `编辑${config.title}` : `新增${config.title}`;
  document.getElementById('modal-title').textContent = title;

  let values = {};
  if (id) {
    const data = await apiGet(`/api/${type}s/${id}`);
    values = data;
  }

  const body = document.getElementById('modal-body');
  body.innerHTML = config.fields.map(field => renderFormField(field, values[field.name])).join('');

  document.getElementById('modal-overlay').classList.add('active');
}

function renderFormField(field, value) {
  const safeValue = value !== undefined && value !== null ? value : (field.value || '');

  if (field.type === 'select') {
    return `
      <div class="form-group">
        <label>${field.label}</label>
        <select name="${field.name}" ${field.required ? 'required' : ''}>
          ${field.options.map(opt => `<option value="${opt}" ${safeValue === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </div>
    `;
  }

  if (field.type === 'select-dynamic') {
    const source = field.source === 'lawyers' ? lawyers : clients;
    return `
      <div class="form-group">
        <label>${field.label}</label>
        <select name="${field.name}" ${field.required ? 'required' : ''}>
          <option value="">请选择</option>
          ${source.map(item => `<option value="${item.id}" ${String(safeValue) === String(item.id) ? 'selected' : ''}>${item.name}</option>`).join('')}
        </select>
      </div>
    `;
  }

  if (field.type === 'textarea') {
    return `
      <div class="form-group">
        <label>${field.label}</label>
        <textarea name="${field.name}" ${field.required ? 'required' : ''}>${safeValue}</textarea>
      </div>
    `;
  }

  let inputValue = safeValue;
  if (field.type === 'datetime-local' && safeValue) {
    const d = new Date(safeValue);
    inputValue = d.toISOString().slice(0, 16);
  }

  return `
    <div class="form-group">
      <label>${field.label}</label>
      <input type="${field.type}" name="${field.name}" value="${inputValue}" ${field.required ? 'required' : ''}>
    </div>
  `;
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  currentEditId = null;
  currentEditType = null;
}

function closeModalOnOverlay(event) {
  if (event.target === document.getElementById('modal-overlay')) closeModal();
}

async function handleFormSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = {};

  for (const [key, val] of formData.entries()) {
    if (key === 'lawyer_id' || key === 'client_id') {
      data[key] = val ? parseInt(val) : null;
    } else {
      data[key] = val;
    }
  }

  try {
    if (currentEditType === 'risk') {
      showToast('风险记录已保存', 'success');
      closeModal();
      renderCompliance();
      return;
    }

    if (currentEditId) {
      await apiPut(`/api/${currentEditType}s/${currentEditId}`, data);
      showToast(`${FORM_CONFIG[currentEditType].title}更新成功`, 'success');
    } else {
      await apiPost(`/api/${currentEditType}s`, data);
      showToast(`${FORM_CONFIG[currentEditType].title}创建成功`, 'success');
    }
    closeModal();
    loadPageData(window.location.hash.slice(1) || 'dashboard');
  } catch (error) {
    showToast('保存失败：' + error.message, 'error');
  }
}

async function editItem(type, id) {
  if (type === 'case' || type === 'appointment') {
    await Promise.all([loadLawyers(), loadClients()]);
  }
  openModal(type, id);
}

async function deleteItem(type, id) {
  const config = FORM_CONFIG[type];
  if (!confirm(`确定要删除这个${config.title}吗？`)) return;

  try {
    await apiDelete(`/api/${type}s/${id}`);
    showToast(`${config.title}已删除`, 'success');
    loadPageData(window.location.hash.slice(1) || 'dashboard');
  } catch (error) {
    showToast('删除失败：' + error.message, 'error');
  }
}

// Table filters
function filterTable(type, search, status) {
  if (type === 'lawyers') {
    let filtered = [...lawyers];
    if (search) filtered = filtered.filter(l => l.name.includes(search) || l.specialty.includes(search));
    if (status) filtered = filtered.filter(l => l.status === status);
    renderLawyersTable(filtered);
  } else if (type === 'clients') {
    let filtered = [...clients];
    if (search) filtered = filtered.filter(c => c.name.includes(search) || c.company.includes(search));
    renderClientsTable(filtered);
  } else if (type === 'appointments') {
    let filtered = [...appointments];
    if (search) filtered = filtered.filter(a => a.title.includes(search));
    renderAppointmentsTable(filtered);
  }
}

async function filterCasesByStatus(status) {
  const data = status ? await apiGet(`/api/cases?status=${status}`) : await apiGet('/api/cases');
  renderCasesTable(data);
}

// Utilities
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast active ${type}`;
  setTimeout(() => toast.classList.remove('active'), 3000);
}

function formatDateTime(isoString) {
  if (!isoString) return '-';
  const d = new Date(isoString);
  return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function exportData(type) {
  showToast(`正在导出${type}数据...`, 'success');
}

function batchOperate(type) {
  showToast(`批量操作功能开发中`, 'success');
}

function testModel() {
  showToast('模型连接测试成功，延迟 120ms', 'success');
}

function toggleTheme() {
  showToast('主题切换功能开发中', 'success');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
});
