// Seeds demo data on first run (when the users table is empty).
// `npm run seed:reset` wipes the database and re-seeds it.
import bcrypt from 'bcryptjs'
import db from './db.js'

const H = 3600 * 1000
const ago = (h) => Date.now() - h * H
const day = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

export function seedIfEmpty() {
  if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) return false
  const hash = (p) => bcrypt.hashSync(p, 10)
  const run = db.transaction(() => {
    const addUser = db.prepare('INSERT INTO users VALUES (?,?,?,?,?,?,?)')
    addUser.run('u1', 'Dr. Sarah Malik', 'admin@campus.edu', hash('admin123'), 'Admin', 'HOD', ago(24 * 90))
    addUser.run('u2', 'Usman Tariq', 'mod@campus.edu', hash('mod123'), 'Moderator', '', ago(24 * 60))
    addUser.run('u3', 'Ali Raza', 'student@campus.edu', hash('student123'), 'Student', '', ago(24 * 30))
    addUser.run('u4', 'Ayesha Khan', 'ayesha@campus.edu', hash('ayesha123'), 'Student', '', ago(24 * 20))
    addUser.run('u5', 'Bilal Ahmed', 'headcr@campus.edu', hash('headcr123'), 'Admin', 'Head CR', ago(24 * 80))
    addUser.run('u6', 'Hina Sheikh', 'headgr@campus.edu', hash('headgr123'), 'Admin', 'Head GR', ago(24 * 80))

    const addClub = db.prepare('INSERT INTO clubs VALUES (?,?,?,?,?)')
    ;[
      ['c1', 'Coding Club', '💻', 'Competitive programming, open-source sprints and weekly coding challenges.', 120],
      ['c2', 'Robotics Club', '🤖', 'Build, program and race robots. Hardware nights every Thursday.', 64],
      ['c3', 'AI/ML Society', '🧠', 'Paper reading groups, Kaggle teams and machine learning workshops.', 98],
      ['c4', 'Design Club', '🎨', 'UI/UX, graphic design and product thinking for student projects.', 52],
      ['c5', 'Sports Club', '⚽', 'Cricket, football, futsal and fitness meetups for the department.', 87],
      ['c6', 'Debating Society', '🎤', 'Public speaking, parliamentary debates and inter-university tournaments.', 41]
    ].forEach((c) => addClub.run(...c))

    const join = db.prepare('INSERT INTO memberships VALUES (?,?)')
    ;['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].forEach((c) => { join.run('u1', c); join.run('u5', c); join.run('u6', c) })
    ;[['u2', 'c1'], ['u2', 'c3'], ['u3', 'c1'], ['u3', 'c3'], ['u3', 'c4'], ['u4', 'c2'], ['u4', 'c3'], ['u4', 'c6']].forEach((m) => join.run(...m))
    db.prepare('INSERT INTO moderators VALUES (?,?)').run('u2', 'c1')

    const addPost = db.prepare('INSERT INTO posts (id,club_id,author_id,title,text,link,pinned,created_at) VALUES (?,?,?,?,?,?,?,?)')
    ;[
      ['p1', 'c1', 'u2', 'Weekly LeetCode challenge: Week 12', 'This week: Graph traversal problems. Post your approach in the comments, no spoilers for the hard one until Sunday!', 'https://leetcode.com', 1, ago(5)],
      ['p2', 'c1', 'u3', 'Best resources for learning Rust?', 'I know C++ well and want to pick up Rust for systems programming. Any books or courses you would recommend?', '', 0, ago(20)],
      ['p3', 'c2', 'u4', 'Line follower robot: PID tuning tips', 'Our robot oscillates a lot on sharp turns. Increasing Kd helped a bit but it is still jittery. What values worked for you?', '', 0, ago(30)],
      ['p4', 'c3', 'u4', 'Reading group: Attention Is All You Need', 'We are going through the Transformer paper this Friday. Read sections 1-3 beforehand and bring questions.', 'https://arxiv.org/abs/1706.03762', 0, ago(48)],
      ['p5', 'c4', 'u3', 'Figma vs Penpot for class projects?', 'Our group wants a free tool for the HCI project. Has anyone tried Penpot for real work?', '', 0, ago(60)],
      ['p6', 'c5', 'u1', 'Inter-department cricket trials this Saturday', 'Trials start at 9 AM at the main ground. Bring your own gear and student ID.', '', 0, ago(72)],
      ['p7', 'c6', 'u4', 'Motion: "AI should replace teaching assistants"', 'Practice debate next Wednesday. Sign up in the comments and pick a side: proposition or opposition.', '', 0, ago(100)],
      ['p8', 'c1', 'u3', 'Hackathon team formation thread', 'Looking for 2 teammates (1 frontend, 1 ML) for the upcoming hackathon. Reply here if interested!', '', 0, ago(130)]
    ].forEach((p) => addPost.run(...p))

    const addVote = db.prepare('INSERT INTO votes VALUES (?,?,?)')
    ;[['p1', 24, 1], ['p2', 15, 0], ['p3', 11, 0], ['p4', 32, 2], ['p5', 8, 0], ['p6', 19, 0], ['p7', 13, 3], ['p8', 17, 0]].forEach(([p, up, down]) => {
      for (let i = 0; i < up; i++) addVote.run(p, 'f' + i, 1)
      for (let i = 0; i < down; i++) addVote.run(p, 'g' + i, -1)
    })
    db.prepare('INSERT INTO bookmarks VALUES (?,?)').run('u3', 'p4')

    const addComment = db.prepare('INSERT INTO comments VALUES (?,?,?,?,?,?)')
    ;[
      ['cm1', 'p1', null, 'u3', 'BFS with a visited set worked for me on the first two. Stuck on the third.', ago(4)],
      ['cm2', 'p1', 'cm1', 'u2', 'Try thinking about it as a topological sort. Hint: look at in-degrees.', ago(3)],
      ['cm3', 'p2', null, 'u2', 'The official Rust Book is great and free. Pair it with Rustlings exercises.', ago(18)],
      ['cm4', 'p2', 'cm3', 'u3', 'Thanks, starting tonight!', ago(17)],
      ['cm5', 'p3', null, 'u2', 'Start with Kp only, then add Kd, and keep Ki at zero for line followers.', ago(28)],
      ['cm6', 'p4', null, 'u3', 'Will the session be recorded? I have a lab at that time.', ago(40)],
      ['cm7', 'p4', 'cm6', 'u4', 'Yes, we will share the recording and slides afterwards.', ago(39)],
      ['cm8', 'p5', null, 'u4', 'Penpot works well for basic wireframes. Figma is smoother for prototypes.', ago(55)],
      ['cm9', 'p6', null, 'u3', 'Count me in!', ago(70)],
      ['cm10', 'p7', null, 'u3', 'I will take the opposition side.', ago(90)],
      ['cm11', 'p8', null, 'u4', 'I can help with the ML part. DM me.', ago(120)],
      ['cm12', 'p8', 'cm11', 'u3', 'Awesome, sending you a message now.', ago(118)]
    ].forEach((c) => addComment.run(...c))

    const addAnn = db.prepare('INSERT INTO announcements (id,title,text,label,link,created_at) VALUES (?,?,?,?,?,?)')
    addAnn.run('a1', 'Mid-term exam schedule released', 'The mid-term schedule for all CS courses is now available. Please check your timetable and report clashes before Friday.', 'Exam_Schedule.pdf', 'https://example.com/exam-schedule', ago(10))
    addAnn.run('a2', 'Lab maintenance this weekend', 'Computer labs 1 and 2 will be closed on Saturday for hardware upgrades. Use Lab 3 for assignments.', '', '', ago(50))
    addAnn.run('a3', 'Scholarship applications open', 'Merit scholarship applications for the next semester are open until the end of the month.', 'Scholarship Form', 'https://example.com/scholarship', ago(120))

    const addEvent = db.prepare('INSERT INTO events (id,title,description,date,time,venue) VALUES (?,?,?,?,?,?)')
    addEvent.run('e1', 'Annual Hackathon 2026', '24-hour hackathon with prizes. Teams of up to 4.', day(3), '09:00', 'Main Auditorium')
    addEvent.run('e2', 'AI Workshop: Intro to Transformers', 'Hands-on session with Python notebooks. Bring your laptop.', day(7), '14:00', 'Lab 3')
    addEvent.run('e3', 'Robotics Showcase', 'Demo of semester robotics projects, open to all students.', day(12), '11:00', 'Engineering Hall')
    addEvent.run('e4', 'Freshers Welcome Meetup', 'Welcome event for new CS students with club stalls.', day(-14), '10:00', 'Cafeteria Lawn')
    addEvent.run('e5', 'Career Talk: Software Industry', 'Alumni panel on software careers.', day(-6), '15:00', 'Seminar Room 2')

    db.prepare('INSERT INTO club_requests (id,name,description,reason,user_id,created_at) VALUES (?,?,?,?,?,?)')
      .run('r1', 'Cybersecurity Club', 'CTF competitions and security awareness workshops.', 'Many students are interested in security and there is no club for it yet.', 'u4', ago(8))
  })
  run()
  return true
}

if (process.argv.includes('--reset')) {
  db.pragma('foreign_keys = OFF')
  ;['votes', 'bookmarks', 'comments', 'posts', 'moderators', 'memberships', 'club_requests', 'announcements', 'events', 'clubs', 'users'].forEach((t) => db.exec(`DELETE FROM ${t}`))
  db.pragma('foreign_keys = ON')
  seedIfEmpty()
  console.log('Database reset and re-seeded.')
}
