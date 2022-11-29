const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const app = express();

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'));

const mysql = require('mysql2');
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'cosas'
}).promise();

async function save(entry) {
    try {
        const { tipo, razon, monto, fecha } = entry;
        const [resultSetHeader, ] = await connection.query(
            'INSERT INTO entries (tipo, razon, monto, fecha) VALUES (?,?,?,?)',
            [tipo, razon, monto, fecha]
        );
        return resultSetHeader;
    } catch (e) {
        console.error('Error:', e);
        return [];
    }
}

async function update(entry) {
    try {
        const { tipo, razon, monto, id, fecha } = entry;
        const [resultSetHeader, ] = await connection.query(
            'UPDATE entries SET tipo = ?, razon = ?, monto = ?, fecha = ? WHERE id = ?',
            [tipo, razon, monto, fecha, id]
        );
        return resultSetHeader;
    } catch (e) {
        console.error('Error:', e);
        return [];
    }
}

async function deleteById(id) {
    try {
        const [ result, ] = await connection.query(
            'DELETE FROM entries WHERE id = ?',
            [id]
        );
        return result;
    } catch (e) {
        console.error('Error:', e);
        return [];
    }
}

async function loadAll() {
    try {
        const [ results, ] = await connection.query(
            'SELECT * from entries'
        );
        return results;
    } catch (e) {
        console.error('Error:', e);
        return [];
    }
}
app.get('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const entries = await loadAll();
    res.writeHead(200);
    res.end(JSON.stringify(entries));
});

app.post('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const newEntry = req.body;
    const result = await save(newEntry);
    res.writeHead(200);
    res.end(JSON.stringify(result));
});

app.put('/', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    const modifiedEntry = req.body;
    const result = await update(modifiedEntry);
    res.writeHead(200);
    res.end(JSON.stringify(result));
});

app.delete('/:id', async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const result = await deleteById(Number(req.params.id));
    res.send(result);
})

app.options('*', (req, res) => {
    // https://stackoverflow.com/a/29954326/406343
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.end();
})
  
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))
