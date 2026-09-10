const STORAGE_KEY='mindcare_v4_local';
const sb=window.mindcareSupabase;

let therapists=[];
let services=[];
let availability=[];
let remoteBookings=[];
let booking={serviceId:null,therapistId:null,duration:null,date:null,time:null};
let settings={currency:'EGP'};

const app=document.getElementById('app');

function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function render(content){app.innerHTML=`<div class="container">${content}<div class="footer">MindCare PWA — v0.4 Supabase</div></div>`}
function go(page){location.hash=page}
function loading(msg='جاري تحميل البيانات…'){render(`<div class="card"><p>${esc(msg)}</p></div>`)}
function errorBox(msg){render(`<div class="card notice warning"><h3>تعذر تحميل البيانات</h3><p>${esc(msg)}</p><button class="btn secondary" onclick="router()">إعادة المحاولة</button></div>`)}

async function loadCatalog(){
  if(!sb) throw new Error('Supabase client غير متصل. تأكد من تحميل supabase.js ومكتبة Supabase.');
  const [t,s,a]=await Promise.all([
    sb.from('therapists').select('id,name,specialty,bio,active').eq('active',true).order('name'),
    sb.from('services')
  .select('id,name,description,duration_minutes,price,active')
  .eq('active', true)
  .order('duration_minutes'),
    sb.from('availability').select('id,therapist_id,available_date,start_time,end_time,active').eq('active',true).order('available_date').order('start_time')
  ]);
  if(t.error) throw t.error;
  if(s.error) throw s.error;
  if(a.error) throw a.error;
  therapists=t.data||[];
  services=s.data||[];
  availability=a.data||[];
}

function home(){
  render(`<section class="hero"><span class="badge">MindCare</span><h1>رعايتك النفسية تبدأ بخطوة</h1><p>اختر الخدمة والأخصائي والموعد المناسب لك بسهولة.</p><button class="btn" onclick="go('book')">احجز جلسة جديدة</button></section><section class="section"><h2>خدماتنا</h2><div class="grid">${services.map(s=>`<div class="card"><h3>${esc(s.name)}</h3><p>${esc(s.description||'جلسة مهنية مصممة وفق احتياجك.')}</p><div class="price">${Number(s.price).toLocaleString('ar-EG')} ${settings.currency} — ${s.duration_minutes} دقيقة</div></div>`).join('')}</div></section>`)
}
function steps(active){return `<div class="step">${['الخدمة','الأخصائي','المدة','التاريخ','الوقت','البيانات'].map((x,i)=>`<span class="${i===active?'active':''}">${i+1}. ${x}</span>`).join('')}</div>`}
function book(){render(`${steps(0)}<h2>اختر نوع الخدمة</h2><div class="grid">${services.map(s=>`<div class="card"><h3>${esc(s.name)}</h3><p>${esc(s.description||'جلسة مهنية مناسبة لاحتياجك.')}</p><div class="price">${Number(s.price).toLocaleString('ar-EG')} ${settings.currency}</div><button class="btn" onclick="selectService('${s.id}')">اختيار</button></div>`).join('')}</div><button class="btn secondary" onclick="go('home')">رجوع</button>`)}
function selectService(id){booking={serviceId:id,therapistId:null,duration:null,date:null,time:null};chooseTherapist()}
function initials(name){return String(name||'').trim().slice(0,1)}
function chooseTherapist(){render(`${steps(1)}<h2>اختر الأخصائي</h2><div class="grid">${therapists.map(t=>`<div class="card"><div class="doctor"><div class="avatar">${esc(initials(t.name))}</div><div><h3>${esc(t.name)}</h3><div>${esc(t.specialty||'أخصائي نفسي')}</div></div></div><p>${esc(t.bio||'')}</p><button class="btn" onclick="selectTherapist('${t.id}')">اختيار</button></div>`).join('')}</div><button class="btn secondary" onclick="book()">رجوع</button>`)}
function selectTherapist(id){booking.therapistId=id;chooseDuration()}
function chooseDuration(){
  const availableServices=services.filter(s=>s.id===booking.serviceId);
  render(`${steps(2)}<h2>اختر مدة الجلسة</h2><div class="grid">${availableServices.map(s=>`<div class="card"><h3>${s.duration_minutes} دقيقة</h3><div class="price">${Number(s.price).toLocaleString('ar-EG')} ${settings.currency}</div><button class="btn" onclick="selectDuration(${s.duration_minutes})">اختيار</button></div>`).join('')}</div><button class="btn secondary" onclick="chooseTherapist()">رجوع</button>`)
}
function selectDuration(d){booking.duration=d;chooseDate()}
function therapist(){return therapists.find(t=>t.id===booking.therapistId)||therapists[0]}
function service(){return services.find(s=>s.id===booking.serviceId)||services[0]}
function datesForTherapist(){return [...new Set(availability.filter(a=>a.therapist_id===booking.therapistId).map(a=>a.available_date))].sort()}
function chooseDate(){const dates=datesForTherapist();render(`${steps(3)}<h2>اختر التاريخ</h2>${dates.length?`<div class="grid">${dates.map(d=>`<div class="card"><h3>${formatDate(d)}</h3><p>${esc(therapist().name)} — ${booking.duration} دقيقة</p><button class="btn" onclick="chooseTime('${d}')">عرض المواعيد</button></div>`).join('')}</div>`:'<div class="notice">لا توجد مواعيد متاحة لهذا الأخصائي حالياً.</div>'}<button class="btn secondary" onclick="chooseDuration()">رجوع</button>`)}

