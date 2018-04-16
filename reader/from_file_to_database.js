const sql = require("msnodesqlv8");
const fs = require("fs");

const caminhoDaPasta = "\\\\forticlient\\C$\\OCR\\scripts";
const conexao_local = "server=.;Database=master;Uid=sa;Pwd=sa;Driver={SQL Server Native Client 11.0}";
const conexao_producao = "server=10.100.100.48\\APP;Database=Horus;Uid=horus;Pwd=hrs;Driver={SQL Server Native Client 11.0}";

//srv-sqlprod

var todosOsArquivos = fs.readdirSync(caminhoDaPasta);

let queries = [];
todosOsArquivos.map((arquivo) => {
  const query = fs.readFileSync(`${caminhoDaPasta}\\${arquivo}`, "utf8");
  queries.push(query);
});
// let arquivos = todosOsArquivos.splice(index, index+10);
// arquivos.forEach(arquivo => {
//   queries = + fs.readFileSync(`${caminhoDaPasta}\\${arquivo}`, "utf8");
// });

function executarSql(query) {
  sql.query(conexao_producao, query, (err, rows) => {
    console.log(rows);
    console.log(err);
  });
}
// var arquivo = fs.readFileSync(path[, options])