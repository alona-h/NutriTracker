const fs   = require('fs');
const path = require('path');

const envFiles = ['.env.local', '.env'];
for (const file of envFiles) {
  const p = path.join(__dirname, '..', file);
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
    break;
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set (in .env.local, .env, or the shell environment).');
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}',
};
`;

const dir = path.join(__dirname, '..', 'src', 'environments');

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'environment.ts'), content);
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), content);

console.log('environment.ts generated successfully');