function mins(t){const[a,b]=String(t).slice(0,5).split(':').map(Number);return a*60+b}
function addM(t,n){const v=mins(t)+n;return String(Math.floor(v/60)).padStart(2,'0')+':'+String(v%60).padStart(2,'0')}
function overlap(a,d,b,bd){return mins(a)<mins(b)+bd&&mins(b)<mins(a)+d}
function timeSlots(start,end){const out=[];for(let t=mins(start);t<mins(end);t+=30)out.push(addM('00:00',t));return out}
function slotsForDate(date){
  const rows=availability.filter(a=>a.therapist_id===booking.therapistId&&a.available_date===date);
  const set=new Set(); rows.forEach(r=>timeSlots(r.start_time,r.end_time).forEach(t=>set.add(t)));
  return [...set].sort();
}
function locallyAvailable(date,duration){
  return slotsForDate(date).filter(t=>duration!==60||slotsForDate(date).includes(addM(t,30)));
}
function chooseTime(date){
  booking.date=date;
  const slots=slotsForDate(date), av=locallyAvailable(date,booking.duration);
  render(`${steps(4)}<h2>اختر الوقت</h2><p>${formatDate(date)} — ${esc(therapist().name)}</p><div class="slots">${slots.map(t=>`<button class="slot ${av.includes(t)?'':'busy'}" ${av.includes(t)?`onclick="clientData('${t}')"`:'disabled'}>${t}</button>`).join('')}</div><button class="btn secondary" onclick="chooseDate()">رجوع</button>`)
}
function clientData(time){
  booking.time=time;
  const s=service();
  render(`${steps(5)}<h2>بيانات الحجز</h2><div class="card form"><input id="clientName" class="input" placeholder="الاسم الكامل" autocomplete="name"><input id="clientPhone" class="input" placeholder="رقم الهاتف" inputmode="tel" autocomplete="tel"><input id="clientEmail" class="input" placeholder="البريد الإلكتروني (اختياري)" type="email" autocomplete="email"><label><input type="checkbox" id="consent"> أوافق على سياسة الخصوصية وشروط الحجز.</label><div class="notice summary"><b>ملخص الحجز</b><br>${esc(s.name)}<br>${esc(therapist().name)}<br>${booking.duration} دقيقة — ${formatDate(booking.date)} — ${booking.time}<br><b>${Number(s.price).toLocaleString('ar-EG')} ${settings.currency}</b></div><button class="btn" onclick="confirmBooking()">تأكيد الحجز</button><button class="btn secondary" onclick="chooseTime('${booking.date}')">رجوع</button></div>`)
}

