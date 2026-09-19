import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  BusFront,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Filter,
  LogOut,
  MapPinned,
  MessageSquareText,
  Navigation,
  School,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import LiveBusMap from './components/LiveBusMap'

type Role = 'student' | 'parent' | 'school_admin' | 'authority'
type StudentStatus =
  | 'confirmed'
  | 'boarded'
  | 'on-route'
  | 'arrived'
  | 'not-confirmed'
  | 'late'
  | 'issue'

type ReportStatus = 'new' | 'processing' | 'transferred' | 'resolved'

type Student = {
  id: number
  name: string
  grade: string
  school: string
  busNo: number
  route: string
  pickup: string
  status: StudentStatus
  parentName: string
  phone: string
  lat: number
  lng: number
}

type Report = {
  id: number
  type: string
  busNo: number
  driver: string
  time: string
  location: string
  status: ReportStatus
  school: string
  details: string
}

type NotificationItem = {
  id: number
  title: string
  time: string
  type: 'success' | 'info' | 'warning' | 'danger'
}

type AuthUser = {
  id: number
  username: string
  full_name: string
  role: Role
  school_id: number | null
  school_slug: string | null
  school_name: string | null
  school_city: string | null
  status: string
}

const studentsSeed: Student[] = [
  {
    id: 1,
    name: 'محمد أحمد',
    grade: 'الصف الرابع ابتدائي',
    school: 'مدرسة النور الابتدائية',
    busNo: 24,
    route: 'المسار الشرقي',
    pickup: 'حي النخيل',
    status: 'confirmed',
    parentName: 'أحمد محمد',
    phone: '0555123456',
    lat: 24.774,
    lng: 46.738,
  },
  {
    id: 2,
    name: 'خالد سالم',
    grade: 'الصف الخامس ابتدائي',
    school: 'مدرسة النور الابتدائية',
    busNo: 24,
    route: 'المسار الشرقي',
    pickup: 'حي النخيل',
    status: 'boarded',
    parentName: 'سالم خالد',
    phone: '0555988777',
    lat: 24.779,
    lng: 46.744,
  },
  {
    id: 3,
    name: 'سارة فهد',
    grade: 'الصف السادس ابتدائي',
    school: 'مدرسة النور الابتدائية',
    busNo: 24,
    route: 'المسار الشرقي',
    pickup: 'حي الورود',
    status: 'on-route',
    parentName: 'فهد سارة',
    phone: '0555666777',
    lat: 24.778,
    lng: 46.742,
  },
  {
    id: 4,
    name: 'ليلى عمران',
    grade: 'الصف الثالث المتوسط',
    school: 'مدرسة الفجر المتوسطة',
    busNo: 18,
    route: 'المسار المركزي',
    pickup: 'حي الزهراء',
    status: 'not-confirmed',
    parentName: 'عمران ليلى',
    phone: '0555443322',
    lat: 24.746,
    lng: 46.756,
  },
  {
    id: 5,
    name: 'يوسف نبيل',
    grade: 'الصف الثاني ثانوي',
    school: 'مدرسة الفجر المتوسطة',
    busNo: 18,
    route: 'المسار المركزي',
    pickup: 'حي الزهراء',
    status: 'late',
    parentName: 'نبيل يوسف',
    phone: '0555777890',
    lat: 24.75,
    lng: 46.758,
  },
]

const reportsSeed: Report[] = [
  {
    id: 101,
    type: 'تأخر الحافلة',
    busNo: 24,
    driver: 'إبراهيم علي',
    time: '06:45',
    location: 'حي النخيل',
    status: 'new',
    school: 'مدرسة النور الابتدائية',
    details: 'تأخر الحافلة في الوصول لنقطة التجمع بنحو 7 دقائق بسبب ازدحام في الطريق.',
  },
  {
    id: 102,
    type: 'مشكلة في الطريق',
    busNo: 18,
    driver: 'باسم ريان',
    time: '07:10',
    location: 'شارع الأمير',
    status: 'processing',
    school: 'مدرسة الفجر المتوسطة',
    details: 'تم إبلاغ الجهة المختصة لتأمين مسار بديل بسبب أعمال صيانة في الشارع.',
  },
  {
    id: 103,
    type: 'حالة طارئة',
    busNo: 42,
    driver: 'خالد صلاح',
    time: '08:20',
    location: 'المدخل الجنوبي',
    status: 'transferred',
    school: 'مدرسة السلام',
    details: 'تم تحويل البلاغ إلى الجهة المختصة ومعالجة ملف الحالة.',
  },
]

