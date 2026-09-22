import db from '@/lib/db'

export interface CourseRecord {
  id: number
  title: string
  slug: string
  course_type?: string
  status?: string
  level?: string
  short_description?: string | null
  description?: string | null
  language?: string
  pricing_type?: 'free' | 'paid'
  price?: number
  discount?: number
  discount_price?: number | null
  thumbnail?: string | null
  banner?: string | null
  preview?: string | null
  instructor_id?: number
  course_category_id?: number
  created_at?: string
  updated_at?: string
  // Virtual / joined fields
  category_title?: string
  instructor_name?: string
  instructor_photo?: string
  enrollments_count?: number
}

export interface SectionRecord {
  id: number
  title: string
  sort: number
  course_id: number
  lessons: LessonRecord[]
}

export interface LessonRecord {
  id: number
  title: string
  sort: number
  status?: string
  lesson_type?: string
  lesson_src?: string | null
  duration?: string | null
  is_free?: number
  description?: string | null
  course_section_id: number
}

export const courseRepository = {
  listAll(options: {
    categorySlug?: string
    search?: string
    status?: string
    limit?: number
    offset?: number
    instructorId?: number
  } = {}): { courses: CourseRecord[]; total: number } {
    let whereClause = '1=1'
    const params: (string | number)[] = []

    if (options.status) {
      whereClause += ' AND c.status = ?'
      params.push(options.status)
    }

    if (options.instructorId) {
      whereClause += ' AND c.instructor_id = ?'
      params.push(options.instructorId)
    }

    if (options.categorySlug && options.categorySlug !== 'all') {
      whereClause += ' AND cat.slug = ?'
      params.push(options.categorySlug)
    }

    if (options.search) {
      whereClause += ' AND (c.title LIKE ? OR c.short_description LIKE ?)'
      params.push(`%${options.search}%`, `%${options.search}%`)
    }

    const countStmt = db.prepare(
      `SELECT COUNT(*) as count 
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       WHERE ${whereClause}`
    )
    const countRow = countStmt.get(...(params as unknown[])) as { count: number } | undefined
    const total = countRow?.count ?? 0

    const limit = options.limit || 20
    const offset = options.offset || 0

    const listStmt = db.prepare(
      `SELECT c.id, c.title, c.slug, c.level, c.price, c.discount, c.discount_price,
              c.pricing_type, c.thumbnail, c.short_description, c.status, c.created_at,
              cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id = c.id) as enrollments_count
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       LEFT JOIN instructors inst ON c.instructor_id = inst.id
       LEFT JOIN users u ON inst.user_id = u.id
       WHERE ${whereClause}
       ORDER BY c.id DESC
       LIMIT ? OFFSET ?`
    )
    const courses = listStmt.all(...params, limit, offset) as CourseRecord[]

    return { courses, total }
  },

  findBySlug(slug: string): CourseRecord | undefined {
    const stmt = db.prepare<[string], CourseRecord>(
      `SELECT c.*, cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo, u.email as instructor_email,
              (SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id = c.id) as enrollments_count
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       LEFT JOIN instructors inst ON c.instructor_id = inst.id
       LEFT JOIN users u ON inst.user_id = u.id
       WHERE c.slug = ?`
    )
    return stmt.get(slug)
  },

  findById(id: number): CourseRecord | undefined {
    const stmt = db.prepare<[number], CourseRecord>(
      `SELECT c.*, cat.title as category_title,
              u.name as instructor_name, u.photo as instructor_photo,
              (SELECT COUNT(*) FROM course_enrollments e WHERE e.course_id = c.id) as enrollments_count
       FROM courses c
       LEFT JOIN course_categories cat ON c.course_category_id = cat.id
       LEFT JOIN instructors inst ON c.instructor_id = inst.id
       LEFT JOIN users u ON inst.user_id = u.id
       WHERE c.id = ?`
    )
    return stmt.get(id)
  },

  getCurriculum(courseId: number): SectionRecord[] {
    const sectionsStmt = db.prepare<[number], SectionRecord>(
      'SELECT id, title, sort, course_id FROM course_sections WHERE course_id = ? ORDER BY sort ASC, id ASC'
    )
    const sections = sectionsStmt.all(courseId)

    const lessonsStmt = db.prepare<[number], LessonRecord>(
      'SELECT id, title, sort, status, lesson_type, lesson_src, duration, is_free, course_section_id FROM section_lessons WHERE course_section_id = ? ORDER BY sort ASC, id ASC'
    )

    for (const sec of sections) {
      sec.lessons = lessonsStmt.all(sec.id)
    }

    return sections
  },

  isEnrolled(userId: number, courseId: number): boolean {
    const stmt = db.prepare(
      'SELECT COUNT(*) as count FROM course_enrollments WHERE user_id = ? AND course_id = ?'
    )
    const row = stmt.get(userId, courseId) as { count: number } | undefined
    return (row?.count ?? 0) > 0
  },

  enroll(userId: number, courseId: number, type: string = 'free'): boolean {
    if (this.isEnrolled(userId, courseId)) return true

    const now = new Date().toISOString()
    const stmt = db.prepare(
      `INSERT INTO course_enrollments (enrollment_type, entry_date, user_id, course_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    stmt.run(type, now, userId, courseId, now, now)
    return true
  },

  create(course: Partial<CourseRecord>): CourseRecord {
    const now = new Date().toISOString()
    const stmt = db.prepare(
      `INSERT INTO courses (title, slug, course_type, level, pricing_type, price, discount, discount_price, short_description, description, thumbnail, instructor_id, course_category_id, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const result = stmt.run(
      course.title,
      course.slug,
      course.course_type || 'general',
      course.level || 'All Levels',
      course.pricing_type || 'free',
      course.price || 0,
      course.discount ? 1 : 0,
      course.discount_price || null,
      course.short_description || '',
      course.description || '',
      course.thumbnail || null,
      course.instructor_id || 1,
      course.course_category_id || 2,
      course.status || 'approved',
      now,
      now
    )
    return this.findById(Number(result.lastInsertRowid))!
  },

  update(id: number, updates: Partial<CourseRecord>): CourseRecord | undefined {
    const fields: string[] = []
    const values: (string | number | null)[] = []

    for (const [key, value] of Object.entries(updates)) {
      if (['title', 'slug', 'level', 'pricing_type', 'price', 'discount', 'discount_price', 'short_description', 'description', 'thumbnail', 'status'].includes(key)) {
        fields.push(`${key} = ?`)
        values.push(value as string | number | null)
      }
    }

    if (fields.length === 0) return this.findById(id)

    fields.push('updated_at = ?')
    values.push(new Date().toISOString())
    values.push(id)

    db.prepare(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`).run(...values)
    return this.findById(id)
  },

  delete(id: number): boolean {
    const result = db.prepare('DELETE FROM courses WHERE id = ?').run(id)
    return result.changes > 0
  },
}
