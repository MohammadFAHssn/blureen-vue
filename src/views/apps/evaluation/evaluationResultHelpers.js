import { toComparisonKey } from '@core/utils/helpers'

export function scoreColor(score, max) {
  const s = Number(score)
  const m = Number(max)

  if (!Number.isFinite(s) || !Number.isFinite(m) || m <= 0)
    return 'grey'

  const ratio = s / m

  if (ratio >= 0.8)
    return 'success'
  if (ratio >= 0.6)
    return 'info'
  if (ratio >= 0.4)
    return 'warning'
  if (ratio >= 0)
    return 'error'
  return 'error'
}

export function rankColor(rank) {
  const r = toComparisonKey(rank)

  if (r === toComparisonKey('عالی'))
    return '#2E7D32' // dark green
  if (r === toComparisonKey('بسیار خوب') || r === toComparisonKey('برتر'))
    return '#388E3C' // green
  if (r === toComparisonKey('خوب'))
    return '#7CB342' // light green
  if (r === toComparisonKey('در حد انتظار'))
    return '#FBC02D' // yellow
  if (r === toComparisonKey('نیاز به مراقبت'))
    return '#F57C00'// orange
  if (r === toComparisonKey('نامطلوب'))
    return '#D32F2F' // red
  if (r === toComparisonKey('نظری ندارم') || r === toComparisonKey('عادی'))
    return '#9E9E9E' // gray

  return '#9E9E9E' // gray
}

export const mgrQualitativeItems = [
  { key: 'mgr_grooming', label: 'آراستگی ظاهری' },
  { key: 'mgr_respect_local_views', label: 'احترام به عقاید منطقه' },
  { key: 'mgr_uniform_compliance', label: 'پوشیدن لباس فرم' },
  { key: 'mgr_no_smartphone_entry', label: 'عدم ورود گوشی لمسی' },
  { key: 'mgr_shift_overlap_compliance', label: 'رعایت همپوشانی شیفت' },
  { key: 'mgr_workplace_organization', label: 'ساماندهی محیط کار' },
  { key: 'mgr_no_leaving_without_permission', label: 'عدم ترک محیط کار بدون مجوز' },
  { key: 'mgr_no_sleeping_on_duty', label: 'عدم خوابیدن در محیط کار' },
  { key: 'mgr_no_conflict', label: 'عدم نزاع و درگیری' },
  { key: 'mgr_no_smoking', label: 'عدم مصرف دخانیات' },
  { key: 'mgr_no_snacks', label: 'عدم مصرف تنقلات' },
  { key: 'mgr_no_daily_late_in_month', label: 'عدم تاخیر روزانه در ماه' },
  { key: 'mgr_no_unjustified_absence', label: 'عدم غیبت غیرموجه' },
  { key: 'mgr_no_negative_leave_balance', label: 'عدم مرخصی منفی' },
  { key: 'mgr_no_sick_leave_misuse', label: 'عدم استفاده نادرست از استعلاجی' },
  { key: 'mgr_safety_compliance', label: 'رعایت مقررات ایمنی' },
  { key: 'mgr_cost_saving', label: 'صرفه‌جویی و کاهش هزینه‌ها' },
  { key: 'mgr_confidentiality', label: 'رازداری' },
  { key: 'mgr_organizational_commitment', label: 'تعهد سازمانی' },
  { key: 'mgr_avoid_gossip', label: 'پرهیز از حواشی' },
  { key: 'mgr_no_unreasonable_expectations', label: 'نداشتن توقع بیجا' },
  { key: 'mgr_work_conscience', label: 'وجدان کاری' },
  { key: 'mgr_job_commitment', label: 'تعهد کاری' },
  { key: 'mgr_reliability', label: 'قابلیت اعتماد' },
  { key: 'mgr_obedience', label: 'فرمان‌پذیری' },
  { key: 'mgr_speed', label: 'سرعت عمل' },
  { key: 'mgr_teamwork', label: 'توانایی کار گروهی' },
  { key: 'mgr_work_discipline', label: 'نظم کاری' },
  { key: 'mgr_perseverance', label: 'پشتکار و جدیت' },
  { key: 'mgr_creativity_interest', label: 'خلاقیت و علاقه‌مندی به کار' },
  { key: 'mgr_availability', label: 'در دسترس بودن' },
  { key: 'mgr_flexibility', label: 'انعطاف‌پذیری' },
  { key: 'mgr_courage_to_speak', label: 'جسارت در بیان نظرات' },
  { key: 'mgr_realism', label: 'واقع‌گرایی' },
  { key: 'mgr_self_improvement', label: 'تلاش برای رفع نواقص خود' },
  { key: 'mgr_social_behavior', label: 'نحوه برخورد و معاشرت' },
  { key: 'mgr_motivate_colleagues', label: 'ایجاد انگیزه در همکاران' },
  { key: 'mgr_accepts_criticism', label: 'انتقادپذیری' },
  { key: 'mgr_learning_teaching', label: 'یادگیری و یاددهی' },
  { key: 'mgr_self_control', label: 'کنترل فردی' },
]