const notificationsSeed: NotificationItem[] = [
  { id: 1, title: 'تم تأكيد حضور محمد', time: '06:25', type: 'success' },
  { id: 2, title: 'تم تسجيل صعود خالد للحافلة', time: '06:54', type: 'info' },
  { id: 3, title: 'الحافلة قريبة من نقطة التجمع', time: '06:58', type: 'warning' },
  { id: 4, title: 'تم وصول سارة إلى المدرسة', time: '07:20', type: 'success' },
  { id: 5, title: 'يوجد بلاغ جديد يتعلق بالحافلة', time: '07:30', type: 'danger' },
]

const tripStats = [
  { name: 'السبت', students: 210 },
  { name: 'الأحد', students: 240 },
  { name: 'الإثنين', students: 255 },
  { name: 'الثلاثاء', students: 230 },
  { name: 'الأربعاء', students: 270 },
  { name: 'الخميس', students: 285 },
]

const attendanceData = [
  { name: 'مؤكد', value: 72 },
  { name: 'صعد', value: 58 },
  { name: 'في الطريق', value: 18 },
  { name: 'لم يؤكد', value: 12 },
]

const tripsWeekly = [
  { name: 'Mon', complete: 32, late: 4 },
  { name: 'Tue', complete: 36, late: 3 },
  { name: 'Wed', complete: 34, late: 5 },
  { name: 'Thu', complete: 39, late: 2 },
  { name: 'Fri', complete: 41, late: 4 },
  { name: 'Sat', complete: 38, late: 3 },
]

const busStatusColors = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  boarded: 'bg-sky-100 text-sky-700',
  'on-route': 'bg-amber-100 text-amber-700',
  arrived: 'bg-emerald-100 text-emerald-700',
  'not-confirmed': 'bg-slate-200 text-slate-700',
  late: 'bg-orange-100 text-orange-700',
  issue: 'bg-red-100 text-red-700',
}

const statusLabels: Record<StudentStatus, string> = {
  confirmed: 'مؤكد الحضور',
  boarded: 'صعد الحافلة',
  'on-route': 'في الطريق',
  arrived: 'وصل الطالب',
  'not-confirmed': 'لم يؤكد الحضور',
  late: 'متأخر',
  issue: 'يوجد بلاغ',
}

const reportStatusLabels: Record<ReportStatus, string> = {
  new: 'جديد',
  processing: 'قيد المعالجة',
  transferred: 'محول للجهة',
  resolved: 'تم الحل',
}

