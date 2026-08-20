const major = Number.parseInt(process.versions.node.split(".")[0], 10);

if (major !== 20) {
  console.error(`
❌ Este proyecto requiere Node.js 20 (tenés v${process.versions.node}).

Con nvm (recomendado):
  nvm install 20
  nvm use 20

Sin nvm: instalá Node 20 LTS desde https://nodejs.org

Luego volvé a correr: npm run setup
`);
  process.exit(1);
}
