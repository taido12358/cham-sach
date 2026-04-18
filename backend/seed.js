// Seed dữ liệu mẫu vào data/db.json
// Chạy tự động khi db trống. Có thể chạy tay: node seed.js

import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, 'data', 'db.json');

const nowISO = () => new Date().toISOString();
const genId = () => randomUUID();

export async function seedInitialData() {
  const adminHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const users = [
    {
      _id: genId(),
      name: 'Cô Hạnh', email: 'admin@daiphuc.edu.vn', password: adminHash,
      role: 'admin', className: 'GV', avatar: '', bio: 'Giáo viên chủ nhiệm CLB Sách',
      stats: { booksRead: 0, reviewsWritten: 0, xp: 0, level: 1, streak: 0, lastCheckin: null },
      badges: [], savedBooks: [],
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      name: 'Nguyễn Minh Anh', email: 'minhanh@student.edu.vn', password: studentHash,
      role: 'student', className: '8A', avatar: '', bio: '',
      stats: { booksRead: 8, reviewsWritten: 4, xp: 820, level: 4, streak: 12, lastCheckin: nowISO() },
      badges: [{ name: 'Bạn đồng hành', earnedAt: nowISO() }],
      savedBooks: [],
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      name: 'Trần Hoàng Long', email: 'hoanglong@student.edu.vn', password: studentHash,
      role: 'student', className: '9B', avatar: '', bio: '',
      stats: { booksRead: 6, reviewsWritten: 3, xp: 680, level: 3, streak: 7, lastCheckin: nowISO() },
      badges: [{ name: 'Bạn đồng hành', earnedAt: nowISO() }],
      savedBooks: [],
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      name: 'Phạm Bảo Hân', email: 'baohan@student.edu.vn', password: studentHash,
      role: 'student', className: '7C', avatar: '', bio: '',
      stats: { booksRead: 5, reviewsWritten: 3, xp: 620, level: 3, streak: 5, lastCheckin: nowISO() },
      badges: [], savedBooks: [],
      createdAt: nowISO(), updatedAt: nowISO()
    }
  ];

  const adminId = users[0]._id;

  const books = [
    {
      _id: genId(),
      title: 'Dế Mèn Phiêu Lưu Ký', author: 'Tô Hoài',
      category: 'literature', coverColor: '#1F3A2D',
      summary: 'Dế Mèn Phiêu Lưu Ký là câu chuyện về chú dế trẻ tuổi kiêu ngạo, tự mãn, từng gây ra cái chết của Dế Choắt hàng xóm. Sau bi kịch ấy, Dế Mèn quyết định lên đường phiêu lưu, kết bạn với Dế Trũi, gặp gỡ nhiều loài vật, trải qua đủ thử thách và hiểm nguy. Qua mỗi chuyến đi, Dế Mèn trưởng thành hơn, bớt kiêu ngạo, biết thương yêu đồng loại và mơ về một thế giới hòa bình. Câu chuyện không chỉ là hành trình của một chú dế mà còn là ẩn dụ đẹp về sự trưởng thành, tình bạn và khát vọng hòa bình.',
      excerpt: '', tags: ['thiếu nhi', 'phiêu lưu', 'trưởng thành'],
      featured: true, readCount: 142, ratingAvg: 4.8, ratingCount: 28,
      legalLinks: [], addedBy: adminId,
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      title: 'Nhật Ký Đặng Thùy Trâm', author: 'Đặng Thùy Trâm',
      category: 'history', coverColor: '#6B1F1F',
      summary: 'Cuốn nhật ký được tìm thấy hơn 30 năm sau khi bác sĩ Đặng Thùy Trâm hy sinh tại chiến trường Quảng Ngãi năm 1970, khi chị mới 27 tuổi. Những trang nhật ký ghi lại cuộc sống của một nữ bác sĩ trẻ giữa bom đạn: công việc cứu chữa thương binh, tình yêu tuổi trẻ dang dở, nỗi nhớ gia đình, và niềm tin mãnh liệt vào lý tưởng. Đọc cuốn sách này, ta gặp một tâm hồn trong sáng và một thế hệ sẵn sàng hy sinh tất cả cho Tổ quốc.',
      excerpt: '', tags: ['lịch sử', 'chiến tranh', 'hồi ký'],
      featured: true, readCount: 89, ratingAvg: 4.9, ratingCount: 15,
      legalLinks: [], addedBy: adminId,
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      title: 'Hoàng Tử Bé', author: 'Antoine de Saint-Exupéry',
      category: 'children', coverColor: '#1E3A5F',
      summary: 'Hoàng Tử Bé kể về cuộc gặp gỡ giữa một phi công bị rơi máy bay giữa sa mạc Sahara và một cậu bé đến từ tiểu hành tinh B-612. Qua những câu chuyện mà Hoàng Tử Bé kể về hành trình của mình, cuốn sách trở thành một ẩn dụ sâu sắc về tình yêu, sự mất mát, và cách người lớn đánh mất trí tưởng tượng. Câu nổi tiếng "Điều cốt lõi là vô hình với đôi mắt" đã trở thành châm ngôn cho nhiều thế hệ độc giả.',
      excerpt: 'Điều cốt lõi là vô hình với đôi mắt. Người ta chỉ có thể nhìn thấy đúng đắn bằng trái tim.',
      tags: ['triết lý', 'thiếu nhi', 'kinh điển'],
      featured: false, readCount: 178, ratingAvg: 4.9, ratingCount: 42,
      legalLinks: [], addedBy: adminId,
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      title: 'Đắc Nhân Tâm', author: 'Dale Carnegie',
      category: 'skills', coverColor: '#2D3748',
      summary: 'Đắc Nhân Tâm là một trong những cuốn sách bán chạy nhất mọi thời đại về kỹ năng giao tiếp và ứng xử. Dale Carnegie đúc kết những nguyên tắc cốt lõi để chinh phục lòng người: tránh phê phán gay gắt, thành thật khen ngợi, quan tâm đến người khác, luôn mỉm cười, ghi nhớ tên người, lắng nghe để người khác cảm thấy quan trọng.',
      excerpt: '', tags: ['kỹ năng sống', 'giao tiếp'],
      featured: false, readCount: 203, ratingAvg: 4.6, ratingCount: 51,
      legalLinks: [], addedBy: adminId,
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      title: 'Cho Tôi Xin Một Vé Đi Tuổi Thơ', author: 'Nguyễn Nhật Ánh',
      category: 'literature', coverColor: '#8B6914',
      summary: 'Qua lời kể của nhân vật cu Mùi, Nguyễn Nhật Ánh đưa người đọc trở về với tuổi thơ trong trẻo của lứa trẻ em những năm 70-80, với những trò chơi, nỗi sợ, niềm vui và cả những "dự án" kỳ cục. Mỗi chương là một lát cắt đáng yêu và cười ra nước mắt. Nhưng đằng sau tiếng cười là nỗi buồn mênh mông của người lớn khi nhận ra tuổi thơ đã mãi mãi trôi qua.',
      excerpt: '', tags: ['tuổi thơ', 'hoài niệm'],
      featured: false, readCount: 256, ratingAvg: 4.7, ratingCount: 63,
      legalLinks: [], addedBy: adminId,
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(),
      title: 'Tuổi Thơ Dữ Dội', author: 'Phùng Quán',
      category: 'history', coverColor: '#44403c',
      summary: 'Tuổi Thơ Dữ Dội tái hiện cuộc đời của những em thiếu niên trinh sát trong đội Vệ Quốc Đoàn ở chiến trường Bình Trị Thiên thời kháng chiến chống Pháp. Các nhân vật là những cậu bé mới mười ba, mười bốn tuổi nhưng đã dấn thân vào cuộc chiến với tất cả tinh thần trong sáng và quyết liệt. Qua từng trang sách, Phùng Quán vừa kể chuyện chiến tranh vừa viết một bản tình ca về tuổi thơ.',
      excerpt: '', tags: ['lịch sử', 'chiến tranh'],
      featured: false, readCount: 94, ratingAvg: 4.8, ratingCount: 21,
      legalLinks: [], addedBy: adminId,
      createdAt: nowISO(), updatedAt: nowISO()
    }
  ];

  const reviews = [
    {
      _id: genId(), book: books[0]._id, author: users[1]._id,
      title: 'Một hành trình trưởng thành đáng nhớ',
      content: 'Đọc xong mình mới hiểu tại sao sách này được đọc cả trăm năm vẫn hay. Dế Mèn từ một chú dế kiêu ngạo trưởng thành qua từng chuyến đi, và mỗi người bạn đồng hành đều dạy cậu một bài học. Mình thích nhất đoạn Dế Mèn gặp Dế Trũi — tình bạn ấy đẹp và thật. Cuốn sách cũng khiến mình ngẫm về sự khiêm tốn.',
      rating: 5, status: 'approved', featured: false,
      reactions: { inspired: [users[2]._id], moved: [], thoughtful: [users[3]._id], fun: [] },
      comments: [],
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(), book: books[1]._id, author: users[2]._id,
      title: 'Tuổi hai mươi bảy và những điều còn mãi',
      content: 'Cuốn nhật ký làm mình khóc nhiều lần. Chị Trâm mới 27 tuổi khi hy sinh — bằng tuổi chị họ mình bây giờ. Mình trân trọng hơn mỗi ngày đang sống, và biết ơn những người đã viết nên hòa bình. Những trang chị viết về đồng đội, về gia đình, về lý tưởng khiến mình thấy bản thân cần sống có ích hơn.',
      rating: 5, status: 'approved', featured: true,
      reactions: { inspired: [users[1]._id, users[3]._id], moved: [users[1]._id, users[3]._id], thoughtful: [users[1]._id], fun: [] },
      comments: [],
      createdAt: nowISO(), updatedAt: nowISO()
    },
    {
      _id: genId(), book: books[2]._id, author: users[3]._id,
      title: 'Sách mỏng mà nhiều điều cần ngẫm',
      content: '"Điều cốt lõi là vô hình với đôi mắt" — câu này mình đọc xong ngồi ngẫm cả buổi. Sách mỏng nhưng chứa nhiều điều người lớn cũng cần học. Mình đặc biệt thích đoạn con cáo dạy Hoàng Tử Bé về việc "thuần hóa" nhau — hóa ra tình bạn cũng cần thời gian và sự kiên nhẫn.',
      rating: 5, status: 'approved', featured: false,
      reactions: { inspired: [users[1]._id], moved: [], thoughtful: [users[1]._id, users[2]._id], fun: [] },
      comments: [],
      createdAt: nowISO(), updatedAt: nowISO()
    }
  ];

  const dbData = { users, books, reviews };
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2));

  console.log(`✨ Đã seed: ${users.length} users, ${books.length} books, ${reviews.length} reviews`);
  console.log(`   Admin: admin@daiphuc.edu.vn / admin123`);
  console.log(`   Student: minhanh@student.edu.vn / student123`);
}

// Cho phép chạy trực tiếp: node seed.js (reset toàn bộ data)
if (import.meta.url === `file://${process.argv[1]}`) {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('🧹 Đã xóa db.json cũ');
  }
  seedInitialData().then(() => process.exit(0));
}
