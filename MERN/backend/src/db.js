const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const { createSeedDatabase } = require("../data/seed");

const JSON_DB_PATH = path.join(__dirname, "..", "data", "db.json");
let isFallbackMode = false;

const itemSchema = new mongoose.Schema(
  { id: { type: String, required: true, unique: true } },
  { strict: false, versionKey: false }
);

const singletonSchema = new mongoose.Schema(
  { _singleton: { type: String, default: "main", unique: true } },
  { strict: false, versionKey: false }
);

const Setting = mongoose.model("Setting", singletonSchema);
const Meta = mongoose.model("Meta", singletonSchema);

const COLLECTIONS = {
  slides: mongoose.model("Slide", itemSchema),
  certificates: mongoose.model("Certificate", itemSchema),
  demands: mongoose.model("Demand", itemSchema),
  members: mongoose.model("Member", itemSchema),
  circulars: mongoose.model("Circular", itemSchema),
  externalLinks: mongoose.model("ExternalLink", itemSchema),
  documents: mongoose.model("Document", itemSchema),
  payments: mongoose.model("Payment", itemSchema),
  grievances: mongoose.model("Grievance", itemSchema),
  news: mongoose.model("News", itemSchema),
  accessLogs: mongoose.model("AccessLog", itemSchema)
};

function clean(doc) {
  if (!doc) return doc;
  const copy = { ...doc };
  delete copy._id;
  delete copy.__v;
  delete copy._singleton;
  return copy;
}

async function persist(db) {
  db.meta = db.meta || {};
  db.meta.lastUpdated = new Date().toISOString();

  if (isFallbackMode) {
    fs.mkdirSync(path.dirname(JSON_DB_PATH), { recursive: true });
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2), "utf8");
    return;
  }

  await Setting.findOneAndUpdate(
    { _singleton: "main" },
    { ...db.settings, _singleton: "main" },
    { upsert: true, new: true }
  );
  await Meta.findOneAndUpdate(
    { _singleton: "main" },
    { ...db.meta, _singleton: "main" },
    { upsert: true, new: true }
  );

  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    const rows = Array.isArray(db[key]) ? db[key] : [];
    await Model.deleteMany({});
    if (rows.length) {
      await Model.insertMany(rows.map((row) => ({ ...row })), { ordered: true });
    }
  }

  try {
    fs.mkdirSync(path.dirname(JSON_DB_PATH), { recursive: true });
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    // Non-fatal backup write
  }
}

async function loadDb() {
  if (isFallbackMode) {
    if (fs.existsSync(JSON_DB_PATH)) {
      try {
        const raw = fs.readFileSync(JSON_DB_PATH, "utf8");
        const loaded = JSON.parse(raw);
        console.log("Loaded existing data from data/db.json");
        return loaded;
      } catch (err) {
        console.error("Corrupted db.json, reseeding:", err.message);
      }
    }
    const seeded = createSeedDatabase();
    await persist(seeded);
    console.log("Initialized fresh database from seed to data/db.json");
    return seeded;
  }

  const settings = await Setting.findOne({ _singleton: "main" }).lean();
  if (!settings) {
    const seeded = createSeedDatabase();
    await persist(seeded);
    return seeded;
  }
  const meta = await Meta.findOne({ _singleton: "main" }).lean();
  const db = {
    settings: clean(settings),
    meta: clean(meta) || {}
  };
  for (const [key, Model] of Object.entries(COLLECTIONS)) {
    const rows = await Model.find().lean();
    db[key] = rows.map(clean);
  }
  db.circulars = db.circulars || [];
  db.certificates = db.certificates || [];
  db.accessLogs = db.accessLogs || [];
  return db;
}

async function connectMongo() {
  const uri = process.env.MONGO_URI;
  if (uri) {
    try {
      await mongoose.connect(uri);
      console.log("MongoDB: connected using MONGO_URI");
      return;
    } catch (err) {
      console.error("MongoDB: MONGO_URI connection failed:", err.message);
    }
  }

  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/upbms", {
      serverSelectionTimeoutMS: 1800
    });
    console.log("MongoDB: connected to mongodb://127.0.0.1:27017/upbms");
    return;
  } catch (err) {
    console.log("MongoDB: no local server. Starting an embedded MongoDB for this MERN app.");
  }

  try {
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const dbPath = path.join(__dirname, "..", "data", "mongodata");
    fs.mkdirSync(dbPath, { recursive: true });
    let memory;
    try {
      memory = await MongoMemoryServer.create({
        instance: { dbName: "upbms", dbPath, storageEngine: "wiredTiger" }
      });
    } catch (err) {
      memory = await MongoMemoryServer.create({ instance: { dbName: "upbms" } });
    }
    const memoryUri = memory.getUri("upbms");
    await mongoose.connect(memoryUri);
    console.log("MongoDB: embedded instance ready");
    return;
  } catch (err) {
    console.log("MongoDB/MemoryServer initialization unavailable:", err.message);
  }

  console.log("Using persistent JSON database fallback (data/db.json). Fully operational.");
  isFallbackMode = true;
}

module.exports = { connectMongo, loadDb, persist };
