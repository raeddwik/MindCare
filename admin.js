(() => {
  const supabase = window.mindcareSupabase;

  if (!supabase) {
    console.error('MindCare: Supabase client is not available.');
    return;
  }

  function escapeHtml(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  async function isAdmin() {
    const { data: { user }, error: userError } =
      await supabase.auth.getUser();

    if (userError || !user) {
      return false;
    }

    const { data, error } =
      await supabase.rpc('is_admin');

    if (error) {
      console.error('is_admin error:', error);
      return false;
    }

    return data === true;
  }

  async function login(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error:', error);
    }

    window.location.reload();
  }

  async function renderAdmin() {
    const app = document.getElementById('app');

    if (!app) return;

    const admin = await isAdmin();

    if (!admin) {
      renderLogin();
      return;
    }

    renderDashboard();
  }

  function renderLogin() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <section class="admin-login">
        <div class="admin-card">

          <h1>MindCare</h1>
          <h2>دخول الإدارة</h2>

          <form id="adminLoginForm">

            <label>
              البريد الإلكتروني
              <input
                id="adminEmail"
                type="email"
                autocomplete="username"
                required
              >
            </label>

            <label>
              كلمة المرور
              <input
                id="adminPassword"
                type="password"
                autocomplete="current-password"
                required
              >
            </label>

            <button type="submit">
              تسجيل الدخول
            </button>

            <p id="adminLoginError"></p>

          </form>

        </div>
      </section>
    `;

    const form = document.getElementById('adminLoginForm');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const email =
        document.getElementById('adminEmail').value.trim();

      const password =
        document.getElementById('adminPassword').value;

      const errorBox =
        document.getElementById('adminLoginError');

      errorBox.textContent = '';

      try {
        await login(email, password);

        const admin = await isAdmin();

        if (!admin) {
          await supabase.auth.signOut();

          errorBox.textContent =
            'هذا الحساب لا يملك صلاحية الإدارة.';

          return;
        }

        renderDashboard();

      } catch (error) {
        console.error(error);

        errorBox.textContent =
          'تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.';
      }
    });
  }

  async function renderDashboard() {
    const app = document.getElementById('app');

    app.innerHTML = `
      <section class="admin-dashboard">

        <header class="admin-header">
          <div>
            <h1>MindCare</h1>
            <p>لوحة إدارة الحجوزات</p>
          </div>

          <button id="adminLogout">
            تسجيل الخروج
          </button>
        </header>

        <main>

          <div class="admin-welcome">
            <h2>مرحبًا بك في لوحة الإدارة</h2>
            <p>
              من هنا سنتمكن من إدارة المواعيد والمعالجين
              والخدمات وأوقات الإتاحة.
            </p>
          </div>

          <div class="admin-sections">

            <button id="appointmentsSection">
              📅 المواعيد
            </button>

            <button id="availabilitySection">
              🕐 أوقات العمل
            </button>

            <button id="therapistsSection">
              👨‍⚕️ المعالجون
            </button>

            <button id="servicesSection">
              🧠 الخدمات
            </button>

          </div>

          <div id="adminContent"></div>

        </main>

      </section>
    `;

    document
      .getElementById('adminLogout')
      .addEventListener('click', logout);

    document
      .getElementById('appointmentsSection')
      .addEventListener('click', loadAppointments);

    document
      .getElementById('availabilitySection')
      .addEventListener('click', loadAvailability);

    document
      .getElementById('therapistsSection')
      .addEventListener('click', loadTherapists);

    document
      .getElementById('servicesSection')
      .addEventListener('click', loadServices);

    await loadAppointments();
  }

  async function loadAppointments() {
    const content =
      document.getElementById('adminContent');

    content.innerHTML =
      '<p>جاري تحميل المواعيد...</p>';

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id,
        booking_code,
        client_name,
        client_phone,
        client_email,
        start_at,
        end_at,
        duration_minutes,
        price,
        status,
        consent_given,
        created_at,
        therapists (
          name
        ),
        services (
          name
        )
      `)
      .order('start_at', { ascending: true });

    if (error) {
      console.error(error);

      content.innerHTML =
        '<p>تعذر تحميل المواعيد.</p>';

      return;
    }

    if (!data || data.length === 0) {
      content.innerHTML =
        '<p>لا توجد حجوزات حاليًا.</p>';

      return;
    }

    content.innerHTML = `
      <div class="admin-table-wrapper">

        <table class="admin-table">

          <thead>
            <tr>
              <th>رقم الحجز</th>
              <th>المريض</th>
              <th>الهاتف</th>
              <th>المعالج</th>
              <th>الخدمة</th>
              <th>الموعد</th>
              <th>السعر</th>
              <th>الحالة</th>
            </tr>
          </thead>

          <tbody>

            ${data.map(row => `
              <tr>

                <td>
                  ${escapeHtml(row.booking_code)}
                </td>

                <td>
                  ${escapeHtml(row.client_name)}
                </td>

                <td>
                  ${escapeHtml(row.client_phone)}
                </td>

                <td>
                  ${escapeHtml(row.therapists?.name || '')}
                </td>

                <td>
                  ${escapeHtml(row.services?.name || '')}
                </td>

                <td>
                  ${formatDate(row.start_at)}
                </td>

                <td>
                  ${escapeHtml(row.price)} جنيه
                </td>

                <td>
                  ${escapeHtml(row.status)}
                </td>

              </tr>
            `).join('')}

          </tbody>

        </table>

      </div>
    `;
  }

  async function loadAvailability() {
    const content =
      document.getElementById('adminContent');

    content.innerHTML =
      '<p>جاري تحميل أوقات العمل...</p>';

    const { data, error } = await supabase
      .from('availability')
      .select(`
        id,
        available_date,
        start_time,
        end_time,
        active,
        therapists (
          name
        )
      `)
      .order('available_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error(error);

      content.innerHTML =
        '<p>تعذر تحميل أوقات العمل.</p>';

      return;
    }

    content.innerHTML = `
      <div class="admin-table-wrapper">

        <table class="admin-table">

          <thead>
            <tr>
              <th>المعالج</th>
              <th>التاريخ</th>
              <th>من</th>
              <th>إلى</th>
              <th>الحالة</th>
            </tr>
          </thead>

          <tbody>

            ${(data || []).map(row => `
              <tr>
                <td>
                  ${escapeHtml(row.therapists?.name || '')}
                </td>

                <td>
                  ${escapeHtml(row.available_date)}
                </td>

                <td>
                  ${escapeHtml(row.start_time)}
                </td>

                <td>
                  ${escapeHtml(row.end_time)}
                </td>

                <td>
                  ${row.active ? 'نشط' : 'غير نشط'}
                </td>
              </tr>
            `).join('')}

          </tbody>

        </table>

      </div>
    `;
  }

  async function loadTherapists() {
    const content =
      document.getElementById('adminContent');

    content.innerHTML =
      '<p>جاري تحميل المعالجين...</p>';

    const { data, error } = await supabase
      .from('therapists')
      .select('*')
      .order('name');

    if (error) {
      console.error(error);

      content.innerHTML =
        '<p>تعذر تحميل المعالجين.</p>';

      return;
    }

    content.innerHTML = `
      <div class="admin-table-wrapper">

        <table class="admin-table">

          <thead>
            <tr>
              <th>الاسم</th>
              <th>التخصص</th>
              <th>الحالة</th>
            </tr>
          </thead>

          <tbody>

            ${(data || []).map(row => `
              <tr>
                <td>${escapeHtml(row.name)}</td>
                <td>${escapeHtml(row.specialty)}</td>
                <td>${row.active ? 'نشط' : 'غير نشط'}</td>
              </tr>
            `).join('')}

          </tbody>

        </table>

      </div>
    `;
  }

  async function loadServices() {
    const content =
      document.getElementById('adminContent');

    content.innerHTML =
      '<p>جاري تحميل الخدمات...</p>';

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) {
      console.error(error);

      content.innerHTML =
        '<p>تعذر تحميل الخدمات.</p>';

      return;
    }

    content.innerHTML = `
      <div class="admin-table-wrapper">

        <table class="admin-table">

          <thead>
            <tr>
              <th>الخدمة</th>
              <th>المدة</th>
              <th>السعر</th>
              <th>الحالة</th>
            </tr>
          </thead>

          <tbody>

            ${(data || []).map(row => `
              <tr>
                <td>${escapeHtml(row.name)}</td>
                <td>${escapeHtml(row.duration_minutes)} دقيقة</td>
                <td>${escapeHtml(row.price)} جنيه</td>
                <td>${row.active ? 'نشطة' : 'غير نشطة'}</td>
              </tr>
            `).join('')}

          </tbody>

        </table>

      </div>
    `;
  }

  function formatDate(value) {
    if (!value) return '';

    try {
      return new Intl.DateTimeFormat('ar-EG', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Africa/Cairo'
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  window.MindCareAdmin = {
    renderAdmin,
    isAdmin
  };

  document.addEventListener('DOMContentLoaded', () => {
    const adminMode =
      new URLSearchParams(window.location.search)
        .get('admin');

    if (adminMode === '1') {
      renderAdmin();
    }
  });

})();
