const mongoose = require("mongoose");

// Reuse a single connection across warm Lambda invocations. Mongoose caches on
// the module, but we also stash it on `global` so it survives module reloads
// within the same execution environment.
let cached = global.__mongooseConn;
if (!cached) cached = global.__mongooseConn = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    // Buffering off so queries fail fast instead of hanging a whole Lambda
    // invocation when the DB is unreachable.
    mongoose.set("bufferCommands", false);

    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 8000,
        maxPoolSize: 5,
      })
      .then((m) => {
        console.log("MongoDB connected");
        return m;
      })
      .catch((err) => {
        // Reset so the next invocation can retry a fresh connection.
        cached.promise = null;
        console.error("MongoDB error:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