async function confirmBooking(){
  const name=document.getElementById('clientName').value.trim();
  const phone=document.getElementById('clientPhone').value.trim();
  const email=document.getElementById('clientEmail').value.trim();
  const consent=document.getElementById('consent').checked;
  if(!name||!phone||!consent){alert('يرجى إدخال الاسم ورقم الهاتف والموافقة على الشروط.');return}
  const s=service();
  if(!s||!therapist()){alert('بيانات الحجز غير مكتملة.');return}
  if(!locallyAvailable(booking.date,booking.duration).includes(booking.time)){alert('هذا الموعد غير متاح.');chooseTime(booking.date);return}
  const start=`${booking.date}T${booking.time}:00+03:00`;
  const endTime=addM(booking.time,booking.duration);
  const end=`${booking.date}T${endTime}:00+03:00`;
  const payload={
    client_name:name,client_phone:phone,client_email:email||null,
    therapist_id:booking.therapistId,service_id:booking.serviceId,
    start_at:start,end_at:end,duration_minutes:booking.duration,
    price:Number(s.price),consent_given:true
  };
  const btns=document.querySelectorAll('.btn');btns.forEach(b=>b.disabled=true);
  try{
    const {data,error}=await sb.from('appointments').insert(payload).select('id,booking_code,status,start_at,end_at,price').single();
    if(error){
      if(String(error.message||'').toLowerCase().includes('overlap')||String(error.details||'').toLowerCase().includes('overlap')) throw new Error('هذا الموعد تم حجزه للتو. اختر موعداً آخر.');
      throw error;
    }
    const local=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
    local.unshift({id:data.id,bookingCode:data.booking_code,name,phone,email,serviceId:booking.serviceId,therapistId:booking.therapistId,duration:booking.duration,date:booking.date,time:booking.time,price:data.price,status:data.status,created:new Date().toISOString()});
    localStorage.setItem(STORAGE_KEY,JSON.stringify(local.slice(0,20)));
    render(`<section class="hero"><h2>✓ تم حجز موعدك بنجاح</h2><p>${esc(s.name)}<br>${esc(therapist().name)}<br>${formatDate(booking.date)} — ${booking.time}<br>جلسة ${booking.duration} دقيقة</p><p>رقم الحجز: <b>${esc(data.booking_code)}</b></p><p class="muted">تم حفظ الحجز في النظام المركزي.</p><button class="btn" onclick="go('appointments')">مواعيدي</button><button class="btn secondary" onclick="go('home')">الرئيسية</button></section>`);
  }catch(e){alert(e.message||'تعذر إنشاء الحجز.');btns.forEach(b=>b.disabled=false)}
}
function appointments(){
  const rows=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
  render(`<h2>مواعيدي</h2>${rows.length?`<div class="grid">${rows.map(b=>`<div class="card"><h3>${formatDate(b.date)} — ${esc(b.time)}</h3><p>${esc(serviceBy(b.serviceId)?.name||'')}<br>${esc(therapistBy(b.therapistId)?.name||'')}<br>${b.duration} دقيقة — ${Number(b.price).toLocaleString('ar-EG')} ${settings.currency}</p><span class="badge">${esc(b.status)}</span><p class="muted">رقم الحجز: ${esc(b.bookingCode)}</p></div>`).join('')}</div>`:'<div class="card">لا توجد حجوزات محفوظة على هذا الجهاز.</div>'}<p class="muted">ملاحظة: سجل العميل الشخصي عبر الأجهزة سيُضاف بعد تفعيل حسابات العملاء.</p>`)
}
function serviceBy(id){return services.find(s=>s.id===id)}
function therapistBy(id){return therapists.find(t=>t.id===id)}
function formatDate(d){return new Date(d+'T00:00:00').toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}

function admin(){
 render(`<h2>لوحة الإدارة</h2><div class="notice warning">تم فصل لوحة الإدارة عن قاعدة البيانات العامة في هذه المرحلة. قبل السماح بإدارة المواعيد والحجوزات سنضيف تسجيل دخول آمن وصلاحيات RLS للمشرفين والأخصائيين.</div><div class="card"><h3>حالة الاتصال</h3><p>Supabase: متصل</p><p>الأخصائيون: ${therapists.length}</p><p>الخدمات: ${services.length}</p><p>فترات الإتاحة: ${availability.length}</p></div><button class="btn secondary" onclick="go('home')">الرئيسية</button>`)
}

async function router(){
 const p=location.hash.replace('#','')||'home';
 loading();
 try{
   await loadCatalog();
   ({home,book,appointments,admin}[p]||home)();
 }catch(e){console.error(e);errorBox(e.message||'حدث خطأ غير متوقع.')}
}
addEventListener('hashchange',router);
if('serviceWorker'in navigator)navigator.serviceWorker.register('./sw.js').catch(console.error);
router();
