import { app } from "./app.js";
import { env } from "./core/config.js";
import { connectToDatabase } from "./core/db.js";
import { logInfo } from "./core/logger.js";

await connectToDatabase();

app.listen(env.PORT, () => {
  logInfo(`Server running on port ${env.PORT}`);
});
