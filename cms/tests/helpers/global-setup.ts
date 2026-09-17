import fs from 'fs';
import path from 'path';

export default async function globalSetup(): Promise<void> {
  const dbPath = path.join(__dirname, '..', '..', '.tmp', 'test.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
}
