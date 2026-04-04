const fs = require('fs');
const path = require('path');

const content = `export const environment = {
  production: true,
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_ANON_KEY}',
};
`;

const dir = path.join(__dirname, '..', 'src', 'environments');

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'environment.ts'), content);
fs.writeFileSync(path.join(dir, 'environment.prod.ts'), content);

console.log('environment.ts generated successfully');