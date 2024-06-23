const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

const readJSON = (filePath) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error reading file from disk: ${error}`);
    return [];
  }
};

const writeJSON = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON('./data/users.json');

  if (users.find(u => u.username === username)) {
    res.render('signup', { error: 'Username already exists' });
  } else {
    users.push({ username, password });
    writeJSON('./data/users.json', users);
    res.redirect('/');
  }
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = readJSON('./data/users.json');

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    res.redirect('/dashboard');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});

app.get('/dashboard', (req, res) => {
  const products = readJSON('./data/products.json');
  res.render('dashboard', { products });
});

app.get('/product/:id', (req, res) => {
  const products = readJSON('./data/products.json');
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    return res.status(404).send('Product not found');
  }
  res.render('product', { product });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
