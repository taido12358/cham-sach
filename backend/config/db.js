// JSON-based database cho demo nhanh
// Toàn bộ dữ liệu lưu trong data/db.json, load vào RAM khi start, flush mỗi khi write

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, '..', 'data', 'db.json');

let data = null;

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('⚠️  Không đọc được db.json, dùng empty db:', err.message);
  }
  return { users: [], books: [], reviews: [] };
}

function save() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  console.log(`💾 db.json đã ghi (${data.users?.length || 0}U/${data.books?.length || 0}B/${data.reviews?.length || 0}R)`);
}

function matchFilter(filter) {
  return (doc) => {
    for (const [key, value] of Object.entries(filter)) {
      // Hỗ trợ dot-notation đơn giản: "author.name"
      if (key.includes('.')) {
        const parts = key.split('.');
        let v = doc;
        for (const p of parts) v = v?.[p];
        if (v !== value) return false;
      } else if (doc[key] !== value) {
        return false;
      }
    }
    return true;
  };
}

function collection(name) {
  if (!data[name]) data[name] = [];

  return {
    all: () => data[name],

    find: (filter = {}) => data[name].filter(matchFilter(filter)),

    findOne: (filter = {}) => data[name].find(matchFilter(filter)),

    findById: (id) => data[name].find(d => d._id === id),

    insert: (doc) => {
      const newDoc = {
        _id: randomUUID(),
        ...doc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data[name].push(newDoc);
      save();
      return newDoc;
    },

    update: (id, patch) => {
      const idx = data[name].findIndex(d => d._id === id);
      if (idx === -1) return null;
      data[name][idx] = {
        ...data[name][idx],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      save();
      return data[name][idx];
    },

    delete: (id) => {
      const idx = data[name].findIndex(d => d._id === id);
      if (idx === -1) return false;
      data[name].splice(idx, 1);
      save();
      return true;
    },

    count: (filter = {}) => data[name].filter(matchFilter(filter)).length
  };
}

export const db = {
  collection,
  init: async () => {
    data = load();
    // Tự seed nếu db trống
    if (!data.users || data.users.length === 0) {
      console.log('📦 Database trống — đang seed dữ liệu mẫu…');
      const { seedInitialData } = await import('../seed.js');
      await seedInitialData();
      data = load(); // reload sau khi seed
    }
    console.log(`✅ Database ready: ${data.users?.length || 0} users, ${data.books?.length || 0} books, ${data.reviews?.length || 0} reviews`);
  },
  save,
  reload: () => { data = load(); }
};

// Helper populate — thay cho Mongoose .populate()
export function populate(doc, field, collectionName, selectFields = null) {
  if (!doc) return doc;
  const id = doc[field];
  if (!id) return doc;

  const related = collection(collectionName).findById(id);
  if (!related) return { ...doc, [field]: null };

  let populated = related;
  if (selectFields) {
    populated = { _id: related._id };
    selectFields.forEach(f => { populated[f] = related[f]; });
  }
  return { ...doc, [field]: populated };
}