function App() {
  const [role, setRole] = useState<Role | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [authUser, setAuthUser] = useState<AuthUser | null>(null)
  const [username, setUsername] = useState('parent01')
  const [password, setPassword] = useState('123456')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotMessage, setForgotMessage] = useState('')
  const [selectedChildId, setSelectedChildId] = useState(1)
  const [students, setStudents] = useState<Student[]>(studentsSeed)
  const [notifications, setNotifications] = useState<NotificationItem[]>(notificationsSeed)
  const [reports, setReports] = useState<Report[]>(reportsSeed)
  const [activeTab, setActiveTab] = useState('home')
  const [message, setMessage] = useState('')
  const [reportType, setReportType] = useState('تأخر الحافلة')
  const [toast, setToast] = useState('')
  const [driverFilter, setDriverFilter] = useState('all')

  const selectedChild = useMemo(
    () => students.find((student) => student.id === selectedChildId) ?? students[0],
    [selectedChildId, students],
  )

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setLoginError('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.message ?? 'تعذر تسجيل الدخول.')
      setAuthUser(payload.user)
      setSessionToken(payload.token)
      setRole(payload.user.role)
      setActiveTab(payload.user.role === 'parent' ? 'home' : 'dashboard')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'تعذر تسجيل الدخول.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleForgotPassword = async () => {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
    const payload = await response.json()
    setForgotMessage(payload.message)
  }

  const confirmAttendance = (studentId: number, confirmed: boolean) => {
    const nextStatus: StudentStatus = confirmed ? 'confirmed' : 'not-confirmed'
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status: nextStatus } : student,
      ),
    )
    setToast(
      confirmed
        ? 'تم تأكيد حضور الطالب بنجاح.'
        : 'تم تسجيل أن الطالب لن يحضر اليوم.',
    )

    setNotifications((prev) => [
      {
        id: Date.now(),
        title: confirmed ? 'تم تأكيد حضور محمد' : 'تم تحديث حالة محمد',
        time: 'الآن',
        type: confirmed ? 'success' : 'info',
      },
      ...prev,
    ])
  }

  const markBoarded = (studentId: number) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status: 'boarded' } : student,
      ),
    )
    setToast('تم تسجيل صعود الطالب للحافلة.')
    setNotifications((prev) => [
      {
        id: Date.now(),
        title: 'تم تسجيل صعود محمد للحافلة',
        time: 'الآن',
        type: 'info',
      },
      ...prev,
    ])
  }

  const handleReportSubmit = () => {
    if (!message.trim()) return
    const newReport: Report = {
      id: Date.now(),
      type: reportType,
      busNo: 24,
      driver: 'إبراهيم علي',
      time: 'الآن',
      location: 'حي النخيل',
      status: 'new',
      school: 'مدرسة النور الابتدائية',
      details: message,
    }
    setReports((prev) => [newReport, ...prev])
    setToast('تم إرسال البلاغ بنجاح.')
    setMessage('')
  }

  const updateReportStatus = (id: number, status: ReportStatus) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === id ? { ...report, status } : report,
      ),
    )
    setToast('تم تحديث حالة البلاغ بنجاح.')
  }

  const filteredStudents =
    driverFilter === 'all'
      ? students
      : driverFilter === 'confirmed'
        ? students.filter((s) => s.status === 'confirmed' || s.status === 'boarded')
        : driverFilter === 'boarded'
          ? students.filter((s) => s.status === 'boarded')
          : students.filter((s) => s.status === 'not-confirmed' || s.status === 'late')

  const loginPage = (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white">S</div>
            <div>
              <div className="text-xl font-black text-slate-900">سالِك</div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-slate-500">SALIK</div>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-sky-700">
                <ShieldCheck className="h-4 w-4" />
                منصة إدارة النقل المدرسي
              </div>

              <h1 className="text-3xl font-black leading-tight text-slate-900 md:text-5xl">
                متابعة الحافلات وسلامة الطلاب
              </h1>

              <p className="mt-4 max-w-lg text-base leading-8 text-slate-600 md:text-lg">
                تتبع حضور الطلاب، تسجيل الصعود، ومراقبة الرحلات بشكل سريع وواضح.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-slate-600">
                <span className="rounded-full bg-sky-50 px-3 py-2 text-sky-700">تتبع مباشر</span>
                <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">إشعارات فورية</span>
                <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">بلاغات موثقة</span>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-900 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.14)] md:p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold">تسجيل الدخول</h2>
                <div className="rounded-full bg-sky-500/20 px-2 py-1 text-[10px] font-bold text-sky-200">SALIK</div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">اسم المستخدم</label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && void handleLogin()}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-400"
                    placeholder="أدخل اسم المستخدم"
                    autoComplete="username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-300">كلمة المرور</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && void handleLogin()}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-400"
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  onClick={() => void handleLogin()}
                  disabled={isLoggingIn}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-base font-extrabold text-white shadow-lg shadow-sky-500/30"
                >
                  {isLoggingIn ? 'جارٍ التحقق...' : 'تسجيل الدخول'}
                  <ChevronRight className="h-5 w-5" />
                </button>

                {loginError && (
                  <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {loginError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true)
                    setForgotMessage('')
                  }}
                  className="w-full text-center text-sm font-bold text-sky-300 hover:text-sky-200"
                >
                  نسيت كلمة المرور؟
                </button>

                {showForgotPassword && (
                  <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-3 text-xs leading-6 text-slate-300">
                    <div>أدخل اسم المستخدم ثم اطلب استعادة كلمة المرور.</div>
                    <button
                      type="button"
                      onClick={() => void handleForgotPassword()}
                      className="mt-2 rounded-xl bg-sky-500 px-3 py-2 font-bold text-white"
                    >
                      إرسال طلب الاستعادة
                    </button>
                    {forgotMessage && <div className="mt-2 text-sky-200">{forgotMessage}</div>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const cards = [
    { title: 'الحافلات', value: '24', icon: BusFront, tone: 'text-sky-700 bg-sky-100' },
    { title: 'الرحلات النشطة', value: '18', icon: Navigation, tone: 'text-emerald-700 bg-emerald-100' },
    { title: 'الطلاب', value: '326', icon: Users, tone: 'text-violet-700 bg-violet-100' },
    { title: 'البلاغات المفتوحة', value: '12', icon: AlertTriangle, tone: 'text-amber-700 bg-amber-100' },
  ]

  const parentDashboard = (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">مرحبًا بك،</p>
            <h2 className="text-3xl font-black text-slate-900">{authUser?.full_name}</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-sky-50 px-3 py-2 text-sm font-bold text-sky-700">
            <Bell className="h-4 w-4" />
            5 إشعارات جديدة
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedChildId(student.id)}
              className={`rounded-2xl border p-4 text-right transition ${
                selectedChild.id === student.id
                  ? 'border-sky-500 bg-sky-50 shadow-sm'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-slate-900">{student.name}</div>
                  <div className="text-sm text-slate-500">{student.grade}</div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${busStatusColors[student.status]}`}>
                  {statusLabels[student.status]}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600">
                <div>الحافلة: #{student.busNo}</div>
                <div>المسار: {student.route}</div>
                <div>نقطة التجمع: {student.pickup}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">تأكيد الحضور</div>
              <h3 className="text-2xl font-black text-slate-900">{selectedChild.name}</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
              {statusLabels[selectedChild.status]}
            </span>
          </div>

          <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-5">
            <div className="mb-4 text-lg font-extrabold text-slate-900">هل سيحضر ابنك اليوم؟</div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => confirmAttendance(selectedChild.id, true)}
                className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200"
              >
                نعم، سيحضر
              </button>
              <button
                onClick={() => confirmAttendance(selectedChild.id, false)}
                className="rounded-2xl bg-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
              >
                لا، لن يحضر
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 text-sm text-slate-500">تتبع الرحلة</div>
            <div className="space-y-5">
              {[
                { time: '06:30', label: 'تم تأكيد الحضور', done: true },
                { time: '06:52', label: 'صعد الحافلة', done: true },
                { time: '07:00', label: 'الحافلة في الطريق', done: true },
                { time: '07:08', label: 'الوصول المتوقع', done: false },
              ].map((step) => (
                <div key={step.time} className="timeline-entry relative flex items-center gap-4 pr-10">
                  <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {step.done ? <Check className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900">{step.time}</div>
                    <div className="text-sm text-slate-500">{step.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">تتبع الحافلة</div>
              <h3 className="text-2xl font-black text-slate-900">الحافلة #24</h3>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">الرحلة جارية</span>
          </div>

          <LiveBusMap busId={24} token={sessionToken} />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">ETA</div>
              <div className="mt-1 text-2xl font-black text-slate-900">08 دقيقة</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">المسار</div>
              <div className="mt-1 text-xl font-black text-slate-900">المسار الشرقي</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">الإشعارات</div>
            <Bell className="h-5 w-5 text-sky-600" />
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${
                  n.type === 'success' ? 'bg-emerald-500' : n.type === 'warning' ? 'bg-amber-500' : n.type === 'danger' ? 'bg-red-500' : 'bg-sky-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-900">{n.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">التواصل مع المدرسة</div>
            <MessageSquareText className="h-5 w-5 text-sky-600" />
          </div>
          <div className="space-y-4">
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="تأخر الحافلة">تأخر الحافلة</option>
              <option value="مشكلة في الطريق">مشكلة في الطريق</option>
              <option value="مشكلة مع الطالب">مشكلة مع الطالب</option>
              <option value="أخرى">أخرى</option>
            </select>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="اكتب تفاصيل المشكلة أو السؤال..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none"
            />
            <button onClick={handleReportSubmit} className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-sky-200">
              إرسال البلاغ
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const studentDashboard = (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">مرحبًا بك في سالِك</p>
        <h2 className="mt-1 text-3xl font-black text-slate-900">{authUser?.full_name}</h2>
        <p className="mt-2 text-slate-600">{authUser?.school_name ?? 'مدرستك'}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {[
          ['حالة الرحلة', 'في الطريق'],
          ['الحافلة', '#24'],
          ['الوصول المتوقع', '07:08'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const driverDashboard = (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm text-slate-500">الحافلة</div>
            <h2 className="text-3xl font-black text-slate-900">#24 | المسار الشرقي</h2>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-sm font-bold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            الرحلة جارية
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">قائمة الطلاب</div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
              <Filter className="h-4 w-4" />
              <select value={driverFilter} onChange={(e) => setDriverFilter(e.target.value)} className="bg-transparent outline-none">
                <option value="all">الكل</option>
                <option value="confirmed">مؤكد الحضور</option>
                <option value="boarded">صعد</option>
                <option value="unconfirmed">لم يصعد</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredStudents.map((student) => (
              <div key={student.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-100 text-sm font-extrabold text-sky-700">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-base font-black text-slate-900">{student.name}</div>
                      <div className="text-sm text-slate-500">{student.grade} • نقطة التجمع: {student.pickup}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${busStatusColors[student.status]}`}>
                      {statusLabels[student.status]}
                    </span>
                    <button onClick={() => markBoarded(student.id)} className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white">
                      تسجيل الصعود
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">المحطات</div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
              <div className="text-sm text-sky-700">المحطة الحالية</div>
              <div className="mt-1 text-xl font-black text-slate-900">حي النخيل</div>
              <div className="mt-2 text-sm text-slate-600">3 طلاب</div>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-sm text-amber-700">المحطة القادمة</div>
              <div className="mt-1 text-xl font-black text-slate-900">حي الورود</div>
              <div className="mt-2 text-sm text-slate-600">5 طلاب</div>
            </div>
          </div>

          <div className="mt-5"><LiveBusMap busId={24} token={sessionToken} canPublish={role === 'school_admin'} /></div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xl font-black text-slate-900">رفع بلاغ</div>
          <Siren className="h-5 w-5 text-red-500" />
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none"
          >
            <option value="تأخر الحافلة">تأخر الحافلة</option>
            <option value="عطل في الحافلة">عطل في الحافلة</option>
            <option value="مشكلة في الطريق">مشكلة في الطريق</option>
            <option value="مشكلة مع طالب">مشكلة مع طالب</option>
            <option value="حادث">حادث</option>
            <option value="أخرى">أخرى</option>
          </select>
          <div className="flex gap-3">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="اكتب تفاصيل المشكلة..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none"
            />
            <button onClick={handleReportSubmit} className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-red-200">
              إرسال البلاغ
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const adminDashboard = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className={`rounded-2xl p-3 ${card.tone}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="text-3xl font-black text-slate-900">{card.value}</div>
            </div>
            <div className="mt-3 text-sm text-slate-500">{card.title}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">Live Map</div>
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> 12 رحلات نشطة</div>
          </div>
          <LiveBusMap busId={24} token={sessionToken} canPublish={role === 'school_admin'} />
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">حالة الطلاب</div>
          <div className="space-y-4">
            {[
              ['إجمالي المتوقع حضورهم', '246'],
              ['من صعدوا', '182'],
              ['من لم يصعدوا', '34'],
              ['لم يؤكدوا الحضور', '30'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 p-3">
                <span className="text-sm text-slate-600">{label}</span>
                <span className="text-2xl font-black text-slate-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">الطلاب</div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
              <Search className="h-4 w-4" />
              بحث
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 font-bold">الاسم</th>
                  <th className="pb-3 font-bold">الصف</th>
                  <th className="pb-3 font-bold">الحافلة</th>
                  <th className="pb-3 font-bold">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100">
                    <td className="py-3 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3 text-slate-600">{student.grade}</td>
                    <td className="py-3 text-slate-600">#{student.busNo}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${busStatusColors[student.status]}`}>
                        {statusLabels[student.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">البلاغات</div>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-bold text-slate-900">#{report.id} • {report.type}</div>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700">
                    {reportStatusLabels[report.status]}
                  </span>
                </div>
                <div className="mt-2 text-xs text-slate-600">الحافلة #{report.busNo} • {report.driver}</div>
                <button onClick={() => updateReportStatus(report.id, 'transferred')} className="mt-3 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">
                  تحويل للجهة المختصة
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const authorityDashboard = (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ['عدد المدارس', '28'],
          ['عدد الحافلات', '192'],
          ['عدد الطلاب', '14500'],
          ['رحلات حالية', '66'],
          ['بلاغات مفتوحة', '18'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">{label}</div>
            <div className="mt-2 text-3xl font-black text-slate-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">الخريطة المركزية</div>
          <LiveBusMap busId={24} token={sessionToken} />
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">التحليلات</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tripsWeekly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="complete" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              <Bar dataKey="late" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 text-xl font-black text-slate-900">بلاغات المحولة</div>
        <div className="space-y-3">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-black text-slate-900">#{report.id} • {report.type}</div>
                <div className="mt-1 text-xs text-slate-600">{report.school} • الحافلة #{report.busNo}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">
                  {reportStatusLabels[report.status]}
                </span>
                <button onClick={() => updateReportStatus(report.id, 'resolved')} className="rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white">
                  تم الحل
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const sidebarItems = {
    student: [
      { key: 'home', label: 'الرئيسية', icon: UserRound },
      { key: 'track', label: 'تتبع الحافلة', icon: MapPinned },
      { key: 'notifications', label: 'الإشعارات', icon: Bell },
    ],
    parent: [
      { key: 'home', label: 'الرئيسية', icon: UserRound },
      { key: 'track', label: 'تتبع الحافلة', icon: MapPinned },
      { key: 'notifications', label: 'الإشعارات', icon: Bell },
      { key: 'support', label: 'الدعم', icon: MessageSquareText },
    ],
    school_admin: [
      { key: 'dashboard', label: 'لوحة التحكم', icon: Sparkles },
      { key: 'students', label: 'الطلاب', icon: Users },
      { key: 'buses', label: 'الحافلات', icon: BusFront },
      { key: 'reports', label: 'البلاغات', icon: AlertTriangle },
      { key: 'analytics', label: 'التحليلات', icon: TrendingUp },
    ],
    authority: [
      { key: 'dashboard', label: 'لوحة القيادة', icon: School },
      { key: 'schools', label: 'المدارس', icon: School },
      { key: 'buses', label: 'الحافلات', icon: BusFront },
      { key: 'reports', label: 'البلاغات', icon: AlertTriangle },
      { key: 'analytics', label: 'التحليلات', icon: TrendingUp },
    ],
  }

  const pageContent = {
    parent: {
      home: parentDashboard,
      track: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-xl font-black text-slate-900">تتبع الحافلة</div>
            <div className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">الحافلة تبعد 8 دقائق</div>
          </div>
          <LiveBusMap busId={24} token={sessionToken} />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ['المسار', 'المسار الشرقي'],
              ['الحالة', 'في الطريق'],
              ['الوقت المتوقع', '07:08'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{label}</div>
                <div className="mt-1 text-lg font-black text-slate-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      notifications: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">مركز الإشعارات</div>
          <div className="space-y-3">
            {notifications.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-base font-bold text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">{item.time}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                  item.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                  item.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                  item.type === 'danger' ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700'
                }`}>{item.type}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      support: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">تواصل مع المدرسة</div>
          <div className="space-y-4">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none">
              <option value="تأخر الحافلة">تأخر الحافلة</option>
              <option value="مشكلة في الطريق">مشكلة في الطريق</option>
              <option value="مشكلة مع الطالب">مشكلة مع الطالب</option>
              <option value="أخرى">أخرى</option>
            </select>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="اكتب رسالتك هنا..." className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none" />
            <button onClick={handleReportSubmit} className="rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white">
              إرسال البلاغ
            </button>
          </div>
        </div>
      ),
    },
    driver: {
      dashboard: driverDashboard,
      students: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">معلومات الطلاب</div>
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-base font-black text-slate-900">{student.name}</div>
                  <div className="text-sm text-slate-500">{student.grade}</div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${busStatusColors[student.status]}`}>
                  {statusLabels[student.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
      stops: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">المحطات والتوقفات</div>
          <div className="space-y-4">
            {[
              ['المرحلة الحالية', 'حي النخيل', '3 طلاب'],
              ['المرحلة القادمة', 'حي الورود', '5 طلاب'],
              ['موقع المدرسة', 'المنطقة المركزية', '07:15'],
            ].map(([title, value, meta]) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">{title}</div>
                <div className="mt-1 text-lg font-black text-slate-900">{value}</div>
                <div className="text-sm text-slate-500">{meta}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      report: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">رفع بلاغ</div>
          <div className="space-y-4">
            <select value={reportType} onChange={(e) => setReportType(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none">
              <option value="تأخر الحافلة">تأخر الحافلة</option>
              <option value="عطل في الحافلة">عطل في الحافلة</option>
              <option value="مشكلة في الطريق">مشكلة في الطريق</option>
              <option value="مشكلة مع طالب">مشكلة مع طالب</option>
              <option value="حادث">حادث</option>
            </select>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700 outline-none" placeholder="وصف المشكلة" />
            <button onClick={handleReportSubmit} className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-bold text-white">
              إرسال البلاغ
            </button>
          </div>
        </div>
      ),
    },
    school_admin: {
      dashboard: adminDashboard,
      students: adminDashboard,
      buses: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">الحافلات</div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { no: 24, driver: 'إبراهيم علي', route: 'المسار الشرقي', count: 26, state: 'جارية' },
              { no: 18, driver: 'باسم ريان', route: 'المسار المركزي', count: 21, state: 'متأخرة' },
              { no: 42, driver: 'خالد صلاح', route: 'المسار الجنوبي', count: 19, state: 'مشكلة' },
              { no: 9, driver: 'سامي نواف', route: 'المسار الغربي', count: 24, state: 'جارية' },
            ].map((bus) => (
              <div key={bus.no} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-lg font-black text-slate-900">حافلة #{bus.no}</div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${bus.state === 'متأخرة' ? 'bg-amber-100 text-amber-700' : bus.state === 'مشكلة' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {bus.state}
                  </span>
                </div>
                <div className="mt-3 text-sm text-slate-600">السائق: {bus.driver}</div>
                <div className="mt-1 text-sm text-slate-600">المسار: {bus.route}</div>
                <div className="mt-1 text-sm text-slate-600">عدد الطلاب: {bus.count}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      reports: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">البلاغات</div>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900">{report.type}</div>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700">{reportStatusLabels[report.status]}</span>
                </div>
                <div className="mt-2 text-xs text-slate-600">{report.location} • {report.time}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      analytics: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">مؤشرات الأداء</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tripStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="students" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
    authority: {
      dashboard: authorityDashboard,
      schools: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">المدارس</div>
          <div className="space-y-3">
            {['مدرسة النور الابتدائية', 'مدرسة الفجر المتوسطة', 'مدرسة السلام', 'مدرسة الريان'].map((school, index) => (
              <div key={school} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-base font-bold text-slate-900">{school}</div>
                  <div className="text-xs text-slate-500">{index + 4} حافلات • {index + 3} رحلات</div>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-700">نشط</span>
              </div>
            ))}
          </div>
        </div>
      ),
      buses: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">الحافلات في المنطقة</div>
          <div className="grid gap-4 md:grid-cols-2">
            {[{ no: 24, school: 'مدرسة النور', status: 'طبيعي' }, { no: 18, school: 'مدرسة الفجر', status: 'متأخر' }, { no: 42, school: 'مدرسة السلام', status: 'مشكلة' }, { no: 9, school: 'مدرسة الريان', status: 'طبيعي' }].map((item) => (
              <div key={item.no} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-black text-slate-900">#{item.no}</div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.status === 'متأخر' ? 'bg-amber-100 text-amber-700' : item.status === 'مشكلة' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{item.status}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">{item.school}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      reports: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">بلاغات المدارس</div>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black text-slate-900">{report.type}</div>
                  <span className="rounded-full bg-sky-100 px-2 py-1 text-[10px] font-bold text-sky-700">{reportStatusLabels[report.status]}</span>
                </div>
                <div className="mt-2 text-xs text-slate-600">{report.school} • {report.location}</div>
              </div>
            ))}
          </div>
        </div>
      ),
      analytics: (
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 text-xl font-black text-slate-900">نسب الالتزام</div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={attendanceData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40} label>
                  {attendanceData.map((entry, index) => (
                    <Cell key={entry.name} fill={['#10b981', '#2563eb', '#f59e0b', '#94a3b8'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      ),
    },
  }

  const currentPageView =
    role === 'student'
      ? studentDashboard
      : role === 'parent'
      ? pageContent.parent[activeTab as keyof typeof pageContent.parent] ?? pageContent.parent.home
      : role === 'school_admin'
          ? pageContent.school_admin[activeTab as keyof typeof pageContent.school_admin] ?? pageContent.school_admin.dashboard
          : pageContent.authority[activeTab as keyof typeof pageContent.authority] ?? pageContent.authority.dashboard

  return (
    <>
      {!sessionToken || !authUser || !role ? (
        loginPage
      ) : (
        <div className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-[1600px] p-4 md:p-6">
            <div className="flex flex-col gap-4 rounded-[30px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)] xl:flex-row">
              <aside className="w-full border-b border-slate-200 bg-slate-950 p-4 text-white xl:w-[280px] xl:border-b-0 xl:border-l">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white">S</div>
                    <div>
                      <div className="text-xl font-black">سالِك</div>
                      <div className="text-xs font-bold tracking-[0.18em] text-slate-300">SALIK</div>
                    </div>
                  </div>
                  <button onClick={() => { setSessionToken(null); setAuthUser(null); setRole(null) }} className="rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-200">
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>

                <nav className="space-y-2">
                  {sidebarItems[role].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-right transition ${
                        activeTab === key ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span className="font-bold">{label}</span>
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </nav>

                <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900 p-4">
                  <div className="text-xs text-slate-400">حالة المستخدم</div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white">أ</div>
                    <div>
                      <div className="font-bold text-white">{authUser?.full_name ?? 'مستخدم سالِك'}</div>
                      <div className="text-xs text-slate-400">{role === 'student' ? 'طالب' : role === 'parent' ? 'ولي أمر' : role === 'school_admin' ? 'إدارة المدرسة' : 'جهة مختصة'}</div>
                      {authUser?.school_name && <div className="mt-1 text-[11px] text-sky-300">{authUser.school_name}</div>}
                    </div>
                  </div>
                </div>
              </aside>

              <main className="flex-1 p-4 md:p-6">
                <header className="mb-6 flex flex-col gap-4 rounded-[26px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm text-slate-500">{authUser?.school_name ?? 'نظام النقل المدرسي'}</div>
                    <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
                      {role === 'student' ? 'لوحة الطالب' : role === 'parent' ? 'لوحة ولي الأمر' : role === 'school_admin' ? 'لوحة إدارة المدرسة' : 'لوحة الجهة المختصة'}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600">العربية</button>
                    <button className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600">English</button>
                    <div className="flex items-center gap-2 rounded-2xl bg-sky-600 px-3 py-2 text-white shadow-lg shadow-sky-200">
                      <Bell className="h-4 w-4" />
                      <span className="text-sm font-bold">5</span>
                    </div>
                  </div>
                </header>

                {currentPageView}
              </main>
            </div>
          </div>

          {toast && (
            <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-xl">
              {toast}
              <button onClick={() => setToast('')} className="mr-3 text-slate-300">x</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default App
