const roleData = {
  parent: {
    title: 'ولي الأمر',
    summary: 'تأكيد الحضور ومتابعة رحلة الابن في الوقت الحقيقي.',
    students: [
      { name: 'سارة محمد', status: 'confirmed', short: 'س' },
      { name: 'يوسف علي', status: 'boarded', short: 'ي' },
      { name: 'لينا أحمد', status: 'pending', short: 'ل' }
    ],
    stats: [
      ['الحافلة', 'حافلة 09'],
      ['المسار', 'المنطقة الغربية'],
      ['نقطة التجمع', 'الحديقة الشمالية'],
      ['موقع الحافلة', 'قرب نقطة التجمع']
    ]
  },
  driver: {
    title: 'السائق',
    summary: 'عرض الطلاب المتوقعين، حالة الصعود، وتحديثات المسار.',
    students: [
      { name: 'أحمد سالم', status: 'confirmed', short: 'أ' },
      { name: 'مريم ناصر', status: 'boarded', short: 'م' },
      { name: 'خالد عمران', status: 'pending', short: 'خ' }
    ],
    stats: [
      ['الطلاب المتوقعون', '27 طالب'],
      ['صعدوا', '21 طالب'],
      ['لم يصعدوا', '06 طلاب'],
      ['التوقف الحالي', 'نقطة 3']
    ]
  },
  school: {
    title: 'إدارة المدرسة',
    summary: 'متابعة الحافلات والطلاب والبلاغات من مركز واحد.',
    students: [
      { name: 'روان فهد', status: 'confirmed', short: 'ر' },
      { name: 'تسنيم عادل', status: 'boarded', short: 'ت' },
      { name: 'فيصل ياسر', status: 'pending', short: 'ف' }
    ],
    stats: [
      ['حافلات نشطة', '12'],
      ['طلاب مؤكدين', '346'],
      ['بلاغات مفتوحة', '08'],
      ['رحلات اليوم', '44']
    ]
  },
  authority: {
    title: 'الجهة المختصة',
    summary: 'متابعة البلاغات، المشكلات، وتحليلات الخدمة العامة.',
    students: [
      { name: 'عبدالله ريان', status: 'confirmed', short: 'ع' },
      { name: 'فاطمة حسين', status: 'boarded', short: 'ف' },
      { name: 'زياد حيدر', status: 'pending', short: 'ز' }
    ],
    stats: [
      ['المشكلات الحالية', '06'],
      ['بلاغات قيد المعالجة', '03'],
      ['الرحلات المراقبة', '28'],
      ['معدل الالتزام', '96%']
    ]
  }
};

const labels = {
  confirmed: 'مؤكد',
  boarded: 'صعد',
  pending: 'بانتظار'
};

const roleContent = document.getElementById('roleContent');
const tabs = document.querySelectorAll('.tab');

function renderRole(role) {
  const data = roleData[role];

  roleContent.innerHTML = `
    <div class="role-main">
      <div class="role-card-header">
        <h3>${data.title}</h3>
        <span class="status-badge success">نشط</span>
      </div>
      <p style="margin:0 0 18px; color: var(--muted); line-height: 1.9;">${data.summary}</p>
      <div class="student-list">
        ${data.students
          .map(
            (student) => `
              <div class="student-item">
                <div class="student-meta">
                  <div class="avatar">${student.short}</div>
                  <div>
                    <strong>${student.name}</strong><br>
                    <small style="color: var(--muted);">${labels[student.status]}</small>
                  </div>
                </div>
                <span class="status-pill ${student.status}">${labels[student.status]}</span>
              </div>
            `
          )
          .join('')}
      </div>
    </div>

    <aside class="role-side">
      <div class="role-card-header">
        <h3>مؤشرات سريعة</h3>
      </div>
      <ul>
        ${data.stats
          .map(
            ([label, value]) => `
              <li>
                <span>${label}</span>
                <strong>${value}</strong>
              </li>
            `
          )
          .join('')}
      </ul>
    </aside>
  `;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    tabs.forEach((item) => item.classList.remove('active'));
    tab.classList.add('active');
    renderRole(tab.dataset.role);
  });
});

renderRole('parent');
